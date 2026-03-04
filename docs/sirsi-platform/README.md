# Sirsi Platform Documentation

**Source:** Mirrored from `sirsi-opensign` repository  
**Last Updated:** 2026-03-03

This directory contains supplementary documentation for Sirsi platform services (payment workflows, service registry). ADRs have been consolidated into the main registry at `docs/ADR-INDEX.md`.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [PAYMENT_WORKFLOW.md](./PAYMENT_WORKFLOW.md) | Business and technical payment flows with diagrams |
| [SERVICES_REGISTRY.md](./SERVICES_REGISTRY.md) | **Master list of all Sirsi services** |

### Related ADRs (moved to `docs/`)
| New ID | Title |
|--------|-------|
| [ADR-006](../ADR-006-HMAC-SECURITY-LAYER.md) | HMAC Security Layer (formerly sirsi-platform/ADR-003) |
| [ADR-007](../ADR-007-CONTRACTS-GRPC-SERVICE.md) | Contracts gRPC Service (formerly sirsi-platform/ADR-004) |
| [ADR-008](../ADR-008-PRINTABLE-MSA-VIEWER.md) | Printable MSA Viewer (formerly sirsi-platform/ADR-005) |

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
