# Stripe UCS Activation - Continuation Prompt

**Created:** February 3, 2026  
**Purpose:** Resume coding session for Stripe payment rail go-live  
**Reference ADR:** `packages/sirsi-opensign/docs/ADR-005-STRIPE-ENVIRONMENT.md`

---

## Context for Agent

You are resuming work on the **Sirsi Nexus App** monorepo. The task is to complete the **Stripe UCS (Universal Component System)** activation per ADR-005 and ADR-011.

### Current State (Verified Feb 3, 2026)

| Component | Status |
|-----------|--------|
| Backend API (`/api/payments/*`) | ✅ Deployed and functional |
| Secret Manager (6 Stripe secrets) | ✅ Configured |
| Environment switching (`STRIPE_USE_LIVE`) | ✅ Working, currently LIVE |
| Health check (`/api/health`) | ✅ Returns `stripeMode: "LIVE"` |
| `StripePay` UCS component | ✅ Exists in `sirsi-ui` |
| `useFinancialAudit` hook | ✅ Exists in `sirsi-ui` |
| Frontend payment wiring | ⚠️ **NOT COMPLETE** |
| Webhook registered in Stripe | ⚠️ **NOT COMPLETE** |
| Success/Cancel pages | ⚠️ **NOT COMPLETE** |

---

## Remaining Tasks (ADR-005 Go-Live Checklist)

Execute the following in order, adhering to GEMINI.md directives:

### Phase 1: UCS Frontend Wiring (Code)

1. **Update `StripePay.tsx`** in `packages/sirsi-ui/src/components/UCS/`:
   - Wire the button's `onSuccess` to call `/api/payments/create-session`
   - Accept `envelopeId` and `planId` as props
   - Redirect to the `checkoutUrl` returned by the API

2. **Integrate into `VaultDashboard.tsx`** in `packages/sirsi-sign/src/`:
   - After signature capture, display payment options
   - Use the `StripePay` UCS component (import from `sirsi-ui`)
   - Pass envelope data and selected plan

3. **Dynamic Stripe Public Key**:
   - Either: Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env.production`
   - Or: Create `/api/config/stripe-pk` endpoint to fetch dynamically

### Phase 2: Stripe Dashboard (Manual - Provide Instructions)

4. **Webhook Registration** (you cannot do this, provide clear steps):
   ```
   URL: https://api-6kdf4or4qq-uc.a.run.app/api/payments/webhook
   Events: checkout.session.completed, checkout.session.expired, payment_intent.payment_failed
   ```

5. **After user registers webhook**, update secret:
   ```bash
   gcloud secrets versions add STRIPE_WEBHOOK_SECRET \
     --project=sirsi-nexus-live --data-file=-
   # Then redeploy functions
   ```

### Phase 3: UX Completion (Code)

6. **Create `payment-success.html`** in `packages/sirsi-opensign/public/`:
   - Royal Neo-Deco styling (navy/gold theme)
   - Display confirmation message
   - Show next steps (contract countersign, provisioning)
   - Link back to dashboard

7. **Create `payment-cancelled.html`** in `packages/sirsi-opensign/public/`:
   - Offer retry option
   - Display alternative payment methods (wire transfer)
   - Provide contact information

### Phase 4: Deploy & Validate

8. **Build React app**: `cd packages/sirsi-sign && npm run build`
9. **Sync to hosting**: `bash deploy-contracts.sh`
10. **Commit and push**: Follow git protocol (GEMINI.md Rule 5)
11. **Test in TEST mode** (if user requests), then switch to LIVE

---

## Key Files to Modify

```
packages/sirsi-ui/src/components/UCS/StripePay.tsx  → Wire API call
packages/sirsi-sign/src/components/dashboard/VaultDashboard.tsx  → Integrate payment
packages/sirsi-opensign/public/payment-success.html  → Create
packages/sirsi-opensign/public/payment-cancelled.html  → Create
```

---

## Constraints (From GEMINI.md)

- **Rule 0 (Minimal Code)**: Reuse existing UCS components, don't duplicate
- **Rule 1 (Sirsi First)**: Use `StripePay` from `sirsi-ui`, not a new component
- **Rule 10 (Infrastructure Ownership)**: Stripe is UCS infrastructure, no project silos
- **Rule 4 (Follow the Pipeline)**: Build → Sync → Deploy → Git Push

---

## Verification Commands

```bash
# Check Stripe mode
curl -s https://api-6kdf4or4qq-uc.a.run.app/api/health | jq .stripeMode

# Test payment session creation (requires valid envelopeId)
curl -X POST https://api-6kdf4or4qq-uc.a.run.app/api/payments/create-session \
  -H "Content-Type: application/json" \
  -d '{"envelopeId":"test-123","planId":"plan-a"}'
```

---

## Begin

Execute Phase 1, then report status. Pause before Phase 2 to provide manual Stripe Dashboard instructions to user.
