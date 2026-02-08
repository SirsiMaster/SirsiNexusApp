# Signing and Payment Workflow: "The Golden Path"

**Version:** 2.0.0  
**Effective Date:** February 7, 2026  
**Status:** Canonical Implementation  
**Supersedes:** v1.0.0 (January 29, 2026)  
**Related ADR:** [ADR-014 — Bipartite Contract Execution Protocol](../../111-Venture-Projects/docs/ADR-014-BIPARTITE-CONTRACT-EXECUTION.md)

## 1. Executive Summary

This document defines the unified process flow for **bipartite document execution** and financial settlement across the Sirsi Technologies Inc. Portfolio. Version 2.0 introduces the **Dual-Signature Ceremony** — ensuring both the service provider (Sirsi) and the client independently sign the agreement with provable cryptographic evidence before the contract is considered legally binding.

Every transaction is **Protected by MFA**, **Audit-Logged**, and **Securely Orchestrated** by the Universal Component System (UCS).

## 2. Role Resolution

Before any workflow begins, the system resolves the authenticated user's role:

```
┌─────────────────────────────────────────────────────────┐
│                   ROLE RESOLUTION                        │
│                                                          │
│  Firebase Auth User Email                                │
│       │                                                  │
│       ├──→ cylton@sirsi.ai? ──→ PROVIDER                │
│       │                                                  │
│       ├──→ matches contract.clientEmail? ──→ CLIENT     │
│       │                                                  │
│       ├──→ no clientEmail set + is cylton? ──→ PROVIDER │
│       │                                                  │
│       ├──→ no clientEmail set + other? ──→ CLIENT       │
│       │                                                  │
│       └──→ matches neither? ──→ VIEWER (read-only)      │
└─────────────────────────────────────────────────────────┘
```

## 3. The Bipartite Process Flow

### 3.1 Provider Path (Initiator)

```mermaid
sequenceDiagram
    participant P as Provider (Cylton)
    participant UI as Sirsi Vault UI
    participant H as Sirsi Hypervisor / gRPC
    participant DB as Firestore
    participant E as SendGrid

    Note over P,UI: Step 1: Designate Client
    P->>UI: Enters client name, email, title
    UI->>H: CreateContract (DRAFT)
    H->>DB: Store contract record
    H-->>UI: Contract ID returned

    Note over P,UI: Step 2: Review Documents
    P->>UI: Reviews MSA + SOW
    P->>UI: Checks legal acknowledgment ✓
    UI-->>P: "Proceed to Countersign"

    Note over P,UI: Step 3: Countersign Agreement
    UI->>H: FetchContractStatus
    H->>DB: Read contract.status
    alt Status < WAITING_FOR_COUNTERSIGN (6)
        UI-->>P: ⏳ "Awaiting Client Signature" Guard
        P->>UI: Clicks "Refresh Status" (polls)
    else Status ≥ WAITING_FOR_COUNTERSIGN (6)
        UI-->>P: Shows client signature evidence
        P->>UI: Draws/types countersignature
        P->>UI: Accepts ESIGN acknowledgment ✓
    end

    Note over P,UI: Step 4: Finalize Agreement
    UI-->>P: Displays dual signatures + evidence
    P->>UI: Clicks "Finalize & Countersign"
    UI->>H: UpdateContract (FULLY_EXECUTED = 7)
    H->>DB: Store countersigner evidence
    H->>E: Email client: "Agreement Fully Executed"
    UI-->>P: ✅ Contract is legally binding
```

### 3.2 Client Path (Signatory)

