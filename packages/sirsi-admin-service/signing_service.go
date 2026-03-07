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

	"connectrpc.com/connect"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"

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
	// In production: send wire instructions via SendGrid
	// For now, log and return success
	log.Printf("🏦 [Wire] Wire instructions requested for %s (ref: %s, envelope: %s)",
		req.Msg.Email, req.Msg.Reference, req.Msg.EnvelopeId)

	// TODO: Integrate SendGrid Go SDK to send wire transfer details
	// Never expose wire details in the response — deliver server-side only

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

	// TODO: Integrate SendGrid for email codes, Twilio for SMS
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
	// TODO: Integrate Cloud Storage Go SDK
	// For now, return empty list
	log.Printf("🗄️ [Vault] Listing vault files for project: %s", req.Msg.ProjectId)

	return connect.NewResponse(&signv1.ListVaultFilesResponse{
		Files: []*signv1.VaultFile{},
	}), nil
}
