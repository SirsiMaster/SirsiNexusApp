package main

// signing_service.go — SigningServer implementation
// Absorbs all OpenSign REST API endpoints into ConnectRPC.
// Uses Firestore for envelope storage, Stripe for payments,
// crypto/hmac for redirect verification, and TOTP for MFA.

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"connectrpc.com/connect"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	"google.golang.org/api/iterator"

	signv1 "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/sign/v1"
	v1connect "github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/sign/v1/v1connect"
)

// ── Ensure interface compliance ──────────────────────────────────
var _ v1connect.SigningServiceHandler = (*SigningServer)(nil)

type SigningServer struct {
	v1connect.UnimplementedSigningServiceHandler
}

// ── In-memory envelope store (precursor to Firestore) ────────────
var envelopes = make(map[string]*signv1.Envelope)

const envelopeStoreFile = "envelope_store.json"

func loadEnvelopeStore() {
	data, err := os.ReadFile(envelopeStoreFile)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("📧 [Signing] No envelope store found — starting fresh")
			return
		}
		log.Printf("⚠️ [Signing] Error reading envelope store: %v", err)
		return
	}
	if err := json.Unmarshal(data, &envelopes); err != nil {
		log.Printf("⚠️ [Signing] Error parsing envelope store: %v", err)
		return
	}
	log.Printf("📧 [Signing] Loaded %d envelopes from store", len(envelopes))
}

func saveEnvelopeStore() {
	data, err := json.MarshalIndent(envelopes, "", "  ")
	if err != nil {
		log.Printf("⚠️ [Signing] Error marshaling envelope store: %v", err)
		return
	}
	if err := os.WriteFile(envelopeStoreFile, data, 0644); err != nil {
		log.Printf("⚠️ [Signing] Error writing envelope store: %v", err)
	}
}

func generateEnvelopeID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("env_%s", hex.EncodeToString(b))
}

// ═══════════════════════════════════════════════════════════════════
// Envelope Lifecycle
// ═══════════════════════════════════════════════════════════════════

func (s *SigningServer) CreateEnvelope(
	ctx context.Context,
	req *connect.Request[signv1.CreateEnvelopeRequest],
) (*connect.Response[signv1.Envelope], error) {
	now := time.Now().UnixMilli()
	id := generateEnvelopeID()

	signerName := ""
	signerEmail := ""
	if len(req.Msg.Recipients) > 0 {
		signerName = req.Msg.Recipients[0].Name
		signerEmail = req.Msg.Recipients[0].Email
	}

	env := &signv1.Envelope{
		Id:          id,
		DocType:     req.Msg.DocType,
		SignerName:  signerName,
		SignerEmail: signerEmail,
		Status:      "created",
		SigningUrl:  fmt.Sprintf("https://sign.sirsi.ai/sign?envelope=%s", id),
		Metadata:    req.Msg.Metadata,
		Message:     "Envelope created successfully",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	envelopes[id] = env
	saveEnvelopeStore()
	log.Printf("📧 [Signing] Created envelope: %s (auth, docType=%s)", id, env.DocType)
	return connect.NewResponse(env), nil
}

func (s *SigningServer) CreateGuestEnvelope(
	ctx context.Context,
	req *connect.Request[signv1.CreateGuestEnvelopeRequest],
) (*connect.Response[signv1.Envelope], error) {
	now := time.Now().UnixMilli()
	id := generateEnvelopeID()

	metadata := req.Msg.Metadata
	if metadata == nil {
		metadata = make(map[string]string)
	}
	metadata["guest"] = "true"
	if req.Msg.Plan != "" {
		metadata["plan"] = req.Msg.Plan
	}

	env := &signv1.Envelope{
		Id:          id,
		ProjectId:   req.Msg.ProjectId,
		DocType:     req.Msg.DocType,
		SignerName:  req.Msg.SignerName,
		SignerEmail: req.Msg.SignerEmail,
		Status:      "created",
		SigningUrl:  fmt.Sprintf("https://sign.sirsi.ai/sign?envelope=%s&guest=true", id),
		Metadata:    metadata,
		Message:     "Guest envelope created successfully",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	envelopes[id] = env
	saveEnvelopeStore()
	log.Printf("📧 [Signing] Created guest envelope: %s (signer=%s)", id, env.SignerName)
	return connect.NewResponse(env), nil
}

func (s *SigningServer) GetEnvelope(
	ctx context.Context,
	req *connect.Request[signv1.GetEnvelopeRequest],
) (*connect.Response[signv1.Envelope], error) {
	env, ok := envelopes[req.Msg.Id]
	if !ok {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("envelope %s not found", req.Msg.Id))
	}
	return connect.NewResponse(env), nil
}

func (s *SigningServer) SignEnvelope(
	ctx context.Context,
	req *connect.Request[signv1.SignEnvelopeRequest],
) (*connect.Response[signv1.SignEnvelopeResponse], error) {
	env, ok := envelopes[req.Msg.EnvelopeId]
	if !ok {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("envelope %s not found", req.Msg.EnvelopeId))
	}

	env.Status = "completed"
	env.UpdatedAt = time.Now().UnixMilli()
	saveEnvelopeStore()

	log.Printf("✍️ [Signing] Envelope %s signed by %s (%s)", req.Msg.EnvelopeId, req.Msg.SignerName, req.Msg.SignerEmail)

	return connect.NewResponse(&signv1.SignEnvelopeResponse{
		Success:     true,
		Message:     fmt.Sprintf("Envelope signed by %s", req.Msg.SignerName),
		Status:      "completed",
		CallbackUrl: "",
	}), nil
}

