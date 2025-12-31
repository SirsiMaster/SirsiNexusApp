# Sirsi Services Registry

**Last Updated:** 2025-12-31  
**Maintainer:** Architecture Team

This document serves as the **canonical source of truth** for all Sirsi microservices and their deployment locations.

---

## Active Services

### Core Platform

| Service | URL | Project | Status |
|---------|-----|---------|--------|
| **Sirsi OpenSign API** | `https://us-central1-sirsi-opensign.cloudfunctions.net/api` | sirsi-opensign | ✅ Live |
| **Contracts gRPC** | `https://contracts-grpc-210890802638.us-central1.run.app` | sirsi-nexus-live | ✅ Live |
| **Sirsi Sign Portal** | `https://sirsi-sign.web.app` | sirsi-opensign | ✅ Live |

### E-Signature

| Service | URL | Project | Status |
|---------|-----|---------|--------|
| **DocuSeal** | `https://sign.sirsi.ai` | sirsi-nexus-live | ✅ Live |

---

## Service Details

### Contracts gRPC Service

**Purpose:** Centralized contract management, template generation, and payment processing.

- **Deployment:** Cloud Run
- **Region:** us-central1
- **Health Check:** `GET /health`
- **Documentation:** [ADR-004](ADR-004-CONTRACTS-GRPC-SERVICE.md)

**Endpoints:**
```
POST /api/contracts              - Create contract
POST /api/contracts/list         - List contracts
POST /sirsi.contracts.v1.ContractsService/GeneratePage - Generate HTML
POST /sirsi.contracts.v1.ContractsService/CreateCheckoutSession - Stripe
```

---

### Sirsi OpenSign API

**Purpose:** E-signature envelope management, HMAC-signed redirects, PDF generation.

- **Deployment:** Firebase Functions (Gen 2)
- **Documentation:** [ADR-003](ADR-003-HMAC-SECURITY-LAYER.md)

**Key Endpoints:**
```
POST /api/guest/envelopes        - Create guest signing envelope
POST /api/security/verify        - Verify HMAC signature
POST /api/payments/create-session - Stripe checkout
GET  /api/envelopes/:id/pdf      - Download signed PDF
```

---

## Cross-Project Integration

All Sirsi projects should use these service URLs:

```javascript
// Service configuration
const SIRSI_SERVICES = {
  contractsGrpc: 'https://contracts-grpc-210890802638.us-central1.run.app',
  openSignApi: 'https://us-central1-sirsi-opensign.cloudfunctions.net/api',
  signPortal: 'https://sirsi-sign.web.app',
  docuSeal: 'https://sign.sirsi.ai'
};
```

---

## Updating This Document

When adding or modifying services:
1. Update this file with new service details
2. Create an ADR in `/docs/` for architectural decisions
3. Update individual project README files
4. Notify team via standard channels
