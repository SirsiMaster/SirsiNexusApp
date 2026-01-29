# Live Integration Configuration

## Status Summary

| Action | Status | Details |
|--------|--------|---------|
| **1. Deploy contracts-grpc** | ✅ COMPLETE | Service URL: `https://contracts-grpc-210890802638.us-east4.run.app` |
| **2. Store Plaid Credentials** | ⚠️ PLACEHOLDER | Vault document created with placeholders - needs actual keys |
| **3. Configure Stripe Webhook** | ⏳ MANUAL REQUIRED | See instructions below |
| **4. End-to-End Test** | ✅ PARTIAL | Contract flow works, payment requires keys |

---

## Cloud Run Service

**Service URL:** https://contracts-grpc-210890802638.us-east4.run.app

**Health Check:** Verified operational
```
{"status":"healthy","service":"contracts-grpc","timestamp":"2026-01-29T01:44:00.314Z"}
```

**Logs indicate:**
- ✅ Secrets loaded from Firestore Vault
- ⚠️ Stripe configured: false (key is empty)
- ⚠️ SendGrid API Key missing

---

## Required: Configure API Keys

The Firestore vault needs your actual API keys. Run the secure configuration script:

```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-opensign/services/contracts-grpc
./configure-vault.sh
```

You'll be prompted for:
- `STRIPE_SECRET_KEY` - Your live Stripe secret key (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (whsec_...)
- `SENDGRID_API_KEY` - SendGrid API key (SG...)
- `PLAID_CLIENT_ID` - Plaid client ID
- `PLAID_SECRET` - Plaid secret key

---

## Required: Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://contracts-grpc-210890802638.us-east4.run.app/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (whsec_...) and add it to the vault using the script above

---

## End-to-End Test Results

### 1. Contract Creation ✅
```json
{
    "id": "Abu6GsULzDvvXWT2NFaB",
    "projectName": "FinalWishes Test Contract",
    "status": "DRAFT"
}
```

### 2. Contract Signing ✅
Status transitioned correctly: `DRAFT` → `WAITING_FOR_COUNTERSIGN`
```json
{
    "status": "WAITING_FOR_COUNTERSIGN",
    "signatureImageData": "data:image/png;base64,...",
    "legalAcknowledgment": true,
    "selectedPaymentPlan": 2,
    "paymentMethod": "card"
}
```

### 3. Email Notification ⚠️ (Needs SendGrid Key)
Log shows: `⚠️ SendGrid API Key missing, skipping email.`

### 4. Checkout Session ⚠️ (Needs Stripe Key)
Error: API key not provided

---

## After Configuring Keys

Restart the Cloud Run service to load new keys:
```bash
gcloud run services update contracts-grpc --region=us-east4 --project=sirsi-nexus-live
```

Then test the full payment flow:
```bash
curl -X POST https://contracts-grpc-210890802638.us-east4.run.app/sirsi.contracts.v1.ContractsService/CreateCheckoutSession \
  -H "Content-Type: application/json" \
  -d '{"contractId": "Abu6GsULzDvvXWT2NFaB", "planId": "plan-2", "successUrl": "https://finalwishes.sirsi.ai/success", "cancelUrl": "https://finalwishes.sirsi.ai/cancel"}'
```

---

## Architecture Verification

The integrations are correctly wired:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  SirsiVault.tsx → Payment Method Selection (Card/Bank)      │
│                                                              │
│  [Credit Card] → Stripe Checkout                            │
│  [Bank Transfer] → Plaid Link Token                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (contracts-grpc on Cloud Run)           │
│                                                              │
│  POST /CreateContract → Firestore                           │
│  POST /UpdateContract → Status transitions + Email          │
│  POST /CreateCheckoutSession → Stripe                       │
│  POST /CreatePlaidLinkToken → Plaid                         │
│  POST /webhook → Stripe webhook handler                     │
│                                                              │
│  Secrets loaded from: Firestore vault/production            │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐      ┌──────────┐
   │  Stripe  │     │ SendGrid │      │  Plaid   │
   │ Payments │     │  Email   │      │  ACH/Bank│
   └──────────┘     └──────────┘      └──────────┘
```
