# Continuation Plan: Sirsi Sign & FinalWishes Workflow Completion

**Date:** 2026-02-16
**Context:** Resuming from the Royal Neo-Deco design refinement and PDF/CORS bug investigation.

---

## 🛠 What was just completed (The "Detour" fixes)
1.  **CORS Resilience**: Added `localhost:5173` and `127.0.0.1:5173` (Vite defaults) to the `opensignApi` whitelist in `sirsi-auth/functions`. This resolves the "button not working" issue during local development.
2.  **PDF Infrastructure**: Implemented the `GET /api/envelopes/:id/pdf` endpoint in the backend. 
    *   If a signed PDF exists in storage, it serves it.
    *   If not, it dynamically generates a fresh one using `puppeteer` based on the legal template and current signature state.
3.  **Role Detection (ADR-014)**: Refined the `SirsiVault` component to automatically detect if the user is a **Provider** (Countersigner) or **Client** based on their Firebase Auth email.
4.  **Auto-Advancement**: Implemented logic to skip the "Designate Client" step for Providers if they are opening an existing contract (Status > DRAFT).

---

## 🎯 Current Priority: The Tameeka Lockhart Contract
We need to get the Live FinalWishes contract working end-to-end to close out this milestone.

### Phase A: Financial Integrity (Rule 12 & 13)
- [ ] **Verify Calculations**: Ensure `totalInvestment` in `SirsiVault.tsx` perfectly matches the `catalog.ts` source of truth.
- [ ] **Installment Math**: Double-check the rounding logic for 2/3/4-month payment plans.
- [ ] **Discount Realization**: Ensure the "Market Multiplier" (2.0x) is correctly displayed in the `printable-msa.html` Exhibit B.

### Phase B: Execution Workflow
- [ ] **Signature Evidence**: Ensure `SHA-256` hashing is captured and stored in the contract record upon execution.
- [ ] **Countersign Ceremony**: Verify that Cylton can log in, see the signed contract, and add the final countersignature.
- [ ] **Funding Verification (ADR-019)**: Finalize the UI for the Provider to mark a contract as `FULLY_FUNDED` after ACH/Wire confirmation.

### Phase C: Sign.Sirsi.ai Landing Page
- [ ] **Vault Dashboard**: Finalize the centralized dashboard where users see all their active agreements.
- [ ] **Referral Routing**: Ensure that a link like `sign.sirsi.ai/vault/tlockhart` correctly routes to the specific FinalWishes agreement.

---

## 🚀 Technical Reminders
- **Stack**: React 19 + TanStack Router (Sign) / Go + gRPC (Core).
- **Deployment**: `sign.sirsi.ai` is hosted on `sirsi-sign.web.app`.
- **Legacy Files**: Use `printable-msa.html` and `contract.css` as the canonical design sources for legal docs.

---
**Next Step Recommendation:** Run the dev server and test the "Preview & Download" button on `localhost:5173` to verify the CORS fix, then proceed to the Countersign ceremony.
