# Break-Fix Plan v2: Workflow Audit Remediation
**Date:** February 7, 2026  
**Prepared by:** Antigravity (Critical Partner Agent)  
**Source:** `WORKFLOW_AUDIT_REPORT.md`  
**Status:** PENDING REVIEW — Revised per User Directives

---

## User Directives (Reframe)

Three directives fundamentally reshape this plan:

1. **Payment is NEVER gated by countersign.** Signing order is flexible (client-first or provider-first). Once the client signs, payment is authorized. Countersigning is a parallel ceremony — it completes the legal record but does not block revenue.

2. **Leverage the OpenSign API.** The existing `functions/index.js` (2,266 lines) already provides envelope management, multi-signer routing, PDF generation, Stripe Checkout, webhook handling (with *correct* raw body capture), MFA, HMAC security, and audit trails. The `contracts-grpc` service duplicates much of this. We must offload code to what's already built — not reinvent it.

3. **Portfolio-portable.** Every workflow must be tenant-agnostic. Build for the Sirsi platform, not just FinalWishes. Earmark integration vs. incorporation patterns for future builds.

---

## Critical Discovery: OpenSign API Capability Audit

Before mapping fixes, here's what the OpenSign API (`functions/index.js`) **already provides** that we're NOT using in the `SirsiVault.tsx` → `contracts-grpc` flow:

| Capability | OpenSign API (`functions/index.js`) | Contracts gRPC (`server.js`) | Current Usage |
|------------|-------------------------------------|-------------------------------|---------------|
| **Envelope Creation** | `POST /api/guest/envelopes` + `POST /api/envelopes` | `createContract()` | ❌ Not used — we built our own |
| **Multi-Signer Routing** | `signers[]` array, `allSigned` logic, sequential tracking | Manual status transitions | ❌ Not used |
| **Signature Recording** | `POST /api/envelopes/:id/sign` with audit trail | Manual Firestore update | ❌ Not used |
| **PDF Generation** | Puppeteer → Cloud Storage → Email w/attachment | Not implemented | ❌ Not used |
| **Stripe Checkout** | `POST /api/payments/create-session` (card + ACH + wire) | `createCheckoutSession()` | ❌ Duplicated |
| **Stripe Webhook** | `POST /api/payments/webhook` with **`express.raw()`** ✅ | `/webhook` with **broken raw body** ❌ | Parallel, broken |
| **Wire Instructions** | `POST /api/payments/request-wire-instructions` | Not implemented | ❌ Not used |
| **MFA Verification** | `POST /api/security/mfa/verify` + `verifyMFA` callable | `MFAGate` with demo bypass | ❌ Partially connected |
| **HMAC Signed URLs** | `generateSignedRedirectUrl()` + `/api/security/verify` | Not implemented | ❌ Not used |
| **Payment Status** | `GET /api/payments/status/:envelopeId` | Manual Firestore read | ❌ Not used |
| **Provisioning Email** | `sendProvisioningEmail()` on payment complete | `sendEmail()` (simpler) | ❌ Not used |
| **Audit Logging** | Firestore `auditLogs` collection | Firestore `audit_logs` subcollection | Parallel (different collections) |
| **Completion Certificate** | Available via OpenSign GetDocument API | Not implemented | ❌ Not used |

### Assessment

**We have two parallel payment/signing systems.** The OpenSign API is MORE complete (correct webhook verification, PDF generation, multi-signer routing, HMAC security, provisioning emails). The contracts-grpc service adds contract-specific features (theming, payment plans, config sync, gRPC compatibility) but reinvents signing, payment, and webhook handling.

---

## Revised Dependency Graph

```
PHASE 0: Housekeeping ──────────▶ Clean server.js (F-09, F-10, F-06)
    │                              Zero risk. 5 min. No dependencies.
    │
PHASE 1: Webhook Security ─────▶ Fix raw body capture in server.js (F-02)
    │                              CRITICAL: Must fix before any real payment.
    │                              NOTE: OpenSign API already does this correctly.
    │                              Future state: Route webhooks through OpenSign.
    │
PHASE 2: Flexible Signing ─────▶ NEW: Multi-signer, order-independent signing (F-08 REFRAMED)
    │                              - Any signer can go first
    │                              - Client signature authorizes payment (always)
    │                              - Countersign completes record (never blocks payment)
    │                              - Earmark: delegate to OpenSign envelope routing
    │
PHASE 3: ACH Completion ───────▶ Fix ACH charge (F-05)
    │                              Route through Stripe Checkout (same as card)
    │                              Option B: Use OpenSign's /api/payments/create-session
    │
PHASE 4: Legal Ack + UX ───────▶ React state for checkboxes (F-03, F-04)
    │
PHASE 5: Quality ──────────────▶ Selections sync, MSA evidence, provider queries
    │                              (F-01, F-07, F-11)
    │
──────────────────────────────────────────────────────────────────────────
PHASE 6: OpenSign Convergence ──▶ FUTURE: Unified signing/payment through OpenSign API
    (EARMARKED)                    - Replace custom signing with OpenSign envelopes
                                   - Route payments through OpenSign's Stripe integration
                                   - Use OpenSign PDF generation
                                   - Single webhook endpoint
                                   - Full portfolio portability
```

