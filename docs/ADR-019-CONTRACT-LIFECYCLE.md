# ADR-019: Contract Lifecycle & Funding Status

**Status:** Accepted  
**Date:** 2026-02-13  
**Decision Makers:** Cylton Collymore (CTO), Antigravity (Agent)  
**Extends:** ADR-014 (Bipartite Contract Execution Protocol)

## Context

ADR-014 established the dual-signature ceremony and status lifecycle for contract execution. However, the lifecycle ends at `FULLY_EXECUTED` — which only means both parties signed. It does not track whether the contract has been **funded** (payment received). This creates a gap: the vault cannot distinguish between a signed-but-unpaid contract and a signed-and-paid one.

The business requires visibility into:
1. Whether a fully executed contract has been funded
2. The source of funding (portal payment via Stripe/Plaid/ACH, or external payment with manual confirmation)
3. When a contract transitions from "active" to "completed" to "archived"

## Decision

### 1. Extended Status Lifecycle

```
DRAFT (1) → ACTIVE (2) → SIGNED (3) → WAITING_FOR_COUNTERSIGN (6)
    → FULLY_EXECUTED (7) → COMPLETED (8)
                         → ARCHIVED (9)
```

| Status | Value | Meaning |
|:---|:---|:---|
| `DRAFT` | 1 | Contract created, not yet reviewed |
| `ACTIVE` | 2 | Contract active, in review |
| `SIGNED` | 3 | Client has signed |
| `PAID` | 4 | Payment confirmed (legacy — see Funding Status below) |
| `ARCHIVED` | 5 | Contract archived (beyond subscription period + development complete) |
| `WAITING_FOR_COUNTERSIGN` | 6 | Client signed, awaiting provider countersignature |
| `FULLY_EXECUTED` | 7 | Both parties signed — contract is legally binding |
| `COMPLETED` | 8 | Fully executed AND fully funded — contract obligations met |

### 2. Funding Sub-States

Funding is tracked as a **separate field** on the contract record, not a top-level status. This allows the contract's execution status and payment status to evolve independently.

| Funding Status | Meaning | Visual Indicator |
|:---|:---|:---|
| `UNFUNDED` | Signed but no payment received | ⏳ Amber pill |
| `PARTIALLY_FUNDED` | Some installments paid, more remaining | 📊 Blue pill |
| `FULLY_FUNDED` | All payments confirmed | ✅ Green pill |

### 3. Funding Confirmation Sources

| Source | Detection | Evidence |
|:---|:---|:---|
| **Stripe (Card)** | Automatic — webhook `checkout.session.completed` | Stripe session ID, receipt URL |
| **Plaid (ACH)** | Automatic — webhook `payment_intent.succeeded` | Plaid transaction ID |
| **Wire Transfer (Chase)** | Manual — countersigner confirms | Reference number + notes |
| **External Payment** | Manual — countersigner uploads PDF or enters reference | PDF evidence URL or text reference |

### 4. Lifecycle Transition Rules

| From | To | Trigger |
|:---|:---|:---|
| `FULLY_EXECUTED` + `FULLY_FUNDED` | `COMPLETED` | All payment installments confirmed |
| `FULLY_EXECUTED` + `UNFUNDED` | Remains `FULLY_EXECUTED` | Displays as "Active — Awaiting Funding" |
| `COMPLETED` | `ARCHIVED` | Subscription period expired + development deliverables completed |
| Any | `ARCHIVED` | Manual archival by admin |

### 5. Provider Workflow Corrections (ADR-014 Amendment)

When a provider (countersigner) opens an **existing** contract:
- **Step 1 (Designate Client)** is **skipped** — the client was already designated at creation
- The provider auto-advances to the appropriate step based on contract status:
  - `DRAFT`/`ACTIVE` → Step 2 (Review)
  - `SIGNED`/`WAITING_FOR_COUNTERSIGN` → Step 3 (Countersign)
  - `FULLY_EXECUTED` → Step 4 (Finalize + Funding Confirmation)

Step 1 remains accessible **only** for new contract creation (no existing `contractId`).

### 6. Funding Confirmation UI

After countersigning (Step 4), the provider sees a **Funding Status Confirmation** panel with:
1. Three toggle buttons: "Not Yet Funded" / "Partially Funded" / "Fully Funded"
2. A text area for payment notes (wire reference, receipt info, etc.)
3. Future: PDF upload for payment evidence (requires Cloud Storage endpoint — Phase 3)

### 7. Back Navigation

The "← Back to Vault" breadcrumb is now visible on:
- Deep vault links (`/vault/{userId}/contracts/...`)
- The sign domain (`sign.sirsi.ai` / `sirsi-sign.web.app`)

This was previously only visible for vault context links, leaving sign-domain users without navigation.

## Implementation Artifacts

| Artifact | Location | Change |
|:---|:---|:---|
| SirsiVault | `components/tabs/SirsiVault.tsx` | Auto-advance useEffect, funding state, funding confirmation UI |
| VaultDashboard | `components/vault/VaultDashboard.tsx` | Extended `getStatusLabel` for FULLY_EXECUTED, COMPLETED, ACTIVE_FUNDED |
| AgreementWorkflow | `components/workflow/AgreementWorkflow.tsx` | Breadcrumb condition widened for sign domain |
| This ADR | `docs/ADR-019-CONTRACT-LIFECYCLE.md` | Lifecycle formalization |

## Phase 3 — Backend (Future Sprint)

| Item | Requirement |
|:---|:---|
| Proto schema | New `FundingStatus` enum, `funding_evidence_url` string, `funding_notes` string, `completed_at` timestamp |
| Auto-detection | Stripe webhook → set `FULLY_FUNDED` when all installments clear |
| PDF upload | Cloud Storage endpoint for manual payment evidence |
| Archival cron | Cloud Function to auto-archive contracts past subscription end date |

## References

- ADR-014: Bipartite Contract Execution Protocol
- ADR-015: OpenSign Integration (payment session creation)
- ADR-012: Dynamic Financial Calculation & Multipliers

---

*Accepted: 2026-02-13*
