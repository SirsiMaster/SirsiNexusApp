# ADR-003: HMAC-Based Security Layer for Multi-Tenant Vault

**Date:** December 31, 2025
**Status:** Accepted
**Context:** The secure document vault (`sign.sirsi.ai`) requires a mechanism to prevent MITM (Man-In-The-Middle), URL tampering, and replay attacks during the redirect flow from tenant projects (e.g., FinalWishes) to the signing vault. Traditional mTLS (Mutual TLS) is not supported by Firebase Hosting's shared infrastructure.
**Decision:** Implement a **Software-Defined Cryptographic Trust Layer** using HMAC-SHA256 (Hash-Based Message Authentication Code).

## 1. Technical Choice: HMAC-SHA256
We chose HMAC-SHA256 over other options (JWT, Plain TLS, IP Allow-listing) because:
- **No Hardware Required**: Works on standard cloud functions (Node.js `crypto` module).
- **Stateless Verification**: The server verifies signatures mathematically without querying a database (latency < 1ms).
- **Time-Limited**: Signatures include a timestamp (`_ts`), automatically expiring links after 5 minutes to prevent replay attacks.
- **Tamper-Proof**: Any change to the URL parameters (PROJECT_ID, AMOUNT, ENVELOPE_ID) invalidates the signature hash.

## 2. Architecture: "The Secure Handshake"
The redirect flow is no longer a simple link. It is a cryptographic handshake:

1.  **Initiation (Tenant)**: Tenant requests a signing session via API.
2.  **Signing (Vault API)**: Vault API generates a `redirectUrl` signed with a **Secret Key**.
    *   `Signature = HMAC_SHA256(EnvelopeID + ProjectID + Timestamp + Nonce, SECRET_KEY)`
3.  **Transmission**: User is redirected to `sign.sirsi.ai/sign.html?_sig=...`
4.  **Verification (Vault Client)**: The frontend `sign.html` pauses execution. It sends the URL parameters back to the Vault API (`/api/security/verify`).
5.  **Validation**: Vault API re-calculates the hash.
    *   **Mismatch**: 403 Forbidden (Tampering detected).
    *   **Match**: 200 OK + Issue Session Token.

## 3. Reusability (The "Sirsi Secure Component")
This architecture is encapsulated as a reusable microservice component.
- **Location**: `sirsi-opensign/functions/index.js` (Security Layer)
- **Configuration**: `HMAC_SECRET` (Env Var), `allowedOrigins` (Config).
- **Scalability**: New projects are onboarded by adding their domain to `allowedOrigins`. No code changes required to the core logic.

## 4. Consequences
- **Positive**: Banking-grade security for redirect flows without expensive infrastructure (HSM/Private mTLS).
- **Positive**: centralized security logic; tenants don't implement their own crypto.
- **Negative**: Requires strict time synchronization (NTP) on the server (handled automatically by Google Cloud).
- **Negative**: "Magic Links" are now strictly time-bound; users cannot save a signing link for later use (they must re-initiate).

## 5. Implementation Status
- **Component**: `Sirsi Secure Vault (v1.0)`
- **Deployed**: `sign.sirsi.ai` (Global)
- **Repo**: `sirsi-opensign`