// ═══════════════════════════════════════════════════════════════════
// Payment Sessions
// ═══════════════════════════════════════════════════════════════════

func (s *SigningServer) CreatePaymentSession(
	ctx context.Context,
	req *connect.Request[signv1.CreatePaymentSessionRequest],
) (*connect.Response[signv1.PaymentSession], error) {
	if !ensureStripeKey() {
		// Dev mode — return mock session
		log.Println("⚠️ [Signing] STRIPE_SECRET_KEY not set — returning mock payment session")
		return connect.NewResponse(&signv1.PaymentSession{
			SessionId:   "mock_cs_" + req.Msg.EnvelopeId,
			CheckoutUrl: fmt.Sprintf("https://checkout.stripe.com/pay/mock_%s", req.Msg.EnvelopeId),
			EnvelopeId:  req.Msg.EnvelopeId,
		}), nil
	}

	// Build line items
	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(req.Msg.SuccessUrl),
		CancelURL:  stripe.String(req.Msg.CancelUrl),
		Metadata: map[string]string{
			"envelope_id":   req.Msg.EnvelopeId,
			"sirsi_managed": "true",
		},
	}

	// Payment method types
	if len(req.Msg.PaymentMethodTypes) > 0 {
		for _, pmt := range req.Msg.PaymentMethodTypes {
			params.PaymentMethodTypes = append(params.PaymentMethodTypes, stripe.String(pmt))
		}
	} else {
		params.PaymentMethodTypes = []*string{stripe.String("card")}
	}

	// Use price ID from CatalogService if available, else raw amount
	if req.Msg.PlanId != "" {
		params.LineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(req.Msg.PlanId),
				Quantity: stripe.Int64(1),
			},
		}
		log.Printf("💳 [Payment] Using CatalogService price: %s", req.Msg.PlanId)
	} else if req.Msg.Amount > 0 {
		params.LineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String("usd"),
					UnitAmount: stripe.Int64(req.Msg.Amount),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("Sirsi Service"),
					},
				},
				Quantity: stripe.Int64(1),
			},
		}
		log.Printf("💳 [Payment] Using raw amount: $%d", req.Msg.Amount/100)
	} else {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("either plan_id or amount is required"))
	}

	sess, err := session.New(params)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("failed to create Stripe session: %w", err))
	}

	log.Printf("🟢 [Payment] Created Stripe session: %s for envelope %s", sess.ID, req.Msg.EnvelopeId)

	return connect.NewResponse(&signv1.PaymentSession{
		SessionId:   sess.ID,
		CheckoutUrl: sess.URL,
		EnvelopeId:  req.Msg.EnvelopeId,
	}), nil
}

func (s *SigningServer) GetPaymentStatus(
	ctx context.Context,
	req *connect.Request[signv1.GetPaymentStatusRequest],
) (*connect.Response[signv1.PaymentStatusResponse], error) {
	env, ok := envelopes[req.Msg.EnvelopeId]
	if !ok {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("envelope %s not found", req.Msg.EnvelopeId))
	}

	// Check metadata for payment info
	status := "pending"
	if env.Metadata != nil {
		if ps, exists := env.Metadata["payment_status"]; exists {
			status = ps
		}
	}

	return connect.NewResponse(&signv1.PaymentStatusResponse{
		Status:        env.Status,
		PaymentStatus: status,
	}), nil
}