---

## Phase 0: Housekeeping (Backend Cleanup)
**Risk:** None | **Files:** `server.js` | **Time:** 5 min

### F-09: Remove Duplicate SendGrid Key Assignment
Line 35 is a duplicate of line 34. Delete.

### F-10: Standardize Email Link Domains
Line 314: `"https://vault.sirsi.ai"` → `"https://sign.sirsi.ai"`

### F-06: Guard payment_intent_data for Subscription Mode
```javascript
// Line 529-535: Only set on non-subscription sessions
if (connectAccountId && !isRecurring) {
    sessionConfig.payment_intent_data = { ... };
}
```

---

## Phase 1: Webhook Security
**Risk:** Critical | **Files:** `server.js` | **Time:** 15 min

### F-02: Capture Raw Body for Stripe Webhook Signature Verification

**Key insight:** The OpenSign API (`functions/index.js` line 1551) already does this correctly:
```javascript
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
```

Our `contracts-grpc` server uses a raw `http.createServer` (not Express), so we need to capture the buffer manually.

**Fix:**
```javascript
// In the HTTP server handler (line 580-589), capture raw buffer:
let rawBody = null;
if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    rawBody = Buffer.concat(chunks);
    try {
        body = JSON.parse(rawBody.toString());
    } catch (e) {
        body = {};
    }
}

// In webhook handler (line 634-644), use rawBody and REJECT on failure:
if (path === '/webhook') {
    if (!webhookSecret || !sig) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Webhook verification not configured' }));
        return;
    }
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification FAILED:', err.message);
        res.writeHead(400);
        res.end(`Webhook Error: ${err.message}`);
        return;
    }
    // ... process verified event
}
```

**Earmark:** In Phase 6, route ALL webhooks through OpenSign's existing `/api/payments/webhook` endpoint which already handles raw body correctly via Express middleware.

---

## Phase 2: Flexible Signing Order (F-08 REFRAMED)
**Risk:** Medium | **Files:** `server.js` + `SirsiVault.tsx` | **Time:** 30 min

### New Understanding

The original audit called this a "bug" — but per user directive, it's the **intended behavior** that payment can happen before countersign. The actual fix is:

1. **Support either signer going first** (client-first OR provider-first)
2. **Client signature = payment authorized** (always)
3. **Track completion of both ceremonies independently**
4. **Final status = FULLY_EXECUTED when all signatures + payment are present**

### Backend Changes (`server.js`)

**New Status Logic:**
```
DRAFT → (any signer signs) → SIGNED/PARTIALLY_SIGNED
SIGNED → (client pays) → PAID
PAID → (countersigner signs) → FULLY_EXECUTED
  OR
SIGNED → (countersigner signs) → FULLY_EXECUTED
FULLY_EXECUTED → (client pays) → FULLY_EXECUTED + PAID (same status, payment recorded)
```

**The simplest implementation (Option B):**

The status field stays as the canonical lifecycle marker. Payment metadata is tracked independently. Both can happen in any order.

```javascript
// In updateContract handler, REPLACE existing PAID transition logic:

// If status becomes PAID (from webhook or manual)
if (updateData.status === 'PAID' || updateData.status === 4) {
    updateData.status = 'PAID';
    updateData.paidAt = Date.now();

    // If already countersigned, auto-promote to FULLY_EXECUTED
    if (existingData.countersignedAt || existingData.countersignerSignatureHash) {
        updateData.status = 'FULLY_EXECUTED';
        console.log(`✅ Contract ${id}: Payment received + countersigned → FULLY_EXECUTED`);
    }

    await handlers.sendEmail(
        existingData.clientEmail,
        `Payment Received: ${existingData.projectName}`,
        `We have received your payment for ${existingData.projectName}.`,
        `<h3>Payment Confirmed</h3>...`
    );
}

// If countersigner signs → check if payment already received
if (updateData.status === 'FULLY_EXECUTED' || updateData.status === 7) {
    updateData.status = 'FULLY_EXECUTED';
    updateData.countersignedAt = updateData.countersignerSignedAt || Date.now();
    console.log(`✅ Contract ${id} countersigned.`);

    // If payment was already received, status stays FULLY_EXECUTED (final state)
    if (existingData.paidAmount > 0 || existingData.paymentMetadata) {
        console.log(`💰 Payment already on record for ${id}. Contract is complete.`);
    }

    await handlers.sendEmail(
        existingData.clientEmail,
        `✅ Agreement Fully Executed: ${existingData.projectName}`,
        `Countersigned by ${existingData.countersignerName}. ${existingData.paidAmount > 0 ? 'Payment confirmed.' : 'Awaiting payment.'}`
        // ...
    );
}
```

