# Sirsi OpenSign (Secure Vault)

**Status:** Production (Live)
**Domain:** [sign.sirsi.ai](https://sign.sirsi.ai)
**Version:** 1.0.0

## Overview
This repository hosts the **Secure Document Vault** for the Sirsi ecosystem. It acts as a centralized microservice for all tenant projects (FinalWishes, Assiduous, Sirsi, etc.) to handle:
1.  **Secure Contract Signing**
2.  **PDF Generation & Archival**
3.  **Payment Processing Redirects**

## Key Components

### 1. Security Core (HMAC Layer)
This service uses a software-defined cryptographic trust layer to secure redirects between tenant sites and the vault. This replaces the need for hardware-based mTLS.
- **Documentation:** [docs/ADR-003-HMAC-SECURITY-LAYER.md](docs/ADR-003-HMAC-SECURITY-LAYER.md)
- **Implementation:** `functions/index.js` (Security Logic)

### 2. Multi-Tenant Architecture
The vault is project-agnostic. Tenants are onboarded via configuration, not code changes.
- **Current Tenants:** `finalwishes`, `assiduous`, `sirsi`
- **Onboarding:** Add domain to `allowedOrigins` in `functions/index.js`.

### 3. Features
- **Typed Signatures**: (Draw / Type with Google Fonts)
- **PDF Engine**: Puppeteer-based high-fidelity rendering
- **Audit Logging**: Firestore-based immutable audit trail

### 4. Contracts gRPC Service (Cloud Run)
Centralized contract management with dynamic theming and Stripe integration.
- **URL:** `https://contracts-grpc-210890802638.us-central1.run.app`
- **Documentation:** [docs/ADR-004-CONTRACTS-GRPC-SERVICE.md](docs/ADR-004-CONTRACTS-GRPC-SERVICE.md)
- **Source:** `services/contracts-grpc/`
- **Admin UI:** `public/sirsi/contracts-manager.html`

## Services Registry
For a complete list of all Sirsi services and endpoints, see [docs/SERVICES_REGISTRY.md](docs/SERVICES_REGISTRY.md).
```bash
# Install dependencies
npm install
cd functions && npm install

# Run locally
firebase emulators:start
```

## Deployment
```bash
# Deploy to Production (sirsi-nexus-live)
firebase deploy --project sirsi-nexus-live
```