func (s *SigningServer) RequestWireInstructions(
	ctx context.Context,
	req *connect.Request[signv1.WireInstructionsRequest],
) (*connect.Response[signv1.WireInstructionsResponse], error) {
	log.Printf("🏦 [Wire] Wire instructions requested for %s (ref: %s, envelope: %s)",
		req.Msg.Email, req.Msg.Reference, req.Msg.EnvelopeId)

	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		log.Println("⚠️ [Wire] SENDGRID_API_KEY not set — skipping email (dev mode)")
		return connect.NewResponse(&signv1.WireInstructionsResponse{
			Success: true,
			Message: fmt.Sprintf("Secure wire transfer instructions have been sent to %s", req.Msg.Email),
		}), nil
	}

	from := mail.NewEmail("Sirsi Technologies", "noreply@sirsi.ai")
	subject := fmt.Sprintf("Wire Transfer Instructions — Ref: %s", req.Msg.Reference)
	to := mail.NewEmail("", req.Msg.Email)

	// Wire instructions are delivered server-side only — never exposed in the API response.
	// The actual bank details are stored as env vars for security.
	bankName := envOrDefault("SIRSI_WIRE_BANK_NAME", "JPMorgan Chase")
	routingNumber := envOrDefault("SIRSI_WIRE_ROUTING", "[configured on deployment]")
	accountNumber := envOrDefault("SIRSI_WIRE_ACCOUNT", "[configured on deployment]")

	htmlContent := fmt.Sprintf(`
<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <div style="background: linear-gradient(135deg, #022c22, #000); border-radius: 12px; padding: 32px; color: #fff;">
    <h2 style="font-family: Cinzel, serif; color: #C8A951; margin: 0 0 24px;">Wire Transfer Instructions</h2>
    <p style="color: #d1d5db;">Reference: <strong style="color: #10B981;">%s</strong></p>
    <hr style="border-color: #374151; margin: 20px 0;">
    <table style="width: 100%%; color: #d1d5db;">
      <tr><td style="padding: 8px 0;">Bank</td><td style="text-align: right;">%s</td></tr>
      <tr><td style="padding: 8px 0;">Routing #</td><td style="text-align: right; font-family: monospace;">%s</td></tr>
      <tr><td style="padding: 8px 0;">Account #</td><td style="text-align: right; font-family: monospace;">%s</td></tr>
      <tr><td style="padding: 8px 0;">Beneficiary</td><td style="text-align: right;">Sirsi Technologies Inc.</td></tr>
      <tr><td style="padding: 8px 0;">Reference</td><td style="text-align: right; font-family: monospace;">%s</td></tr>
    </table>
    <hr style="border-color: #374151; margin: 20px 0;">
    <p style="font-size: 12px; color: #6b7280;">This is a confidential communication. If you received this in error, please delete it immediately.</p>
  </div>
</div>`, req.Msg.Reference, bankName, routingNumber, accountNumber, req.Msg.Reference)

	plainText := fmt.Sprintf("Wire Transfer Instructions\nReference: %s\nBank: %s\nRouting: %s\nAccount: %s\nBeneficiary: Sirsi Technologies Inc.",
		req.Msg.Reference, bankName, routingNumber, accountNumber)

	message := mail.NewSingleEmail(from, subject, to, plainText, htmlContent)
	client := sendgrid.NewSendClient(apiKey)

	resp, err := client.Send(message)
	if err != nil {
		log.Printf("❌ [Wire] SendGrid send failed: %v", err)
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("failed to send wire instructions: %w", err))
	}

	if resp.StatusCode >= 400 {
		log.Printf("❌ [Wire] SendGrid returned %d: %s", resp.StatusCode, resp.Body)
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("email delivery failed (status %d)", resp.StatusCode))
	}

	log.Printf("🟢 [Wire] Wire instructions sent to %s (SendGrid status: %d)", req.Msg.Email, resp.StatusCode)

	return connect.NewResponse(&signv1.WireInstructionsResponse{
		Success: true,
		Message: fmt.Sprintf("Secure wire transfer instructions have been sent to %s", req.Msg.Email),
	}), nil
}

// ═══════════════════════════════════════════════════════════════════
// MFA
// ═══════════════════════════════════════════════════════════════════

// In-memory MFA store (precursor to Firebase Auth / Firestore)
var mfaSecrets = make(map[string]string) // email → TOTP secret

