# Contract Flow Architecture Redesign
**Date:** January 19, 2026  
**Author:** Antigravity Agent  
**Status:** PROPOSED

---

## 1. Current State Analysis

### Current Tab Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Tab 1: Executive Summary    (summary)                                   │
│ Tab 2: Statement of Work    (sow)      ← PROBLEM: Misnamed              │
│ Tab 3: Cost & Valuation     (cost)                                      │
│ Tab 4: Master Agreement     (contract)                                  │
│ Tab 5: Sirsi Vault          (vault)    ← Signing/Payment Portal         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Current Section Numbering in "SOW" Tab (BROKEN)
```
1. Choose Your Path           ← Selection UI
2. Strategic Add-On Modules   ← Selection UI  
3. Detailed Scope of Services ← Empty placeholder
   [JUMP TO 7]                ← Missing 4, 5, 6
7. Assumptions                ← Legal boilerplate
```

### Problems Identified
| Issue | Description | Impact |
|-------|-------------|--------|
| **Naming Mismatch** | Tab 2 is labeled "Statement of Work" but is a product configurator | User confusion |
| **Section Gap** | Jumps from 3 → 7, missing sections 4-6 | UX confusion |
| **Conceptual Error** | SOW is a document OUTPUT, not a selection interface | Legal/process error |
| **No SOW Document** | Actual SOW is never generated/shown | Missing deliverable |

---

## 2. Proposed Architecture

### Flow Diagram (n8n Style)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CONTRACT SELECTION & DISPLAY FLOW                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │   USER ENTRY    │
    │  /contracts/    │
    └────────┬────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB 1: EXECUTIVE SUMMARY (summary)                                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│ │  • Project Overview                                                                                                 ││