### Frontend Changes (`SirsiVault.tsx`)

**Provider Step 3 (Countersign):**
Remove the guard that requires `WAITING_FOR_COUNTERSIGN` before allowing countersign. Instead, allow countersign whenever the provider has the contract open and a client signature exists.

```javascript
// Current guard (lines ~1168-1195): 
// if (contractStatus !== 'WAITING_FOR_COUNTERSIGN') { show "waiting" }
// CHANGE TO:
// if (!clientSignatureExists) { show "waiting for client to sign" }
// (Provider can countersign regardless of payment status)
```

**Multiple Client Signers (Earmark):**
The current system assumes one client signer. For future builds:
- `signers[]` array (already in Firestore schema)
- Track which signers have signed
- Payment authorized when ALL required client signers have signed
- This maps directly to OpenSign's multi-signer envelope model

### Portfolio Portability Note
This flexible signing model works for any tenant:
- **FinalWishes**: Client signs MSA → pays → Provider countersigns
- **Assiduous**: Client pays (no contract needed, simple payment agreement)
- **Future tenants**: Configurable signer requirements per document type

---

## Phase 3: ACH Completion
**Risk:** Medium | **Files:** `SirsiVault.tsx` + `server.js` | **Time:** 15 min

### F-05: Route ACH Through Stripe Checkout

**Fix:** After Plaid links the bank account, create a Stripe Checkout Session specifying `us_bank_account` as the payment method.

```javascript
// SirsiVault.tsx, replace alert + redirect (line 457-462) with:
if (signatureData.selectedPaymentMethod === 'bank') {
    // Bank linked — create Checkout Session for ACH payment
    const session = await contractsClient.createCheckoutSession({
        contractId,
        planId: selectedPaymentPlan || 'payment-1',
        successUrl: `${window.location.origin}/contracts/${storeProjectId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
        paymentMethodTypes: ['us_bank_account'],
    });

    if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
    }
}
```

**Earmark:** OpenSign's `/api/payments/create-session` already supports `us_bank_account`. In Phase 6, this call would route through OpenSign instead of contracts-grpc.

---

## Phase 4: Legal Acknowledgment State
**Risk:** Low | **Files:** `SirsiVault.tsx` | **Time:** 10 min

### F-03 + F-04: Track Checkboxes in React State

```javascript
// Add state variables
const [clientLegalAck, setClientLegalAck] = useState(false)
const [countersignerLegalAck, setCountersignerLegalAck] = useState(false)

// Wire to checkboxes
<input type="checkbox" checked={clientLegalAck}
    onChange={(e) => setClientLegalAck(e.target.checked)} />

// Gate buttons
disabled={!hasSignature || !clientLegalAck}  // Client
disabled={!hasCountersignerSignature || !countersignerLegalAck}  // Provider

