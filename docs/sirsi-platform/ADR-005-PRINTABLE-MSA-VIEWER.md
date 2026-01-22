# ADR-005: Printable MSA Viewer Component

**Status:** Accepted  
**Date:** 2026-01-21  
**Author:** Antigravity (AI Agent)  
**Supersedes:** None

---

## Context

The Sirsi contract signing workflow requires a professional, printable Master Services Agreement (MSA) and Statement of Work (SOW) document that:
1. Renders as a clean, legal-quality black & white document
2. Dynamically populates all financial values, dates, and client information
3. Supports browser print-to-PDF functionality
4. Adheres to the "Royal Neo-Deco" design system for on-screen elements

## Decision

We implement `printable-msa.html` as a **self-contained, static HTML document** that:
- Lives in the `public/` directory of `finalwishes-contracts` package
- Receives all dynamic data via **URL query parameters**
- Contains all styling inline (no external CSS dependencies)
- Calculates derived financial values client-side via JavaScript

## Architecture

### File Location
```
packages/finalwishes-contracts/
├── public/
│   └── printable-msa.html    ← The canonical MSA/SOW viewer
└── src/
    └── components/tabs/
        └── SirsiVault.tsx    ← Opens the viewer via openPrintableMSA()
```

### URL Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `client` | string | Yes | - | Client name (URL encoded) |
| `date` | string | Yes | - | Effective date (e.g., "January 21, 2026") |
| `plan` | number | Yes | 2 | Payment plan months (2, 3, or 4) |
| `total` | number | Yes | 200000 | Total contract value in USD |
| `weeks` | number | Yes | 16 | Project timeline in weeks |
| `hours` | number | No | calculated | Total WBS hours (for accurate Exhibit B) |
| `signed` | boolean | No | false | Whether to display signatures |
| `address` | string | No | - | Client address |

### Example URL
```
/printable-msa.html?client=Cylton%20Collymore&date=January%2021,%202026&plan=2&total=113000&weeks=16&hours=520
```

## Dynamic Calculations (Exhibit B)

The viewer calculates all financial values from the `total` and `hours` parameters:

```javascript
// Use actual hours if provided, otherwise estimate
const devHours = totalHours > 0 ? totalHours : Math.round(totalAmount / 110);

// Gross Development Value = hours × $250/hr market rate
const grossDevValue = devHours * 250;

// Discounts
const efficiencyDiscount = Math.round(grossDevValue * 0.33);  // 33% Sirsi efficiency
const familyDiscount = grossDevValue - efficiencyDiscount - totalAmount;  // Remainder

// Comparison values
const agencyMarketValue = Math.round(totalAmount * 2);   // 2x for typical agency
const biglawMarketValue = Math.round(totalAmount * 5);   // 5x for Big Law
```

### Value Proposition Display

The "TOTAL MARKET VALUE" row in Exhibit B shows `grossDevValue` (not the discounted price) to demonstrate the **true value Sirsi provides**. The Discount Realization section then explains how the client receives this value at the lower net price.

## Dynamic Elements (DOM IDs)

The following elements are updated via JavaScript:

### Section 4: Payment Structure
- `#contract-value` - Total contract value paragraph
- `#payment-plans-container` - Generated 2/3/4 month payment options

### SOW Header
- `#sow-timeline` - "X Weeks (Y Months)"
- `#sow-target-date` - Calculated completion date

### Exhibit B: Cost & Valuation
- `#sirsi-contract-value` - Shows gross dev value (market rate)
- `#partnership-price` - Final contract price
- `#net-contract-price` - Final contract price
- `#gross-dev-value` - Hours × $250/hr
- `#dev-hours` - Total WBS hours
- `#efficiency-discount` - 33% efficiency savings
- `#family-discount` - Partnership discount
- `#agency-platform-cost` - Comparison value
- `#biglaw-platform-cost` - Comparison value
- `#agency-market-value` - Comparison total
- `#biglaw-market-value` - Comparison total

### Signature Page
- `#client-signature-display` - Client signature (when signed=true)
- `#client-name-display` - Client name
- `#client-date-display` - Signature date
- `#provider-signature-display` - Sirsi signature (auto: Cylton Collymore)
- `#provider-date-display` - Signature date

## Styling

### Print UI Bar (Screen Only)
The document includes a "Royal Neo-Deco" styled header bar that:
- Uses gradient background (`#1a2a3a` to `#0d1520`)
- Features gold accent border (`#C8A951`)
- Contains text-only buttons (no icons)
- Hides completely when printing (`@media print`)

### Document Styling
- **Font**: Merriweather (body), Cinzel (headings)
- **Page Size**: US Letter with 1-inch margins
- **Print Headers/Footers**: Via @page CSS rules
- **Colors**: Black & white for print compatibility

## React Integration

```tsx
// In SirsiVault.tsx
const openPrintableMSA = () => {
    const timeline = calculateTimeline(selectedBundle, selectedAddons);
    const hours = calculateTotalHours(selectedBundle, selectedAddons);
    const msaUrl = `/printable-msa.html?client=${encodeURIComponent(signatureData.name)}&date=${encodeURIComponent(currentDate)}&plan=${selectedPaymentPlan}&total=${totalInvestment}&weeks=${timeline}&hours=${hours}`;
    window.open(msaUrl, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');
};
```

## Consequences

### Positive
- ✅ Self-contained document with no external dependencies
- ✅ Works offline once loaded
- ✅ Browser-native print-to-PDF functionality
- ✅ Fast load times (no framework overhead)
- ✅ Easy to maintain and update

### Negative
- ⚠️ URL parameters can be manipulated (not for final legal use)
- ⚠️ Requires manual updates if contract structure changes

### Mitigations
- For executed contracts, use server-signed PDFs stored in Vault
- Keep `printable-msa.html` in sync with `CONTRACT.md` canonical source

## Related Documents

- `proposals/CONTRACT.md` - Canonical contract language source
- `proposals/SOW.md` - Canonical SOW source
- `ADR-004-CONTRACTS-GRPC-SERVICE.md` - Backend contract storage
- `ADR-003-HMAC-SECURITY-LAYER.md` - Document security

---

**Signed,**  
**Antigravity (The Agent)**