│ │  • Strategic Objectives                                                                                             ││
│ │  • Client Partnership Context                                                                                       ││
│ │  • Key Metrics Preview                                                                                              ││
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              [NEXT: Configure Solution →]                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB 2: CONFIGURE SOLUTION (configure) ← RENAMED from "Statement of Work"                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│ │  1. CHOOSE YOUR PATH                                                                                                ││
│ │     ┌─────────────────────┐    ┌─────────────────────┐                                                              ││
│ │     │ Core Platform Bundle│ OR │ Standalone Services │  ──────────────────────┐                                     ││
│ │     │     $95,000         │    │   À La Carte        │                        │                                     ││
│ │     └─────────────────────┘    └─────────────────────┘                        │                                     ││
│ │                                                                                ▼                                     ││
│ │  2. STRATEGIC ADD-ON MODULES                                         ┌─────────────────┐                            ││
│ │     ┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐                   │ OFFERINGS ENGINE │                            ││
│ │     │Branding││Maint. ││Estate ││Probate││Comms  │ ◀───────────────│    (catalog)    │                            ││
│ │     │$30K    ││$72K   ││$45K   ││$60K   ││$25K   │                   │  ├─ bundles     │                            ││
│ │     └───────┘└───────┘└───────┘└───────┘└───────┘                   │  ├─ products    │                            ││
│ │                                                                       │  └─ cart        │                            ││
│ │  3. SELECTION SUMMARY                                                 └────────┬────────┘                            ││
│ │     ┌─────────────────────────────────────────────┐                            │                                     ││
│ │     │ Selected: Core Platform + 2 Add-ons         │ ◀──────────────────────────┘                                     ││
│ │     │ Subtotal: $157,000 | Timeline: 24 weeks     │                                                                  ││
│ │     └─────────────────────────────────────────────┘                                                                  ││
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              [NEXT: Review Pricing →]                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
             │
             │  Cart Data (gRPC/Protobuf: CartState)
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB 3: COST & VALUATION (cost)                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│ │  1. COMPARATIVE MARKET ANALYSIS                                                                                     ││
│ │     Competitor pricing comparison                                                                                   ││
│ │                                                                                                                     ││
│ │  2. ATOMIC DEVELOPMENT BREAKDOWN (Dynamic from Cart)                                                                ││
│ │     ├─ Core Platform: $95,000                                                                                       ││
│ │     ├─ Add-on Module A: $X                                                                                          ││
│ │     └─ Add-on Module B: $Y                                                                                          ││
│ │                                                                                                                     ││
│ │  3. VALUE REALIZATION                                                                                               ││
│ │     Market Value: $XXX | Your Investment: $YYY | Savings: $ZZZ                                                      ││
│ │                                                                                                                     ││
│ │  4. TECHNOLOGY BILL OF MATERIALS                                                                                    ││
│ │     Infrastructure costs breakdown                                                                                  ││
│ │                                                                                                                     ││
│ │  5. PAYMENT SCHEDULE OPTIONS                                                                                        ││
│ │     ┌─────────┐ ┌─────────┐ ┌─────────┐                                                                             ││
│ │     │2 Payments│ │3 Payments│ │4 Payments│  ←── User selects one                                                    ││
│ │     └─────────┘ └─────────┘ └─────────┘                                                                             ││
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              [NEXT: Review Agreement →]                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
             │
             │  Payment Plan Selection
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB 4: MASTER SERVICES AGREEMENT (contract)                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│ │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐││
│ │  │ MASTER SERVICES AGREEMENT                                                                                       │││
│ │  │ 1. Recitals                                                                                                     │││
│ │  │ 2. Definitions                                                                                                  │││
│ │  │ 3. Services and Engagement                                                                                      │││
│ │  │ 4. Compensation and Payment                                                                                     │││
│ │  │ 5. Intellectual Property Rights                                                                                 │││
│ │  │ ...                                                                                                             │││
│ │  │ 11. General Provisions                                                                                          │││
│ │  │                                                                                                                 │││
│ │  │ APPENDIX A: STATEMENT OF WORK (SOW)  ←── GENERATED from selections                                              │││
│ │  │   1. Executive Overview                                                                                         │││
│ │  │   2. Detailed Scope (from cart)                                                                                 │││
│ │  │   3. Work Breakdown Structure                                                                                   │││
│ │  │   4. Deliverables                                                                                               │││
│ │  │   5. Assumptions                                                                                                │││
│ │  │                                                                                                                 │││
│ │  │ APPENDIX B: COST PROPOSAL                                                                                       │││
│ │  │   1. Executive Summary                                                                                          │││
│ │  │   2. Market Analysis                                                                                            │││
│ │  │   3. Cost Breakdown                                                                                             │││
│ │  │   4. Infrastructure BoM                                                                                         │││
│ │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘││
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              [NEXT: Execute & Sign →]                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
             │
             │  Contract + Selected Plan + Cart
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB 5: SIRSI VAULT - SIGNING & PAYMENT PORTAL (vault)                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│ │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐││
│ │  │ STEP 1: VERIFY SELECTIONS                                                                                       │││
│ │  │ Core Platform + Add-ons confirmed                                                                               │││
│ │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘││
│ │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐││
│ │  │ STEP 2: E-SIGNATURE                                                                                             │││
│ │  │ ┌───────────────────────────────────────┐                                                                       │││
│ │  │ │      OPENSIGN IFRAME/EMBED            │                                                                       │││
│ │  │ │  ┌────────────────────────────────┐   │                                                                       │││
│ │  │ │  │   Sign here: ______________   │   │                                                                       │││
│ │  │ │  │   Date: ___________________   │   │                                                                       │││
│ │  │ │  └────────────────────────────────┘   │                                                                       │││
│ │  │ └───────────────────────────────────────┘                                                                       │││
│ │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘││
│ │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐││
│ │  │ STEP 3: PAYMENT                                                                                                 │││
│ │  │ ┌───────────────────────────────────────┐                   ┌──────────────────────────────────────────────────┐│││
│ │  │ │  STRIPE ELEMENTS                      │    ─────────▶    │ Stripe API (gRPC Cloud Function)               ││││
│ │  │ │  Card: •••• •••• •••• 4242            │                   │  - Create PaymentIntent                         ││││
│ │  │ │  [Pay $47,500 Now]                    │                   │  - Create Subscription (if recurring)          ││││
│ │  │ └───────────────────────────────────────┘                   └──────────────────────────────────────────────────┘│││
│ │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘││
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              [COMPLETE: View Executed Contract]                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
             │
             │  Success
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ POST-EXECUTION                                                                                                         │
│  • Executed contract PDF stored in Cloud Storage                                                                       │
│  • Confirmation email via SendGrid                                                                                     │
│  • Contract metadata saved to Firestore                                                                                │
│  • Payment record in Stripe Dashboard                                                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow (Protobuf/gRPC)