// In handleExecute, use state:
legalAcknowledgment: clientLegalAck  // Instead of document.getElementById
```

---

## Phase 5: Quality & Completeness
**Risk:** Low | **Files:** Various | **Time:** 20 min

### F-01: Persist Selections During Draft Creation
Call `syncConfig()` after `handleCreateDraft()` succeeds.

### F-07: Include Countersigner Evidence in Printable MSA
Extend `openPrintableMSA()` to append countersigner params when available.

### F-11: Support Provider Role in Contract Listing
Add `role` parameter to `listContracts` that uses `array-contains` on `signers` field for provider queries.

---

## Phase 6: OpenSign Convergence (EARMARKED — Future Build)
**Risk:** Architectural | **Scope:** Major refactor  
**Status:** EARMARKED for future sprint. Not part of current break-fix.

### Vision

Eliminate the `contracts-grpc` duplication by routing signing and payment through the existing OpenSign API. The contracts-grpc service remains for **contract-specific** logic (theming, config sync, catalog-driven pricing, gRPC transport) but delegates signing ceremonies and payment processing to OpenSign.

### What Moves to OpenSign

| Current Location | Moves To | Mechanism |
|------------------|----------|-----------|
| `SignatureCapture` component | OpenSign signing page (`sign.html`) | HMAC-signed redirect |
| `computeSignatureEvidence()` | OpenSign envelope signing API | API call + callback |
| `handleCountersign()` | OpenSign multi-signer routing | OpenSign signer sequence |
| `createCheckoutSession()` | `/api/payments/create-session` | Direct API call |
| `/webhook` handler | `/api/payments/webhook` | Single Stripe webhook endpoint |
| Manual PDF generation | OpenSign Puppeteer service | `/api/envelopes/:id/pdf` |
| `sendEmail()` | OpenSign email delivery | Part of envelope finalization |
| MFA Gate (demo mode) | `/api/security/mfa/verify` | Real TOTP verification |

### What Stays in contracts-grpc

| Feature | Reason |
|---------|--------|
| Contract CRUD | Firestore schema for contracts (separate from envelopes) |
| Catalog-driven pricing | Tied to `catalog.ts` and dynamic configurator |
| Payment plan management | Business logic specific to contract offers |
| Config sync | Zustand ↔ Firestore state persistence |
| gRPC transport | Connect-based API for React client |
| Theme engine | Contract-specific theming (Royal Neo-Deco) |

### Integration Pattern

```
[SirsiVault.tsx]
    │
    ├──▶ contracts-grpc: createContract(), syncConfig(), getContract()
    │    (Contract-specific business logic)
    │
    └──▶ OpenSign API: createEnvelope(), sign(), createPaymentSession()
         (Signing ceremony, payment, PDF generation)
```

### Portfolio Incorporation Model (Future Feature)
**Integration** = Tenant uses Sirsi APIs but maintains their own UI  
**Incorporation** = Tenant's entire signing/payment UX is Sirsi-hosted

For **Integration**:
```javascript
const SIRSI_SERVICES = {
    contractsGrpc: 'https://contracts-grpc-....run.app',
    openSignApi: 'https://us-central1-sirsi-opensign.cloudfunctions.net/api',
    signPortal: 'https://sign.sirsi.ai'
};
// Tenant calls these APIs from their own app
```

For **Incorporation**:
```
sign.sirsi.ai/vault/{tenantId}/contracts/{contractId}
// Full Sirsi Vault experience, white-labeled per tenant theme
```

---

## Execution Summary (Revised)

| Phase | Fixes | Files | Risk | Time | Depends On |
|-------|-------|-------|------|------|------------|
| **0** | F-09, F-10, F-06 | server.js | None | 5 min | — |
| **1** | F-02 | server.js | Critical | 15 min | Phase 0 |
| **2** | F-08 (reframed) | server.js, SirsiVault.tsx | Medium | 30 min | Phase 1 |
| **3** | F-05 | SirsiVault.tsx | Medium | 15 min | Phase 2 |
| **4** | F-03, F-04 | SirsiVault.tsx | Low | 10 min | — |
| **5** | F-01, F-07, F-11 | SirsiVault.tsx, server.js | Low | 20 min | — |
| **6** | OpenSign Convergence | Architecture-wide | Major | Sprint | All above |

**Phases 0–5 estimated time: ~95 minutes**  
**Phase 6: Earmarked for future sprint**

### Git Strategy
```
Phase 0: fix(server): housekeeping cleanup (F-09, F-10, F-06)
Phase 1: fix(server): capture raw body for stripe webhook verification (F-02)
Phase 2: feat(server+vault): flexible signing order, payment independence (F-08)
Phase 3: fix(vault): implement ACH charge via stripe checkout (F-05)
Phase 4: fix(vault): track legal acknowledgment in react state (F-03, F-04)
Phase 5: feat: selections sync, counter evidence, provider queries (F-01, F-07, F-11)
```

---

## Key Decision: Signing Order Architecture

**Approved approach: Option B with flexible ordering.**

The system now supports:
- ✅ Client signs first → payment authorized → provider countersigns later
- ✅ Provider countersigns first → client signs later → payment authorized
- ✅ Payment without countersign (simple payment agreements)
- ✅ No countersigner needed (configurable per document type)
- ✅ Multiple client signers (earmarked — maps to OpenSign multi-signer)
- ✅ Both ceremonies complete → FULLY_EXECUTED (final state)

**Awaiting approval to begin Phase 0.**

---

*Signed: Antigravity (The Agent)*
