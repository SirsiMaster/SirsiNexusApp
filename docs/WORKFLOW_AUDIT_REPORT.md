# End-to-End Workflow Audit Report
**Date:** February 8, 2026  
**Auditor:** Antigravity (Critical Partner Agent)  
**Scope:** Signature, Contract Creation, SOW, MSA, and Payment Workflows  
**Version:** 1.0.0

---

## Executive Summary

This audit covers the complete contract lifecycle across the Sirsi Vault platform, examining **6 critical workflows** end-to-end. The system is **architecturally sound** with the Bipartite Contract Execution Protocol (ADR-014) properly implemented across frontend and backend. However, **11 findings** were identified — **3 Critical**, **4 Medium**, and **4 Low** — that should be resolved before processing production agreements at scale.

---

## Audit Matrix

| # | Workflow | Status | Findings |
|---|----------|--------|----------|
| 1 | Contract Creation (Draft) | ✅ Operational | 1 Medium |
| 2 | Client Signing (Bipartite Phase 1) | ✅ Operational | 1 Critical, 1 Medium |
| 3 | Provider Countersigning (Bipartite Phase 2) | ✅ Operational | 1 Low |
| 4 | Payment Flow (Card / ACH / Wire) | ⚠️ Partial | 1 Critical, 1 Medium |
| 5 | Document Generation (SOW / MSA / Printable) | ✅ Operational | 1 Low |
| 6 | Status Lifecycle & Email Notifications | ✅ Operational | 1 Critical, 1 Medium, 2 Low |

---

## Workflow 1: Contract Creation (Draft)

### Path Tested
`Provider Step 1 → Designate Client → handleCreateDraft() → gRPC CreateContract → Firestore`

### ✅ Verified Working
- **Provider role detection** correctly identifies `cylton@sirsi.ai` as provider (line 160 of `SirsiVault.tsx`)
- **Client designation form** captures name, email, and optional title
- **Draft creation** calls `contractsClient.createContract()` with correct payload:
  - Project metadata (ID, name)
  - Client info (name, email)
  - Payment plans (dynamically generated from `selectedPaymentPlan`)
  - Theme (Royal Neo-Deco defaults)
  - Countersigner info (pre-set to `cylton@sirsi.ai`)
- **Firestore persistence** includes `signers` array for efficient querying, `paidAmount: 0` ledger initialization
- **Store sync** via `setStoreContractId()` persists contractId to Zustand

### ⚠️ Finding F-01 (Medium): Config Selections Not Synced at Draft Creation

**Location:** `SirsiVault.tsx` line 342-389 (`handleCreateDraft`)

**Issue:** When the provider creates a draft, the client's selected bundle, add-ons, CEO consulting weeks, and probate states are NOT persisted to the contract record. The `createContract` call only sends pricing data (`totalAmount`) but not the selection metadata. The `syncConfig()` function in `useConfigStore.ts` (line 169-205) exists to handle this, but it is never called during the draft creation flow.

**Impact:** If the user navigates away and returns, the contract record in Firestore has no `selections` metadata, so `fetchContract()` cannot re-hydrate the configurator state.

**Recommendation:** Call `syncConfig()` after `handleCreateDraft()` succeeds, or embed `selections` in the `createContract` payload directly.

---

## Workflow 2: Client Signing (Bipartite Phase 1)

### Path Tested
`Client Step 1 (Verify Identity) → Step 2 (Review) → Step 3 (Sign) → Step 4 (Execute) → handleExecute() → gRPC UpdateContract(status=SIGNED) → Backend transitions to WAITING_FOR_COUNTERSIGN → Email to Countersigner`

### ✅ Verified Working
- **Client role detection** correctly matches client email from store (line 173)
- **Pre-fill from Firebase Auth** works for authenticated users (line 176-180)
- **SignatureCapture** component supports draw + type modes with font options
- **SHA-256 evidence computation** via `computeSignatureEvidence()` (line 310-324) using Web Crypto API
- **Deterministic Envelope ID** format: `{CONTRACT_PREFIX}-{HASH_FRAGMENT}`
- **Legal acknowledgment checkbox** (ESIGN Act / UETA) required before execution
- **Status transition**: Client sends `status: 3` (SIGNED), backend normalizes to `WAITING_FOR_COUNTERSIGN` (line 305-316 of `server.js`)
- **Email notification** to countersigner via SendGrid with vault link

### 🔴 Finding F-02 (Critical): Webhook Raw Body Not Captured for Stripe Signature Verification

**Location:** `server.js` line 640

