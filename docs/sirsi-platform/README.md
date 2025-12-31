# Sirsi Platform Documentation

**Source:** Mirrored from `sirsi-opensign` repository  
**Last Updated:** 2025-12-31

This directory contains canonical documentation for the Sirsi platform services that integrate with SirsiNexusApp.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [PAYMENT_WORKFLOW.md](./PAYMENT_WORKFLOW.md) | Business and technical payment flows with diagrams |
| [SERVICES_REGISTRY.md](./SERVICES_REGISTRY.md) | **Master list of all Sirsi services** |
| [ADR-003-HMAC-SECURITY-LAYER.md](./ADR-003-HMAC-SECURITY-LAYER.md) | HMAC security implementation |
| [ADR-004-CONTRACTS-GRPC-SERVICE.md](./ADR-004-CONTRACTS-GRPC-SERVICE.md) | gRPC Contracts Service architecture |

---

## Quick Reference

### Service URLs

```javascript
const SIRSI_SERVICES = {
  contractsGrpc: 'https://contracts-grpc-210890802638.us-central1.run.app',
  openSignApi: 'https://us-central1-sirsi-opensign.cloudfunctions.net/api',
  signPortal: 'https://sirsi-sign.web.app',
  docuSeal: 'https://sign.sirsi.ai'
};
```

### Health Checks

```bash
# Contracts gRPC Service
curl https://contracts-grpc-210890802638.us-central1.run.app/health

# OpenSign API
curl https://us-central1-sirsi-opensign.cloudfunctions.net/api/health
```

---

## Source Repository

All source files are maintained in: `~/Development/sirsi-opensign/`

To update this mirror:
```bash
cp ~/Development/sirsi-opensign/docs/*.md ~/Development/SirsiNexusApp/docs/sirsi-platform/
```