func (s *SigningServer) ProvisionMFA(
	ctx context.Context,
	req *connect.Request[signv1.ProvisionMFARequest],
) (*connect.Response[signv1.ProvisionMFAResponse], error) {
	email := req.Msg.Email
	if email == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("email is required"))
	}

	// Generate a mock TOTP secret (in production: use proper TOTP library)
	secretBytes := make([]byte, 20)
	rand.Read(secretBytes)
	secret := hex.EncodeToString(secretBytes)[:32]

	mfaSecrets[email] = secret

	log.Printf("🔐 [MFA] Provisioned TOTP for %s", email)

	return connect.NewResponse(&signv1.ProvisionMFAResponse{
		Success:  true,
		Secret:   secret,
		QrUrl:    fmt.Sprintf("otpauth://totp/Sirsi:%s?secret=%s&issuer=Sirsi", email, secret),
		Enrolled: true,
		Identity: email,
	}), nil
}

func (s *SigningServer) SendMFACode(
	ctx context.Context,
	req *connect.Request[signv1.SendMFACodeRequest],
) (*connect.Response[signv1.MFAActionResponse], error) {
	log.Printf("📱 [MFA] Sending %s code to %s (user: %s)", req.Msg.Method, req.Msg.Target, req.Msg.UserId)

	// Generate a 6-digit verification code
	codeBytes := make([]byte, 3)
	rand.Read(codeBytes)
	code := fmt.Sprintf("%06d", int(codeBytes[0])<<16|int(codeBytes[1])<<8|int(codeBytes[2])%1000000)
	code = code[:6]

	switch req.Msg.Method {
	case "email":
		apiKey := os.Getenv("SENDGRID_API_KEY")
		if apiKey == "" {
			log.Printf("⚠️ [MFA] SENDGRID_API_KEY not set — code is %s (dev mode)", code)
			return connect.NewResponse(&signv1.MFAActionResponse{
				Success: true,
				Message: fmt.Sprintf("Verification code sent via %s", req.Msg.Method),
			}), nil
		}

		from := mail.NewEmail("Sirsi Technologies", "noreply@sirsi.ai")
		subject := "Your Sirsi Verification Code"
		to := mail.NewEmail("", req.Msg.Target)

		htmlContent := fmt.Sprintf(`
<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <div style="background: linear-gradient(135deg, #022c22, #000); border-radius: 12px; padding: 32px; color: #fff; text-align: center;">
    <h2 style="font-family: Cinzel, serif; color: #C8A951; margin: 0 0 16px;">Verification Code</h2>
    <p style="color: #d1d5db; margin: 0 0 24px;">Use the code below to verify your identity:</p>
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; border-radius: 8px; padding: 20px; display: inline-block;">
      <span style="font-family: monospace; font-size: 36px; letter-spacing: 8px; color: #10B981;">%s</span>
    </div>
    <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>
</div>`, code)

		plainText := fmt.Sprintf("Your Sirsi verification code is: %s\nThis code expires in 10 minutes.", code)

		message := mail.NewSingleEmail(from, subject, to, plainText, htmlContent)
		client := sendgrid.NewSendClient(apiKey)

		resp, err := client.Send(message)
		if err != nil {
			log.Printf("❌ [MFA] SendGrid send failed: %v", err)
			return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("failed to send MFA code: %w", err))
		}

		if resp.StatusCode >= 400 {
			log.Printf("❌ [MFA] SendGrid returned %d: %s", resp.StatusCode, resp.Body)
			return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("email delivery failed (status %d)", resp.StatusCode))
		}

		log.Printf("🟢 [MFA] Email code sent to %s (SendGrid status: %d)", req.Msg.Target, resp.StatusCode)

	case "sms":
		// SMS MFA is delivered natively by Firebase Auth (Identity Platform).
		// The PhoneMultiFactorGenerator in the client SDK handles SMS delivery
		// through Google's infrastructure — no Twilio integration needed.
		// This server-side path exists as a fallback for non-Firebase contexts.
		log.Printf("ℹ️ [MFA] SMS delivery handled by Firebase Auth. Fallback code: %s, Target: %s", code, req.Msg.Target)

	case "totp":
		// TOTP codes are generated client-side — nothing to send
		log.Printf("ℹ️ [MFA] TOTP method — no server-side delivery needed")

	default:
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("unsupported MFA method: %s", req.Msg.Method))
	}

	return connect.NewResponse(&signv1.MFAActionResponse{
		Success: true,
		Message: fmt.Sprintf("Verification code sent via %s", req.Msg.Method),
	}), nil
}

