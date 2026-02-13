# Process Flow: Sirsi Nexus MFA & Document Vault
**Version:** 2.0.0
**Date:** February 9, 2026

## 1. Overview
The Sirsi Nexus ecosystem uses a multi-layered approach to secure legal documents and financial operations. This document explains how identity is verified, how data is protected, and how information routes between systems using the consolidated **Front Gate** architecture.

---

## 2. The Consolidated Front Gate (Landing & Login)

### 2.1 Unified Entry Point
The Landing Page and Login form are consolidated into a single screen at the root path (`/`).
- **Unauthenticated Users**: See the branding, features, and the login/registration form.
- **Authenticated Users**: The `onAuthStateChanged` listener immediately redirects them to `/vault`.
- **Navigation**: The root path (`/`) replaces the separate `/landing` and `/login` routes for a seamless experience.
- **Dedicated MFA Route**: `/mfa` handles both `verify` and `enroll` modes for canonical access.

### 2.2 Master Identity (Cylton Collymore)
- **Email**: `cylton@sirsi.ai`
- **Role**: `provider` (Administrator)
- **MFA Creds**: Authenticator secret provided during onboarding.

---

## 3. The Security Gate (Multi-Channel MFA)

### 3.1 Bipartite Enforcement
After standard Firebase authentication, users are challenged by the **MFAGate**. Verification status is stored in **sessionStorage** (`sirsi_mfa_verified`) to prevent "Claim Lag" or infinite loop issues caused by Firebase token propagation delays.

### 3.2 MFA Channels
Users can verify via three independent methods:
1. **Authenticator App (TOTP)**: Verified via the `verifyMFA` Cloud Function.
2. **SMS Verification**: 6-digit code sent via Twilio (`/api/security/mfa/send`).
3. **Email Verification**: 6-digit code sent via Nodemailer/SMTP (`/api/security/mfa/send`).

### 3.3 Verification Persistence
- **Verified State**: `sessionStorage.setItem('sirsi_mfa_verified', 'true')`.
- **Session Duration**: Persistence lasts for the duration of the browser session.
- **Explicit Re-verify**: Users can trigger a re-verification from the Vault Dashboard.
- **Logout Cleanup**: `clearMFASession()` removes the verified status and signs out of Firebase.

---

## 4. Document Execution & Routing

### 4.1 Bipartite Ceremony (Dual Signature)
1. **Client Signs**: Capture signature + SHA-256 hash + Legal Ack.
2. **Status Update**: Contract moves to `WAITING_FOR_COUNTERSIGN`.
3. **Provider Countersigns**: Sirsi Architect reviews client evidence and applies secondary signature.
4. **Finalization**: Contract moves to `FULLY_EXECUTED`.

### 4.2 Financial Settlement
- **MFA Required**: MFA must be verified before payment triggers are enabled.
- **Stripe Integration**: Secure checkout for credit/debit card payments.
- **Ledger Sync**: Payment status is automatically synced to the contract record via webhooks.

---

## 5. The Vault (Data Protection)

### 5.1 Infrastructure Layer
- **Storage**: Google Cloud Storage for permanent PDF records.
- **Database**: Firestore (Metadata) + Cloud SQL (PII/Audit).
- **Encryption**: AES-256 at rest; TLS 1.3 in transit.
- **Audit Logging**: Every MFA attempt and signature is recorded in the central audit trail.

---

## 6. Recent Production Hardening
- ✅ **Consolidated Front Gate**: Merged `/landing` and `/login` into a single high-fidelity screen.
- ✅ **Session-Based MFA**: Resolved the infinite loop bug by using `sessionStorage` for immediate verification state.
- ✅ **Multi-Channel Gate**: Support for TOTP, SMS, and Email delivery.
- ✅ **Secure Sign-Out**: Integrated Firebase sign-out with MFA session clearing.
- ✅ **Admin Portal Link**: Added a direct "Document Vault" link in the Admin Portal sidebar for easier navigation.
- ✅ **Canonical MFA Route**: Created `/mfa` to handle redirects and setup flows.

