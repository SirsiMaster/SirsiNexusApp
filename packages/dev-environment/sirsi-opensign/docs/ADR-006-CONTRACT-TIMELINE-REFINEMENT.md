# ADR-006: Contract Timeline and Scope Refinement

**Status:** Accepted  
**Date:** 2026-01-17  
**Author:** Antigravity  
**Context:** FinalWishes Platform Core Contract

---

## Context

The FinalWishes Platform Core contract documentation required updates to accurately reflect:
1. The actual development timeline (16 weeks vs. 12 weeks)
2. Removal of activities not included in the core scope (third-party pen testing)
3. Accurate payment plan options
4. Correct phase descriptions and cost allocations

## Decision

### 1. Timeline Update: 12 Weeks → 16 Weeks

**Rationale:** The original 12-week timeline was optimistic and did not account for proper QA/QC buffer. The revised 16-week timeline reflects:
- 12 weeks of core development
- 4 weeks of QA, integration, and launch activities

**Impact:** All contract documents, MSA, and SOW updated to reflect this timeline.

### 2. Phase 4 Scope Clarification

**Removed:** "Third-party penetration testing"

**Rationale:** External penetration testing is expensive ($15K-$40K) and was never part of the $95,000 fixed-bid scope. The core scope includes:
- Internal security code review
- Automated security scanning
- SOC 2 evidence preparation

**Client Option:** Third-party pen testing available as add-on post-launch.

### 3. Payment Plan Options

| Plan | Payments | Amount per Payment |
|------|----------|-------------------|
| Plan 1 | 2 payments | $47,500 |
| Plan 2 | 3 monthly | $31,666 |
| Plan 3 | 4 monthly | $23,750 |

**Rationale:** Added 4-payment option for clients who prefer smaller monthly installments.

### 4. Phase Cost Allocation

| Phase | Weeks | Cost | Percentage |
|-------|-------|------|------------|
| 1. Foundation & Cloud Infrastructure | 1-4 | $24,000 | 25.3% |
| 2. Core Application Development | 5-8 | $28,000 | 29.5% |
| 3. Living Legacy Features | 9-12 | $26,000 | 27.4% |
| 4. QA, Integration & Launch | 13-16 | $17,000 | 17.9% |
| **Total** | **16** | **$95,000** | **100%** |

## Files Modified

1. `public/finalwishes/contracts/index.html`
   - Updated Phase 4 descriptions (3 locations)
   - Updated static Exhibit B cost breakdown
   - Fixed Sirsi Vault tab centering

2. `public/finalwishes/contracts/printable-msa.html`
   - Fixed raw CSS appearing in PDF output
   - Updated timeline from 12 to 16 weeks
   - Added Plan 3 (4-payment option)
   - Updated Deliverables & Schedule table
   - Updated Phase 4 in duplicate SOW section

3. `public/payment.html`
   - Changed default amount from $50,000 to $95,000
   - Fixed layout centering

4. `docs/PAYMENT_WORKFLOW.md`
   - Updated payment plans table

## Consequences

### Positive
- Contract accurately reflects deliverables and timeline
- No risk of client expectations for third-party pen test
- Clear payment options improve client flexibility
- PDF output is clean and professional

### Neutral
- Timeline extension from 12 to 16 weeks (already reflected in CORE_WBS_DATA)

### Risks
- None identified

---

## Related Documents

- [PAYMENT_WORKFLOW.md](./PAYMENT_WORKFLOW.md)
- [ADR-003: HMAC Security Layer](./ADR-003-HMAC-SECURITY-LAYER.md)
- [SERVICES_REGISTRY.md](./SERVICES_REGISTRY.md)

---

**Classification:** INTERNAL  
**Approved By:** Technical Leadership  
**Effective Date:** 2026-01-17