```protobuf
// contract_selection.proto
message CartState {
    string bundle_id = 1;           // "finalwishes-core" or empty
    repeated string addon_ids = 2;   // ["branding-identity", "maintenance-support"]
    int64 total_cents = 3;           // 15700000 ($157,000)
    int32 timeline_weeks = 4;        // 24
}

message PaymentPlanSelection {
    int32 installments = 1;          // 2, 3, or 4
    int64 first_payment_cents = 2;   // 4750000 ($47,500)
    string stripe_price_id = 3;      // price_xxx
}

message ContractExecutionRequest {
    CartState cart = 1;
    PaymentPlanSelection plan = 2;
    string client_email = 3;
    string client_name = 4;
    bytes signature_image = 5;
}
```

---

## 4. Implementation Plan

### Phase 1: Rename & Restructure (Low Risk)
**Estimated Time: 30 minutes**

| Task | File | Change |
|------|------|--------|
| 1.1 | `index.html` L2178 | Rename tab button: "Statement of Work" → "Configure Solution" |
| 1.2 | `index.html` L2235 | Update tab header: "STATEMENT OF WORK (SOW)" → "CONFIGURE YOUR SOLUTION" |
| 1.3 | `index.html` L2246-2252 | Update metadata bar (remove SOW refs, add "Config Session") |
| 1.4 | `index.html` | Fix section numbering: 1→2→3 (remove gap to 7) |

### Phase 2: SOW as Generated Document (Medium Risk)
**Estimated Time: 45 minutes**

| Task | File | Change |
|------|------|--------|
| 2.1 | `index.html` | Move "Assumptions" section to Appendix A in MSA tab |
| 2.2 | `index.html` | Ensure Appendix A (SOW) dynamically reflects cart selections |
| 2.3 | `index.html` | Add "Selection Summary" section at bottom of Configure tab |

### Phase 3: Clean Numbering (Low Risk)  
**Estimated Time: 15 minutes**

**Configure Solution Tab (Tab 2):**
```
1. Choose Your Path
2. Strategic Add-On Modules
3. Selection Summary (NEW - shows cart state)
```

**Cost & Valuation Tab (Tab 3):**
```
1. Comparative Market Analysis
2. Atomic Development Breakdown
3. Value Realization
4. Technology Bill of Materials
5. Payment Schedule Options
```

**Master Agreement Tab (Tab 4):**
```
MSA Sections 1-11 (unchanged)
APPENDIX A: Statement of Work
APPENDIX B: Cost Proposal
```

---

## 5. Recommended Approach

### ✅ OPTION A: Minimal Disruption (RECOMMENDED)
- Rename Tab 2: "Statement of Work" → "Configure Solution"
- Fix numbering within Tab 2 (1, 2, 3)
- Move Assumptions to MSA Appendix A
- Keep all existing payment/signature workflows intact
- **Risk: LOW | Time: 1 hour**

### OPTION B: Full Restructure
- Split Tab 2 into "Configure" and "Review SOW"
- Add SOW preview modal before MSA
- Requires new tab logic
- **Risk: MEDIUM | Time: 3+ hours**

---

## 6. Validation Checklist

After implementation, verify:
- [ ] Tab navigation works (summary → configure → cost → contract → vault)
- [ ] Offerings Engine cart persists across tabs
- [ ] Payment plan selection updates all displays
- [ ] Stripe payment flow unchanged
- [ ] OpenSign signature flow unchanged
- [ ] Print/PDF generation includes all selected items
- [ ] No JavaScript console errors
- [ ] Mobile responsiveness maintained

---

## 7. Files Affected

| File | Changes |
|------|---------|
| `index.html` | Tab names, section numbering, content restructure |
| `catalog-data.js` | No changes (data layer intact) |
| `offerings-engine.js` | No changes (logic layer intact) |
| Stripe Functions | No changes |
| OpenSign Functions | No changes |

---

**Decision Required:** Proceed with Option A (Minimal Disruption)?
