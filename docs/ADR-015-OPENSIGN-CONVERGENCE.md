# Phase 6: OpenSign Convergence — Implementation Plan
**Date:** February 7, 2026  
**Status:** COMPLETED  
**Prepared by:** Antigravity

---

## Architecture Decision

### Problem
Two parallel signing/payment systems exist:
1. **OpenSign API** (`functions/index.js`, 2,266 lines) — Express-based Cloud Functions with envelope management, multi-signer routing, PDF generation, Stripe Checkout (card+ACH+wire), MFA, HMAC security, audit logging
2. **contracts-grpc** (`server.js`, ~750 lines) — Node.js HTTP server with contract CRUD, Stripe Checkout, webhook handling, email notifications

### Solution: Dual-Client Architecture
Rather than a full migration (risky), we create an **OpenSign client SDK** that the frontend calls alongside the existing gRPC client. Each system handles what it's best at.

```
[SirsiVault.tsx]
    │
    ├──► contractsClient (gRPC)         — Contract CRUD, config sync, catalog pricing
    │    Keeps: createContract, getContract, updateContract, syncConfig, listContracts
    │
    └──► openSignClient (REST)          — Signing ceremonies, payment, PDF, MFA
         New:  createEnvelope, signEnvelope, createPaymentSession, getPaymentStatus
         New:  requestWireInstructions, verifyMFA, generatePDF
```

### What This Achieves
1. **Eliminates duplicated Stripe Checkout** — contracts-grpc payment creation → OpenSign `/api/payments/create-session`
2. **Eliminates duplicated webhook** — single Stripe webhook endpoint on OpenSign (already correct raw body handling)
3. **Adds PDF generation** — OpenSign's Puppeteer pipeline generates executed agreement PDFs
4. **Adds real MFA** — OpenSign's TOTP/SMS/Email MFA replaces demo mode
5. **Adds wire transfer instructions** — OpenSign's secure email delivery
6. **Envelope-based signing** — future multi-signer support via OpenSign envelopes
7. **Portfolio-portable** — any tenant can use the same OpenSign endpoints

---

## Implementation Steps

### Step 1: Create OpenSign Client SDK ✅
**File:** `src/lib/opensign.ts`
- REST client for OpenSign API endpoints
- Firebase Auth token injection (same as gRPC interceptor)
- Typed interfaces for all API responses
- Base URL: `https://us-central1-sirsi-opensign.cloudfunctions.net/api`

### Step 2: Cross-Reference Webhook Configuration ✅
**File:** `functions/index.js` (OpenSign API)
- On `checkout.session.completed`, now bridges payment status into the `contracts` collection
- If `contractId` in session metadata, updates contract with payment info
- Auto-promotes to `FULLY_EXECUTED` if countersign already exists

### Step 3: Wire Frontend Payment Flow to OpenSign ✅
**File:** `SirsiVault.tsx`
- After contract created & signed, create OpenSign envelope (stored as `openSignEnvelopeId`)
- Link envelope to contract (contractId in envelope metadata)
- Payment checkout sessions (card, ACH, wire) route via OpenSign API
- Wire transfer instructions delivered securely via OpenSign email API

### Step 4: Bridge Webhook → Contract Status ✅
**File:** `functions/index.js` (OpenSign API)
- On `checkout.session.completed`, reads `contractId` from session metadata
- Updates contract record with payment info (sessionId, amount, method)
- Auto-promotes to `FULLY_EXECUTED` if already countersigned
- Audit logged as `contract_payment_bridge` action

### Step 5: Update ADR Documentation ✅
**File:** `docs/ADR-015-OPENSIGN-CONVERGENCE.md`
- This document. Architecture rationale, operation routing map, and change manifest.

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/opensign.ts` | CREATE | OpenSign REST client SDK |
| `src/components/tabs/SirsiVault.tsx` | MODIFY | Wire payment + signing to OpenSign |
| `functions/index.js` | MODIFY | Add contract status bridge to webhook |
| `server.js` | MODIFY | Remove duplicated checkout creation |
| `docs/ADR-015-OPENSIGN-CONVERGENCE.md` | CREATE | Architecture decision record |
