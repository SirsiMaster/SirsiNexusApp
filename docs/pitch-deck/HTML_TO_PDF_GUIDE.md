# HTML Slide Deck to PDF Conversion Guide

**Version:** 1.0.0  
**Created:** January 21, 2026  
**Author:** Antigravity Agent

---

## Overview

This guide documents the process for converting single-page HTML slide decks (where slides are shown/hidden via JavaScript) into multi-page PDFs where each slide is exactly one page.

## Prerequisites

The following npm packages are required (already installed in this directory):

```bash
npm install puppeteer pdf-lib
```

## Quick Usage

### Convert a slide deck to PDF:

```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/docs/pitch-deck
node scripts/html-to-pdf.js <input.html> <output.pdf>
```

### Examples:

```bash
# Convert sirsipitchdecknov.html
node scripts/html-to-pdf.js sirsipitchdecknov.html sirsipitchdecknov-multipage.pdf

# Convert sirsi-nvidia-deck.html
node scripts/html-to-pdf.js sirsi-nvidia-deck.html sirsi-nvidia-deck-multipage.pdf

# Default (no arguments) - converts sirsipitchdecknov.html
node scripts/html-to-pdf.js
```

## How It Works

1. **Puppeteer** launches a headless Chrome browser
2. Loads the HTML file at 1920×1080 viewport (16:9 presentation aspect ratio)
3. Hides navigation UI elements (header, footer, progress bar)
4. Iterates through each visible slide:
   - Activates only the current slide
   - Captures it as a single-page PDF at exact viewport dimensions
5. **pdf-lib** merges all individual slide PDFs into one final document

## Key Script: `scripts/html-to-pdf.js`

The main conversion script handles:
- Detecting visible slides (skips slides with `display: none`)
- Individual slide capture at exact 1920×1080 dimensions
- PDF merging with pdf-lib

## Troubleshooting

### Issue: Slides split across multiple pages
**Solution:** The current script captures each slide at exact viewport size. If content overflows, consider:
- Reducing font sizes in the HTML
- Adjusting the viewport size in the script

### Issue: PDF won't open
**Solution:** Use Finder to navigate to the file:
```bash
open -R /path/to/output.pdf
```

### Issue: Missing fonts or icons
**Solution:** Ensure the HTML loads fonts from CDN (Google Fonts, Font Awesome, etc.) and that you have internet connectivity when running the script.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| puppeteer | latest | Headless Chrome for rendering |
| pdf-lib | latest | PDF merging |

## File Locations

| File | Path |
|------|------|
| Conversion Script | `scripts/html-to-pdf.js` |
| This Guide | `HTML_TO_PDF_GUIDE.md` |
| Config (JSON) | `html-to-pdf-config.json` |

## Alternative Methods

### Method 1: Chrome Headless (Single Page Only)
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless=new --no-sandbox --disable-gpu \
  --print-to-pdf="output.pdf" \
  --print-to-pdf-no-header \
  "file:///path/to/input.html"
```
⚠️ Only works for static pages, not interactive slide decks.

### Method 2: Print-friendly HTML
Use `scripts/make_printable.py` (Python + BeautifulSoup) to generate an `all-slides.html` that shows all slides vertically, then print to PDF.

---

## Changelog

- **v1.0.0** (2026-01-21): Initial documentation