**Issue:** The webhook handler attempts `stripe.webhooks.constructEvent(req.rawBody || JSON.stringify(body), sig, webhookSecret)` but `req.rawBody` is **never set** by the HTTP server. The server parses the body as JSON on line 582-588 before reaching the webhook handler, which means the raw buffer is lost. In production with a valid `STRIPE_WEBHOOK_SECRET`, this will **always fail** signature verification and fall back to the unverified body (line 642-643), which is a security vulnerability.

**Impact:** Stripe webhook signature verification is effectively bypassed in production. A malicious actor could forge webhook events to mark contracts as "PAID" without actual payment.

**Solution:** Capture the raw body buffer before JSON parsing for the `/webhook` path:
```javascript
// Before JSON parsing, capture raw body for webhook verification
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
// Then in webhook handler:
event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
```

### ⚠️ Finding F-03 (Medium): Legal Acknowledgment Checkbox Not Tracked in React State

**Location:** `SirsiVault.tsx` line 1108-1112

**Issue:** The legal acknowledgment checkbox (`id="legal-ack"`) on Step 3 is read via `document.getElementById()` on line 428 (`handleExecute`) rather than being tracked in React state. This is a DOM-escape pattern that:
1. Breaks React's unidirectional data flow
2. Could return `null` if the component re-renders between Step 3 → Step 4
3. Doesn't provide visual feedback that it's *required* before proceeding

The countersigner's checkbox (`id="countersign-legal-ack"`) on line 1308 has the same issue — it's never actually checked/validated before `handleCountersign()` executes.

**Recommendation:** Track both checkboxes in React state and gate the action buttons on their values.

---

## Workflow 3: Provider Countersigning (Bipartite Phase 2)

### Path Tested
`Provider Step 3 → Verify contractStatus === 'WAITING_FOR_COUNTERSIGN' → Review Client Signature → Countersign → computeCountersignerEvidence() → handleCountersign() → gRPC UpdateContract(status=7/FULLY_EXECUTED) → Email to Client`

### ✅ Verified Working
- **Status guard** correctly blocks countersigning until client has signed (line 1168)
- **Client signature display** shows captured image, name, email, and truncated SHA-256 hash (line 1239-1258)
- **Countersigner identity** pre-filled from Firebase Auth (line 1273-1278)
- **Countersigner SignatureCapture** properly captures separate signature data
- **Evidence computation** generates independent SHA-256 hash with `CS-` prefixed envelope ID (line 265)
- **Backend transition** to `FULLY_EXECUTED` with `countersignedAt` timestamp (server.js line 320-332)
- **Email notification** to client with "Agreement Fully Executed" confirmation

### ℹ️ Finding F-04 (Low): Countersigner Legal Ack Not Validated

**Location:** `SirsiVault.tsx` line 1306-1310

**Issue:** The countersigner's legal acknowledgment checkbox exists in the UI but is never checked before allowing the `handleCountersign()` call. The "Continue to Finalize" button on line 1363 only validates `hasCountersignerSignature` and `contractStatus`, not the checkbox state.

**Recommendation:** Add checkbox state tracking and include it in the button disabled condition.

---

## Workflow 4: Payment Flow

### 4A: Card Payment (Stripe Checkout)
**Path:** `handleExecute() → createCheckoutSession() → Stripe Checkout → Redirect → Webhook → Status=PAID`

### ✅ Verified Working
- Correct Stripe publishable key configured (live key in `stripe.ts`)
- `createCheckoutSession` on backend correctly builds `sessionConfig` with line items, metadata, and client reference ID
- Card-only `payment_method_types` correctly configured
- Success URL template uses `{CHECKOUT_SESSION_ID}` placeholder for Stripe injection
- `AgreementWorkflow.tsx` handles the success redirect with `isPaymentSuccess` detection

### 4B: ACH / Bank Transfer (Plaid)
**Path:** `handleExecute() → MFA Gate → createPlaidLinkToken() → Plaid Link → exchangePlaidToken() → btok_ stored → Redirect`

### ⚠️ Verified with Caveats
- MFA gate correctly triggers for `bank` payment method (line 401-403)
- Plaid Link integration uses `react-plaid-link` hook properly
- Token exchange correctly bridges Plaid → Stripe via processor token
- `stripeBankToken` stored in Firestore contract metadata

### 🔴 Finding F-05 (Critical): ACH Payment Never Actually Charged

**Location:** `SirsiVault.tsx` line 457-462

**Issue:** After Plaid links the bank account and the `btok_` is stored, the code does:
```javascript
alert('Bank transfer successfully authorized. Settlement will begin within 24 hours.');
window.location.href = `/contracts/${storeProjectId}/payment/success?method=ach&contract=${contractId}`;
```
This redirects to a "success" page **without actually initiating a payment**. The `btok_` is stored in Firestore but no Stripe PaymentIntent or Charge is ever created to actually debit the bank account. The contract status remains at `WAITING_FOR_COUNTERSIGN` — it's never set to `PAID` via ACH.