```mermaid
sequenceDiagram
    participant C as Client
    participant UI as Sirsi Vault UI
    participant H as Sirsi Hypervisor / gRPC
    participant DB as Firestore
    participant F as Financial Rail (Stripe/Plaid)
    participant E as SendGrid

    Note over C,UI: Step 1: Verify Identity
    UI->>UI: Pre-fills name/email from Firebase Auth
    C->>UI: Confirms identity

    Note over C,UI: Step 2: Review Documents
    C->>UI: Reviews MSA + SOW
    C->>UI: Checks legal acknowledgment ✓

    Note over C,UI: Step 3: Sign Agreement
    C->>UI: Draws/types signature
    C->>UI: Accepts ESIGN acknowledgment ✓
    UI->>UI: Computes SHA-256 hash (client-side)

    Note over C,UI: Step 4: Execute Agreement
    UI-->>C: Displays signature + evidence
    C->>UI: Selects payment method (Card/Bank/Wire)
    C->>UI: Clicks "Execute & Deploy Platform"
    UI->>H: UpdateContract (SIGNED = 3)
    H->>DB: Store signature + evidence
    H->>E: Email provider: "New Signature Received"

    alt Payment Method: Card
        UI->>H: CreateCheckoutSession
        H->>F: Stripe session
        F-->>C: Redirect to checkout
    else Payment Method: Bank (ACH)
        UI->>H: CreatePlaidLinkToken
        H->>F: Plaid Link
        C->>F: Links bank account
    else Payment Method: Wire
        UI-->>C: Redirect to printable MSA with wire instructions
    end
```

## 4. Contract Status Lifecycle

```
                    ┌─────────┐
                    │  DRAFT  │ (1) — Contract created
                    └────┬────┘
                         │ Provider designates client
                    ┌────▼────┐
                    │ ACTIVE  │ (2) — Under review
                    └────┬────┘
                         │ Client signs
                    ┌────▼────┐
                    │ SIGNED  │ (3) — Client signature captured
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼────┐ ┌──▼───┐ ┌───▼─────┐
         │  PAID   │ │WAIT  │ │ARCHIVED │
         │   (4)   │ │FOR CS│ │   (5)   │
         └─────────┘ │ (6)  │ └─────────┘
                     └──┬───┘
                        │ Provider countersigns
                   ┌────▼──────────┐
                   │FULLY EXECUTED │ (7)
                   │ Both signed   │
                   └───────────────┘
```

### Status Definitions

| Status | Code | Description | Triggered By |
|:---|:---|:---|:---|
| `DRAFT` | 1 | Contract created, pending review | `CreateContract` |
| `ACTIVE` | 2 | Contract active, in review phase | Provider advances to Step 2 |
| `SIGNED` | 3 | Client has signed | `UpdateContract` from client's Step 4 |
| `PAID` | 4 | Payment confirmed (via Stripe webhook) | Stripe `checkout.session.completed` |
| `ARCHIVED` | 5 | Contract archived/inactive | Admin action |
| `WAITING_FOR_COUNTERSIGN` | 6 | Client signed, provider has not | Backend auto-transition on client sign |
| `FULLY_EXECUTED` | 7 | Both parties have signed | Provider's Step 4 "Finalize" |

## 5. Cryptographic Evidence Chain

Each signature produces an independent, tamper-proof evidence record:

```
┌──────────────────────────────────────────────────────┐
│              DUAL EVIDENCE RECORD                     │
│                                                       │
│  CLIENT EVIDENCE                                      │
│  ├─ signatureImageData: "data:image/png;base64,..."  │
│  ├─ signatureHash: "sha256:a1b2c3d4..."              │
│  └─ signedAt: "2026-02-07T14:30:00Z"                │
│                                                       │
│  PROVIDER EVIDENCE                                    │
│  ├─ countersignerSignatureImageData: "data:..."      │
│  ├─ countersignerSignatureHash: "sha256:e5f6g7h8..." │
│  └─ countersignerSignedAt: "2026-02-07T16:45:00Z"   │
│                                                       │
│  SHARED                                               │
│  ├─ contractId: "Abu6GsULzDvvXWT2NFaB"               │
│  └─ envelopeId: "ENV-{contractId}"                   │
└──────────────────────────────────────────────────────┘
```

**Hash Algorithm:** SHA-256 via `crypto.subtle.digest()` on the Base64 signature image data.

## 6. The Countersign Gate (Provider Step 3)

The provider's Step 3 includes a **status guard** that prevents premature countersigning:

| Contract Status | Provider Step 3 Behavior |
|:---|:---|
| `DRAFT`, `ACTIVE` | ⏳ "Awaiting Client Signature" — signature pad hidden |
| `WAITING_FOR_COUNTERSIGN` | ✅ Client signature displayed as evidence — countersign pad visible |
| `FULLY_EXECUTED` | 🔒 Both signatures displayed — no further action |

The guard includes a **"Refresh Status"** button that calls `fetchContractStatus()` to poll the backend for updates.

## 7. Orchestration Logic: Decision Tree (v2)

```
                    ┌──────────────┐
                    │ User Clicks  │
                    │   "Sign"     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Resolve Role │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  PROVIDER   │          │   CLIENT    │
       │  Designate  │          │   Verify    │
       │  → Review   │          │   → Review  │
       │  → Counter  │          │   → Sign    │
       │  → Finalize │          │   → Execute │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              │ No Payment              │ Payment
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │   Status:   │          │  Financial  │
       │   FULLY_    │          │   Bridge    │
       │  EXECUTED   │          │  (MFA Gate) │
       └─────────────┘          └──────┬──────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                   ┌──────▼──┐  ┌─────▼────┐ ┌────▼────┐
                   │  Card   │  │  ACH/    │ │  Wire   │
                   │ Stripe  │  │  Plaid   │ │ Manual  │
                   └─────────┘  └──────────┘ └─────────┘
```

**Key Distinction:** The provider path **never enters the Financial Bridge**. Only the client (payer) role triggers MFA → Payment → Settlement.

## 8. Email Notification Matrix

| Event | Trigger | Recipient | Subject |
|:---|:---|:---|:---|
| Client signs | `UpdateContract(status=SIGNED)` | Provider | `✍️ New Signature: {projectName}` |
| Provider countersigns | `UpdateContract(status=FULLY_EXECUTED)` | Client | `✅ Agreement Fully Executed: {projectName}` |
| Payment received | Stripe webhook | Client | `💰 Payment Confirmed: {projectName}` |

## 9. Security Principles

1. **MFA Gate**: Any transition from signing to payment requires TOTP verification (`mfaVerifiedForFinancial`).
2. **Role Isolation**: Provider cannot trigger payment. Client cannot countersign.
3. **Session Persistence**: All context stored in `sessionStorage` — refresh preserves state.
4. **Decoupled Failure**: A Stripe failure does NOT invalidate either signature.
5. **Pervasive Audit**: Every status transition is logged with timestamp and user identity.

## 10. Service Identification Table

| Service | Responsibility | Trigger Gate |
|:---|:---|:---|
| **SirsiVault.tsx** | Role resolution, dual-step UI, evidence computation | User clicks "Sign" from Vault |
| **contracts-grpc** | Status transitions, countersigner storage, email dispatch | Frontend `UpdateContract` call |
| **OpenSign** (planned) | Legal Validity & PDF Signature Proof | Future integration |
| **UCS Guard** | Security Interlocking (MFA/Audit) | Client → Payment transition |
| **Stripe** | Card Processing & Subscriptions | Client selects "Card Payment" |
| **Plaid/Chase** | Treasury Bridging & Bank Verification | Client selects "Bank Wire/ACH" |
| **SendGrid** | Transactional Evidence (Receipts) | Status transition events |

## 11. Implementation Artifacts

| Artifact | Path | Role |
|:---|:---|:---|
| Proto Schema | `packages/finalwishes-contracts/proto/contracts/v1/contracts.proto` | Status enum, countersigner fields |
| Frontend | `packages/finalwishes-contracts/src/components/tabs/SirsiVault.tsx` | Role detection, dual-step UI |
| Backend | `packages/sirsi-opensign/services/contracts-grpc/src/server.js` | Status normalization, email dispatch |
| gRPC Client | `packages/finalwishes-contracts/src/lib/grpc.ts` | Auth-intercepted Connect client |
| ADR | `111-Venture-Projects/docs/ADR-014-BIPARTITE-CONTRACT-EXECUTION.md` | Decision record |

---

*Version 2.0.0 — Bipartite Contract Execution Protocol — February 7, 2026*
