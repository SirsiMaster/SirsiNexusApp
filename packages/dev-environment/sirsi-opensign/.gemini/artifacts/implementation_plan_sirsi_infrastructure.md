# Implementation Plan: Sirsi Infrastructure Layer (Payment & Signature)

**Date:** January 17, 2026  
**Project:** Sirsi Multi-Tenant Lifecycle Infrastructure  
**Status:** In Progress (Transitioning Reference Implementation)

## 1. Objective
Establish a centralized, modular engine for contract lifecycle management (CLM), electronic signatures (Sirsi OpenSign), and payment processing (Stripe). This infrastructure serves the entire Sirsi Portfolio. **FinalWishes** is the first project being onboarded into this infrastructure.

## 2. Progress Checklist

### Core Governance & Docs
- [x] Identify Canonical Documentation (`ADR-001`, `TECHNICAL_DESIGN`, etc.)
- [ ] Update `ADR-001` with Sirsi Infrastructure Layer architecture
- [ ] Create `ADR-007: Modular CLM Engine Decoupling`
- [ ] Document "Onboarding Recipe" for future portfolio projects

### The CLM Engine (Contracts)
- [x] Dynamic WBS/Atomic Breakdown (Core + Add-ons)
- [x] Dynamic Pricing & Payment Schedule Synchronization
- [x] Conditional Legal Provisions (AI Disclosure, Financial Addendum)
- [ ] **NEXT:** Decouple template-view (`index.html`) from project-specific content
- [ ] Move "Scope Summary" and "Legal Metadata" to `catalog-data.js`

### Execution & Signing (OpenSign)
- [x] Consolidated Signing Flow (`initiateOpenSign` -> `sign.html`)
- [x] Project-based routing (`PROJECT_ID` param)
- [ ] **NEXT:** Agnostic Vault attribution (Ensure evidence is logged per project)

### Payment Infrastructure (Stripe)
- [x] Stripe environment configuration (Live/Test toggle)
- [ ] **NEXT:** Standardize `payment.html` parameters across the portfolio

## 3. Immediate Action Steps

### Task 1: Governance & Documentation Updates
1. Update `docs/ADR-001-ARCHITECTURE-DECISIONS.md` to formalize the "Sirsi Infrastructure Layer".
2. Update `docs/TECHNICAL_DESIGN.md` to describe the multi-tenant/multi-project handoff.
3. Update `GEMINI.md` to acknowledge the "Infrastructure First" directive.

### Task 2: Refactor Contract Template for Portability
1. Identify all project-specific strings in `public/finalwishes/contracts/index.html`.
2. Map these strings to the `catalog-data.js` structure.
3. Update `updateMSAAppendix` and `updateMSADynamicContent` to fetch descriptions from the catalog instead of hardcoded switch cases.

### Task 3: Portfolio Integration Framework
1. Define the `SirsiHandshake` object (The data structure passed from one project into the Sirsi Payment Layer).
2. Validate the flow: External Link -> Sirsi Offerings -> Sirsi Contract -> Sirsi Sign -> Sirsi Pay -> Redirect Back.

---
## 4. Canonical Status Update (Phase 1)
- **Infrastructure Progress:** 65% Complete
- **Reference Implementation (FinalWishes):** 80% Complete
- **Goal:** Enable a 1-day onboarding for any new Sirsi Portfolio project.