**Impact:** Bank transfers appear successful to the client but no money moves. The contract lifecycle stalls.

**Solution:** After linking, create a Stripe PaymentIntent using the stored bank token, or create a Checkout Session in bank-transfer mode pointing to the linked account.

### 4C: Wire Transfer
**Path:** `handleExecute() → Update status to WAITING_FOR_COUNTERSIGN → Redirect to printable MSA`

### ✅ Operational by Design
- Wire transfers are correctly treated as out-of-band (manual settlement)
- Client is redirected to the printable MSA with all signature evidence embedded in URL params
- No Stripe interaction needed — this is intentional

### ⚠️ Finding F-06 (Medium): Subscription Mode Conflicts with Connect

**Location:** `server.js` line 529-544

**Issue:** When `isRecurring` is true (multi-payment plans) AND a `connectAccountId` is present, the code sets BOTH `payment_intent_data.transfer_data` (line 531-535) AND `subscription_data.transfer_data` (line 539-543). Stripe does not allow `payment_intent_data` on subscription-mode checkout sessions. This will throw a Stripe API error if a connected account is configured with recurring payments.

**Current Mitigation:** `stripeConnectAccountId` is currently always empty (`''`), so this code path is never hit. But it's a latent bug for future multi-tenant use.

**Recommendation:** Gate `payment_intent_data` with `if (connectAccountId && !isRecurring)`.

---

## Workflow 5: Document Generation (SOW / MSA / Printable)

### Path Tested
`ConfigureSolution → selections → StatementOfWork (dynamic WBS) → MasterAgreement (full-fidelity) → Printable MSA (URL params)`

### ✅ Verified Working
- **Dynamic SOW** correctly aggregates WBS from bundle + add-ons via `getAggregatedWBS()`
- **Cost Valuation** computes totals using `calculateTotal()` with Sirsi Multiplier (Rule 13)
- **MasterAgreement** renders full legal text with dynamic data injection
- **Printable MSA** receives all parameters via URL (Deep URL Sync / Rule 16):
  - Client name, date, plan, total investment, timeline, hours
  - Add-ons, CEO weeks, probate count
  - Entity legal name, counterparty info
  - Signature evidence (hash, timestamp, envelope ID)

### ℹ️ Finding F-07 (Low): Signature Evidence Not Included in Printable MSA for Countersigner

**Location:** `SirsiVault.tsx` line 326-336 (`openPrintableMSA`)

**Issue:** The `openPrintableMSA` function only embeds the client's `signatureEvidence` into the URL params. When the provider opens it from Step 4 (line 2068-2083), the countersigner's evidence is not included. The printable document will show the client's signature but not the countersigner's.

**Recommendation:** Extend `openPrintableMSA` to accept both client and countersigner evidence, or detect role and append countersigner params when available.

---

## Workflow 6: Status Lifecycle & Email Notifications

### Status Lifecycle Verified

| Transition | Trigger | Backend Handler | Email | Audit Log |
|------------|---------|-----------------|-------|-----------|
| DRAFT → WAITING_FOR_COUNTERSIGN | Client signs (status=3) | ✅ Line 305-316 | ✅ To countersigner | ✅ |
| WAITING_FOR_COUNTERSIGN → FULLY_EXECUTED | Provider countersigns (status=7) | ✅ Line 320-332 | ✅ To client | ✅ |
| FULLY_EXECUTED → PAID | Stripe webhook (checkout.session.completed) | ✅ Line 651-673 | ✅ To client | ✅ |
| Any → DELETED | Admin deletes | ✅ Line 376-402 | ❌ No email | ✅ (separate audit collection) |

### 🔴 Finding F-08 (Critical): Stripe PAID Transition Skips FULLY_EXECUTED Requirement

**Location:** `server.js` line 334-339 and 651-667

**Issue:** The webhook handler transitions the contract directly to `PAID` regardless of the current status. If a client pays (via card checkout) before the provider countersigns, the contract goes from `WAITING_FOR_COUNTERSIGN` → `PAID`, completely skipping `FULLY_EXECUTED`. This breaks the Bipartite Protocol (ADR-014) which mandates both signatures before payment.

Furthermore, the status `PAID` check on line 334-339 sets `countersignedAt` if missing, effectively auto-completing the countersign step, which is incorrect.

**Root Cause:** The `handleExecute()` function on the frontend triggers Stripe Checkout immediately after the client signs (before the provider countersigns). The payment can complete before the provider performs their ceremony.

**Impact:** Contracts can be marked as `PAID` with only one signature, violating the bipartite protocol and creating a legal risk.

