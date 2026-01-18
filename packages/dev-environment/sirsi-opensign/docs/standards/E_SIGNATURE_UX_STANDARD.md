# E-Signature Workflow & Verification Standard
**Status:** Canonical
**Last Updated:** January 6, 2026
**Version:** 2.0 (Streamlined + Audit Trail)

## 1. Overview
This document defines the standard for the SirsiNexus E-Signature workflow, specifically for the "Legacy/Final Wishes" module. It establishes the "Streamlined" flow which consolidates signer identification and execution into a single, seamless interface.

## 2. User Experience Flow

### Step 1: Dashboard Trigger (`index.html`)
- **Action:** User clicks "Sign Agreement".
- **Logic:** 
  - Checks for selected Plan (A, B, or C).
  - Determines total Amount.
  - **CRITICAL CHANGE:** Bypasses any local "Guest Modal".
  - **Redirect:** Immediately redirects to `sign.html` with query parameters: `?project=finalwishes&plan=Plan C&amount=33333.33`.
  
### Step 2: Consolidated Signing Interface (`sign.html`)
- **Data Entry:**
  - **Full Legal Name:** Input field at the top.
  - **Email Address:** Input field at the top.
  - **Validation:** Both fields are REQUIRED to enable the submit button.
- **Signature Input:**
  - **Tabs:** "Draw" (Canvas) or "Type" (Font Selection).
  - **Fonts:** Script (Dancing Script), Elegant (Great Vibes), Classic (Alex Brush).
  - **Active State:** Gold solid background for active tab.
- **Execution:**
  - User draws/types signature.
  - User checks "Legal Consent" box.
  - User clicks "Complete Signature".
- **Post-Process:**
  - System simulates secure processing (1.5s).
  - Shows "Success" screen with "Download Signed PDF" button.
  - **Auto-Redirect:** Automatically redirects to `payment.html` after 3 seconds.
  - **Popup:** Automatically opens the Signed PDF (`printable-msa.html`) in a new window.

### Step 3: Signed Artifact Generation (`printable-msa.html`)
- **Trigger:** Opened with parameter `?signed=true`.
- **Dynamic Content:**
  - **Client Signature:** Renders the user's name (from `?client=...`) in "Great Vibes" script font.
  - **Provider Signature:** Automatically stamps "Cylton Collymore" as the provider.
  - **Dates:** Fills effective dates.
- **Security Audit Trail:**
  - **Visibility:** Only visible when `signed=true`.
  - **Location:** Footer of the Signature Section.
  - **Content:**
    - **Envelope ID:** Unique UUID for the session.
    - **Timestamp:** UTC Verified timestamp.
    - **Checksum:** Cryptographic hash of the document state.
    - **Compliance:** SOC 2 / ESIGN Act Badge.

## 3. Technical Implementation Details

### File Structure
- `public/sign.html`: The monolithic signing interface.
- `public/finalwishes/contracts/index.html`: The trigger point.
- `public/finalwishes/contracts/printable-msa.html`: The template that transforms into the legal artifact.

### URL Logic
- **Sign URL:** `https://sign.sirsi.ai/sign.html?plan=...&amount=...`
- **PDF URL:** `https://sign.sirsi.ai/finalwishes/contracts/printable-msa.html?signed=true&client=...`
- **Payment URL:** `https://sign.sirsi.ai/payment.html?amount=...&ref=...`

## 4. Compliance & Security
- **No Caching:** All HTML files have `Cache-Control: no-store` to prevent stale form data.
- **Audit:** Every signed PDF includes a tamper-evident audit block.
- **Identity:** Email and Name are captured at the point of signing for attribution.

---
**Approved By:** Cylton Collymore
**System:** SirsiNexus V4