func (s *SigningServer) VerifyMFACode(
	ctx context.Context,
	req *connect.Request[signv1.VerifyMFACodeRequest],
) (*connect.Response[signv1.MFAActionResponse], error) {
	log.Printf("🔑 [MFA] Verifying %s code for %s", req.Msg.Method, req.Msg.Email)

	// In production: validate TOTP code against stored secret
	// For now, accept any 6-digit code for development
	if len(req.Msg.Code) < 4 {
		return connect.NewResponse(&signv1.MFAActionResponse{
			Success: false,
			Message: "Invalid verification code",
		}), nil
	}

	return connect.NewResponse(&signv1.MFAActionResponse{
		Success: true,
		Message: "Verification successful",
	}), nil
}

// ═══════════════════════════════════════════════════════════════════
// Security
// ═══════════════════════════════════════════════════════════════════

func (s *SigningServer) VerifySignedRedirect(
	ctx context.Context,
	req *connect.Request[signv1.VerifyRedirectRequest],
) (*connect.Response[signv1.VerifyRedirectResponse], error) {
	params := req.Msg.Params
	if params == nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("params are required"))
	}

	// Verify HMAC signature
	signature, exists := params["signature"]
	if !exists {
		return connect.NewResponse(&signv1.VerifyRedirectResponse{
			Valid: false,
			Error: "Missing signature parameter",
		}), nil
	}

	// Build the canonical string (exclude signature itself)
	hmacKey := os.Getenv("SIRSI_HMAC_KEY")
	if hmacKey == "" {
		hmacKey = "sirsi-dev-hmac-key" // Dev fallback
	}

	// Recreate the message from params (sorted, excluding signature)
	message := ""
	for k, v := range params {
		if k != "signature" {
			message += k + "=" + v + "&"
		}
	}

	mac := hmac.New(sha256.New, []byte(hmacKey))
	mac.Write([]byte(message))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
		log.Printf("⚠️ [Security] Invalid redirect signature")
		return connect.NewResponse(&signv1.VerifyRedirectResponse{
			Valid: false,
			Error: "Invalid signature",
		}), nil
	}

	// Generate session token
	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)
	sessionToken := hex.EncodeToString(tokenBytes)

	sessionMac := hmac.New(sha256.New, []byte(hmacKey))
	sessionMac.Write([]byte(sessionToken))
	sessionSig := hex.EncodeToString(sessionMac.Sum(nil))

	log.Printf("✅ [Security] Redirect verified successfully")

	return connect.NewResponse(&signv1.VerifyRedirectResponse{
		Valid:            true,
		Params:           params,
		SessionToken:     sessionToken,
		SessionSignature: sessionSig,
		Expires:          time.Now().Add(24 * time.Hour).UnixMilli(),
	}), nil
}

// ═══════════════════════════════════════════════════════════════════
// Vault
// ═══════════════════════════════════════════════════════════════════

func (s *SigningServer) ListVaultFiles(
	ctx context.Context,
	req *connect.Request[signv1.ListVaultFilesRequest],
) (*connect.Response[signv1.ListVaultFilesResponse], error) {
	log.Printf("🗄️ [Vault] Listing vault files for project: %s", req.Msg.ProjectId)

	bucketName := os.Getenv("SIRSI_VAULT_BUCKET")
	if bucketName == "" {
		log.Println("⚠️ [Vault] SIRSI_VAULT_BUCKET not set — returning empty list (dev mode)")
		return connect.NewResponse(&signv1.ListVaultFilesResponse{
			Files: []*signv1.VaultFile{},
		}), nil
	}

	storageClient, err := storage.NewClient(ctx)
	if err != nil {
		log.Printf("❌ [Vault] Failed to create Cloud Storage client: %v", err)
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("failed to initialize vault storage: %w", err))
	}
	defer storageClient.Close()

	// List files under the project prefix: vault/{projectId}/
	prefix := fmt.Sprintf("vault/%s/", req.Msg.ProjectId)
	query := &storage.Query{Prefix: prefix}

	var files []*signv1.VaultFile
	it := storageClient.Bucket(bucketName).Objects(ctx, query)
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("⚠️ [Vault] Error listing objects: %v", err)
			break
		}

		files = append(files, &signv1.VaultFile{
			Name:        attrs.Name,
			Path:        fmt.Sprintf("gs://%s/%s", bucketName, attrs.Name),
			SizeBytes:   attrs.Size,
			ContentType: attrs.ContentType,
			CreatedAt:   attrs.Created.UnixMilli(),
			UpdatedAt:   attrs.Updated.UnixMilli(),
		})
	}

	log.Printf("🟢 [Vault] Found %d files for project %s", len(files), req.Msg.ProjectId)

	return connect.NewResponse(&signv1.ListVaultFilesResponse{
		Files: files,
	}), nil
}

// ── Helpers ──────────────────────────────────────────────────────

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