**Solution Options:**
1. **Defer payment**: Don't trigger Stripe Checkout until contract is `FULLY_EXECUTED`. Move payment to a post-countersign step.
2. **Hold payment**: Create a Stripe Checkout in `setup` mode (captures card info without charging) during client signing. Only create the actual charge/payment after countersign.
3. **Webhook guard**: In the webhook handler, check the current contract status. If not `FULLY_EXECUTED`, hold the payment metadata but don't transition to `PAID`.

### ℹ️ Finding F-09 (Low): Duplicate SendGrid Key Assignment

**Location:** `server.js` line 34-35

**Issue:** `process.env.SENDGRID_API_KEY` is assigned twice from `secrets.SENDGRID_API_KEY`. The second assignment on line 35 is a copy-paste redundancy.

**Impact:** Cosmetic / no functional impact, but indicates rushed code.

### ℹ️ Finding F-10 (Low): Email Links Point to Inconsistent Domains

**Location:** `server.js` lines 314, 330

**Issue:** The "client signed" notification email links to `https://vault.sirsi.ai` (line 314), while the "fully executed" email links to `https://sign.sirsi.ai` (line 330). These may be different sites or the vault domain may not exist yet.

**Recommendation:** Standardize all email links to `https://sign.sirsi.ai` (the live domain) unless `vault.sirsi.ai` is separately deployed.

### ⚠️ Finding F-11 (Medium): listContracts Does Not Support Provider/Admin View

**Location:** `server.js` line 266-290

**Issue:** The `listContracts` query filters by `clientEmail` only (line 275). A provider (countersigner) cannot query for contracts where they are the countersigner. The `signers` array field exists on the contract (line 237) but is never used in queries.

**Impact:** The Vault Dashboard cannot show the provider their pending countersign queue unless the frontend queries without a `userEmail` filter (which returns all contracts for the project).

**Recommendation:** Add a `role` parameter. If `role=provider`, filter by `arrayContains` on the `signers` field or by `countersignerEmail`.

---

## Summary of Findings

| ID | Severity | Workflow | Description |
|----|----------|----------|-------------|
| F-01 | Medium | Contract Creation | Config selections not synced at draft creation |
| F-02 | **Critical** | Payment/Webhook | Raw body not captured for Stripe webhook signature verification |
| F-03 | Medium | Client Signing | Legal acknowledgment checkbox not in React state |
| F-04 | Low | Countersigning | Countersigner legal ack not validated before submission |
| F-05 | **Critical** | ACH Payment | Bank account linked but never actually charged |
| F-06 | Medium | Payment | Subscription mode conflicts with Connect `payment_intent_data` |
| F-07 | Low | Document Gen | Countersigner evidence missing from printable MSA params |
| F-08 | **Critical** | Status Lifecycle | Payment can complete before countersign, breaking bipartite protocol |
| F-09 | Low | Backend | Duplicate SendGrid key assignment |
| F-10 | Low | Email | Inconsistent vault/sign domain in notification emails |
| F-11 | Medium | Backend | listContracts lacks provider/countersigner query support |

---

## Recommended Priority

### Immediate (Before First Live Transaction)
1. **F-02**: Fix webhook raw body capture for Stripe signature verification
2. **F-08**: Gate payment initiation on `FULLY_EXECUTED` status or implement webhook guard
3. **F-05**: Implement actual ACH charge after Plaid token exchange

### Before Client-Facing Deployment
4. **F-03**: Track legal ack checkboxes in React state
5. **F-01**: Persist selections metadata during draft creation
6. **F-11**: Support provider role in contract listing

### Housekeeping
7. **F-04, F-06, F-07, F-09, F-10**: Low-risk improvements

---

## Positive Findings

The following aspects of the system are well-implemented and merit recognition:

1. **Role Architecture**: The `UserRole` detection system (provider/client/viewer/detecting) is clean and correctly gates UI rendering across all 4 steps
2. **Cryptographic Evidence Chain**: SHA-256 hashing via Web Crypto API with deterministic envelope IDs is properly implemented for both signers
3. **Status Normalization Bridge**: The `STATUS_MAP` / `normalizeContract` pattern elegantly bridges Firestore string storage ↔ Proto enum values
4. **Audit Logging**: Firestore subcollection `audit_logs` captures all status transitions with timestamps
5. **Delete Safety**: Contracts are archived to `deletedContracts` before hard deletion
6. **Design System Consistency**: Royal Neo-Deco aesthetic (Cinzel headings, gold accents, glass panels) is consistently applied throughout the vault experience
7. **MFA Enforcement**: Financial operations correctly gate behind MFAGate per AUTHORIZATION_POLICY.md Section 4.3
8. **ADR Governance**: ADR-014 is properly canonized with governance mirror in 111-Venture-Projects per Rule 11

---

*Signed: Antigravity (The Agent)*
