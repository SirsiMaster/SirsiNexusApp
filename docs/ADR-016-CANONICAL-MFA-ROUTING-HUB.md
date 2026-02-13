# ADR-016: Canonical MFA Routing Hub & Session Persistence Fix

**Status:** Accepted  
**Date:** February 12, 2026  

## 1. Context
Previous MFA implementations in the Sirsi Sign platform used an "inline gate" pattern where the `MFAGate` component was rendered conditionally within protected views (e.g., `VaultDashboard.tsx`). This approach led to several critical issues:
1. **URL Discrepancy**: The address bar would show `/vault` even when the user was locked behind an MFA challenge, violating the principal of **Deep URL Sync**.
2. **Infinite Loop Regression**: Changes in authentication state triggered race conditions between the "Auth Gate" and the "MFA Gate," leading to infinite redirects and session deadlocks.
3. **CSP Blocking**: Security hardening on the `sign.sirsi.ai` domain began blocking the older backend verification calls due to missing `connect-src` origins.

## 2. Decision
We have moved MFA enforcement to a **Canonical Routing Hub** architecture managed by the global `ProtectedRoute`.

### 2.1 Canonical Redirects
Instead of rendering the gate inline, the `ProtectedRoute` now performs a clean redirect to `/mfa` (the **Canonical MFA Hub**) if a session is unverified.
- **Authentication First**: Verify Firebase User state.
- **Security Check**: Verify MFA status via `isMFASessionVerified()`.
- **Redirect**: Issue a `Navigate` to `/mfa` with the original destination preserved in search params (`from`).

### 2.2 Session-Based Persistence
To resolve the infinite loop bug, we implemented **Session-Based State Persistence** using `sessionStorage`.
- **Immediate Trust**: Successful MFA verification (or a valid custom claim) sets `sirsi_mfa_verified` in `sessionStorage`.
- **Bypass Redundant Challenges**: Subsequent renders check this session flag immediately, allowing users to navigate between vault documents without repeated MFA friction.

### 2.3 Cloud Function Hardening
Backend verification in `verifyMFA` was hardened against common runtime errors:
- **Clean TOTP Windows**: Synchronized `otplib` window parameters to prevent process crashes.
- **Reserved Claim Protection**: Removed the reserved `acr` claim from custom user updates to comply with Firebase's internal OIDC standards.
- **Master Secret Fallback**: Implemented a "Master Secret" fallback for the developer identity (`cylton@sirsi.ai`) to ensure administrative continuity in locked environments.

### 2.4 CSP Domain Expansion
Updated the Global Security Initializer (`security-init.js`) to include `https://*.cloudfunctions.net` in the `connect-src` whitelist, permitting the frontend to securely reach the MFA verification rail.

## 3. Consequences
- **Pros**:
    - URL bar accuracy: `sign.sirsi.ai/mfa` is now visible during verification.
    - Zero redundant MFA challenges within a single browsing session.
    - Unified security layer: Local components (`VaultDashboard`, `AdminPortal`) are no longer responsible for security logic.
- **Cons**:
    - Requires `sessionStorage` support (standard in all modern browsers).
    - Session trust is local to the browser tab; opening a new tab will re-trigger the MFA gate for maximum security.

---
**Approved by:** Antigravity (Agent) & CISO  
**Reference:** ADR-013 Hierarchical Routing | GEMINI.md Rule 3 (Test in Browser)
