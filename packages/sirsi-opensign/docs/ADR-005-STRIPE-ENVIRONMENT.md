# ADR-005: Stripe Environment Switching

**Status:** Accepted  
**Date:** 2026-01-13  
**Decision Makers:** Cylton Collymore, Antigravity (AI Agent)

---

## Context

The Sirsi payment system requires the ability to:
1. Process real payments in production
2. Safely test payment flows without affecting live transactions
3. Switch between test and live modes without code changes
4. Maintain security of all API keys

Previously, the system used a single set of Stripe keys, making it impossible to test payment flows without risking real transactions.

---

## Decision

Implement **environment-based Stripe key switching** using Google Cloud Secret Manager with a toggle secret.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Secret Manager                             │
├─────────────────────────────────────────────────────────────┤
│  STRIPE_USE_LIVE = "true" ─────┐                            │
│                                 ▼                            │
│  ┌─────────────────┐   ┌─────────────────┐                  │
│  │ STRIPE_SECRET_  │   │ STRIPE_SECRET_  │                  │
│  │ KEY (sk_live_)  │   │ KEY_TEST        │                  │
│  └────────┬────────┘   │ (sk_test_)      │                  │
│           │            └────────┬────────┘                  │
│           │                     │                            │
│           ▼                     ▼                            │
│     ┌──────────────────────────────────┐                    │
│     │    if (STRIPE_USE_LIVE === 'true')                    │
│     │        use STRIPE_SECRET_KEY                          │
│     │    else                                               │
│     │        use STRIPE_SECRET_KEY_TEST                     │
│     └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Live mode secret key |
| `STRIPE_WEBHOOK_SECRET` | Live mode webhook signing |
| `STRIPE_SECRET_KEY_TEST` | Test mode secret key |
| `STRIPE_WEBHOOK_SECRET_TEST` | Test mode webhook signing |
| `STRIPE_USE_LIVE` | Toggle: `"true"` = live, `"false"` = test |

### Implementation

```javascript
// Environment-based key switching
const USE_LIVE_STRIPE = process.env.STRIPE_USE_LIVE === 'true';

const STRIPE_KEY = USE_LIVE_STRIPE 
  ? (process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder')
  : (process.env.STRIPE_SECRET_KEY_TEST || 'sk_test_placeholder');

const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2023-10-16' });

const STRIPE_WEBHOOK_SECRET = USE_LIVE_STRIPE
  ? (process.env.STRIPE_WEBHOOK_SECRET || '')
  : (process.env.STRIPE_WEBHOOK_SECRET_TEST || '');

console.log(`🔐 Stripe Mode: ${USE_LIVE_STRIPE ? 'LIVE 💰' : 'TEST 🧪'}`);
```

---

## Consequences

### Positive

1. **Zero-downtime switching**: Change modes by updating one secret
2. **No code changes**: Same codebase for test and production
3. **Secure**: All keys remain in Secret Manager, never in code
4. **Observable**: Health endpoint exposes current mode
5. **Auditable**: Secret version history tracks mode changes

### Negative

1. **Requires redeployment**: Functions must be redeployed after secret change
2. **Single project**: Both modes share the same Firebase project
3. **Manual switching**: No automatic staging pipeline

### Mitigations

- Create a workflow document for mode switching
- Add health check to verify mode before critical operations
- Consider future CI/CD integration for automatic test deployments

---

## Alternatives Considered

### 1. Separate Firebase Projects

**Pros:** Complete isolation, separate billing  
**Cons:** Duplicate infrastructure, higher cost, more management

**Decision:** Rejected - overhead not justified for current scale

### 2. Local-only Testing

**Pros:** No cloud changes needed  
**Cons:** Cannot test webhooks, limited to emulator

**Decision:** Rejected - need full integration testing

### 3. Environment Variables in Cloud Console

**Pros:** Simple to manage  
**Cons:** Less secure, not version-controlled

**Decision:** Rejected - Secret Manager provides better security

---

## Implementation Checklist

- [x] Create STRIPE_SECRET_KEY_TEST secret
- [x] Create STRIPE_WEBHOOK_SECRET_TEST secret
- [x] Create STRIPE_USE_LIVE toggle secret
- [x] Update functions/index.js with environment switching
- [x] Update function secrets configuration
- [x] Add stripeMode to health check endpoint
- [x] Deploy and verify in LIVE mode
- [x] Document switching procedures

---

## Go-Live Activation Checklist

**Status:** In Progress (Feb 2026)

The following tasks complete the Stripe UCS integration from backend-ready to production-activated:

### Phase 1: UCS Frontend Wiring
- [x] **Wire `StripePay` UCS component** to `/api/payments/create-session` (Feb 3, 2026)
- [x] **Fetch publishable key dynamically** (Not needed - using Stripe Checkout redirect)
- [x] **Integrate payment flow** into `VaultDashboard.tsx` after signature capture (Feb 3, 2026)

### Phase 2: Stripe Dashboard Configuration
- [ ] **Register webhook endpoint** in Stripe Dashboard:
  - URL: `https://api-6kdf4or4qq-uc.a.run.app/api/payments/webhook`
  - Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
- [ ] **Update STRIPE_WEBHOOK_SECRET** in Secret Manager with signing secret

### Phase 3: UX Completion
- [x] **Create payment success page** at `/payment-success.html` (Feb 3, 2026)
- [x] **Create payment cancelled page** at `/payment-cancelled.html` (Feb 3, 2026)
- [x] **Integrate with envelope status display** (Feb 3, 2026)

### Phase 4: Validation
- [ ] End-to-end test in TEST mode (sk_test_)
- [ ] Verify webhook receipt and Firestore update
- [ ] Process first LIVE transaction

---

## Verification Commands

```bash
# Check current mode
curl -s https://api-6kdf4or4qq-uc.a.run.app/api/health | jq .stripeMode

# Switch to TEST
echo "false" | gcloud secrets versions add STRIPE_USE_LIVE \
  --project=sirsi-nexus-live --data-file=-
firebase deploy --only functions --project sirsi-nexus-live

# Switch to LIVE
echo "true" | gcloud secrets versions add STRIPE_USE_LIVE \
  --project=sirsi-nexus-live --data-file=-
firebase deploy --only functions --project sirsi-nexus-live
```

---

## Related Documents

- [ADR-011: Universal Component System](../../../docs/ADR-011-UNIVERSAL-COMPONENT-SYSTEM.md)
- [ADR-003: HMAC Security Layer](./ADR-003-HMAC-SECURITY-LAYER.md)
- [GEMINI.md](../../../GEMINI.md) - Rule 10: Infrastructure Ownership

