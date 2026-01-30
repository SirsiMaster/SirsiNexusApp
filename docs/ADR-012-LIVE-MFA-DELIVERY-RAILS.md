# ADR-012: Live MFA Delivery Rails (SMS & Email)

**Status:** Approved  
**Date:** January 30, 2026  
**Context:** Following the mandate in `AUTHORIZATION_POLICY.md` (Section 4.3), all financial operations must be gated by Multi-Factor Authentication (MFA). While TOTP (Google Authenticator) serves as the "Golden Path" for high-security users, SMS and Email delivery rails are required for consumer accessibility and universal coverage.

## 1. Decision
We have implemented live delivery rails for SMS and Email MFA within the `sirsi-opensign` utility. These rails replace the previous mock implementations and connect directly to production-grade providers.

## 2. Technical Implementation

### 2.1 SMS Rail (Twilio)
- **Provider**: Twilio REST API.
- **Dispatch**: Direct POST request to Twilio's messaging endpoint from the `api` cloud function.
- **Security**: 
    - 6-digit cryptographic random numeric code.
    - 5-minute TTL (Time-To-Live).
    - One-time use enforced by automated record deletion upon verification.
- **Infrastructure**: Uses `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` stored in the Sirsi Vault (Firebase Secrets).

### 2.2 Email Rail (SendGrid/SMTP)
- **Provider**: SMTP (Nodemailer) configured with Sirsi credentials.
- **Dispatch**: Server-side generation and rendering of MFA notices.
- **Security**: 
    - Matches SMS security parameters (6-digits, 5-min TTL, single-use).
- **Infrastructure**: Uses `MAIL_USER` and `MAIL_PASS` from Firebase Secrets.

### 2.3 Unified Verification Logic
- **Backend Matching**: Verification is performed server-side. The client submits the code + target (email/phone).
- **MFA Claim**: Upon successful verification, the user session is granted the `mfa_verified` claim, unlocking the financial rails (Stripe/Plaid).

## 3. Integrated Independence
In alignment with **ADR-011 (UCS)**, these MFA rails are centralized in the `sirsi-opensign` service but serve the entire Portfolio. Any project requiring financial settlement (e.g., FinalWishes) initiates the handshake with OpenSign to verify the user's identity before processing payments.

## 4. Consequences
- **Pros**: 
    - Real-world usability for non-technical users.
    - Full compliance with `SIRSI-AP-001`.
    - Centralized audit logging of all verification attempts.
- **Cons**:
    - Introduction of third-party dependencies (Twilio).
    - SMS/Email are inherently less secure than TOTP (susceptible to SIM-swapping/phishing), but necessary for the "Recovery Path."

---
**Approved by:** CISO & CTO  
**Reference:** AUTHORIZATION_POLICY.md Section 4.3 | ADR-011 UCS Architecture
