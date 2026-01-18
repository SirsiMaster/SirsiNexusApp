# Standard Component: Printable Modal Document

**Last Updated:** 2026-01-06  
**Status:** Canonized Standard  
**Adoption:** Required for all document viewing/printing flows (FinalWishes, SirsiNexus)

---

## 1. Overview
This standard defines the architecture for presenting printable legal documents (Contracts, SOWs, Receipts, etc.) in a web-based environment. It replaces complex client-side PDF generation (jsPDF/html2pdf) with a simpler, more robust **Native Browser Print** workflow wrapped in a curated UI.

### Why This Approach?
*   **Fidelity:** Browser print engines (Chromium/WebKit) render CSS Grid/Flexbox better than JS libraries.
*   **Reliability:** No massive JS bundles or cross-origin canvas tainting issues.
*   **User Experience:** Provides a clear "Print / Save as PDF" action bar that disappears automatically on print.

---

## 2. Implementation Guide

### A. The Stylesheet (Core)
Include the standardized CSS in your printable HTML file. This handles the `@media print` logic and the Action Bar styling.

```html
<link rel="stylesheet" href="/assets/css/sirsi-print-ui.css">
```

### B. The HTML Structure
Your printable page must follow this structure. The `.print-ui-bar` is critical.

```html
<body>
    <!-- 1. ACTION BAR (Hidden on Print) -->
    <div class="print-ui-bar no-print">
        <div class="brand">
            <span class="gold">Final</span>Wishes <span class="divider">|</span> Document Viewer
        </div>
        <div class="actions">
            <!-- Print Trigger -->
            <button onclick="window.print()" class="print-btn print-btn-gold">
                <svg>...</svg> Print / Save as PDF
            </button>
            <!-- Close Trigger -->
            <button onclick="window.close()" class="print-btn print-btn-outline">
                Close Window
            </button>
        </div>
    </div>

    <!-- 2. DOCUMENT CONTENT (Visible on Print) -->
    <div class="document-content">
        <h1>Master Services Agreement</h1>
        ...
    </div>
</body>
```

### C. The Trigger (JavaScript)
Launch the printable page in a centered popup window. Do NOT use `_blank` tab, as it breaks the "App-like" feel.

```javascript
/* Standard Popup Launcher */
function openPrintableDocument(url, title) {
    const width = 1000;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
        url, 
        title, 
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
}
```

---

## 3. Design Tokens (CSS Variables)

The `sirsi-print-ui.css` accepts overrides for body padding adjustments if your document layout requires it.

```css
:root {
    /* Adjusts the negative margins of the action bar to align with body padding */
    --print-body-padding: 40px; 
}
```

## 4. Migration Status

| Application | Feature | Status |
| :--- | :--- | :--- |
| **FinalWishes** | MSA Contract Viewer | ✅ **Canonized** (v1.0) |
| **SirsiNexus** | Proposal Viewer | ⏳ Pending Adoption |
| **OpenSign** | Audit Log Printer | ⏳ Pending Adoption |
