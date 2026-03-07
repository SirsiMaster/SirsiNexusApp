# ADR-031: Unified Commerce & Signing Pipeline

**Status:** Accepted  
**Date:** March 6, 2026  
**Author:** Antigravity (The Agent)  
**Approved by:** Cylton Collymore (Superadmin)

---

## Context

Prior to v0.9.2-alpha, the Sirsi platform had two parallel commerce/signing pathways:

1. **REST via `opensign.ts`** — A hand-coded 406-line REST SDK that proxied requests to the OpenSign Cloud Functions API for contract CRUD, signing, payments, and MFA.
2. **gRPC via ConnectRPC** — The modern gRPC stack introduced in v0.8.0 for admin services (users, tenants, hypervisor).

This dual-path architecture created:
- **Inconsistent error handling** between REST (HTTP status codes) and gRPC (status enums)
- **Duplicated auth patterns** (REST used custom headers; gRPC used interceptors)
- **No type safety** on the REST layer (manual TypeScript types vs. proto-generated)
- **Maintenance overhead** of two completely separate API surfaces

## Decision

### Eliminate 100% of REST — Consolidate to gRPC

All commerce and signing operations are now served through **ConnectRPC services** running on the Go backend (`packages/sirsi-admin-service/`). The `opensign.ts` REST SDK (406 lines) has been **deleted**.

### New Services (v0.9.2-alpha)

#### CatalogService — 12 RPCs
Manages the Universal Product Catalog with auto-sync to Stripe.

| RPC | Description |
|:----|:------------|
| `ListProducts` | List products with tenant/category/archive filters |
| `GetProduct` | Get single product by ID |
| `CreateProduct` | Create product → auto-create Stripe Product + Price |
| `UpdateProduct` | Update product metadata → auto-update in Stripe |
| `ArchiveProduct` | Soft-delete (sets archived=true) |
| `RecoverProduct` | Restore archived product |
| `ListBundles` | List bundles with tenant/archive filters |
| `GetBundle` | Get single bundle by ID |
| `CreateBundle` | Create bundle → auto-create Stripe Product + Price |
| `UpdateBundle` | Update bundle metadata → auto-update in Stripe |
| `SyncToStripe` | Force-sync entire catalog to Stripe |
| `GetCatalogStats` | Aggregate stats (total, active, synced, revenue) |

#### SigningService — 12 RPCs
Manages the full document execution lifecycle.

| RPC | Description |
|:----|:------------|
| `CreateEnvelope` | Create signing envelope with signers + documents |
| `GetEnvelope` | Retrieve envelope with full signer/document details |
| `ListEnvelopes` | List envelopes with status/date filters |
| `SendEnvelope` | Dispatch envelope to signers (email notifications) |
| `VoidEnvelope` | Cancel/void an envelope |
| `CreatePayment` | Create Stripe Checkout Session for an envelope |
| `GetPaymentStatus` | Check payment status from Stripe |
| `VerifySignerMfa` | Validate TOTP code before signing |
| `RecordSignature` | Record signer's digital signature (SHA-256 evidence) |
| `DownloadPdf` | Download executed PDF with digital evidence |
| `GetVaultEntry` | Retrieve vault entry for a signed document |
| `ListVaultEntries` | List all vault entries with filters |

### Backend Architecture

```
Go Backend (packages/sirsi-admin-service/main.go)
├── AdminService      — User/role management
├── TenantService     — Provisioning (ADR-030)
├── HypervisorService — Telemetry (ADR-026)
├── CatalogService    — Product/bundle CRUD + Stripe sync (NEW)
└── SigningService    — Envelope lifecycle + payments + MFA (NEW)
```

All 5 services share:
- **ConnectRPC** on port 8080 (h2c for local, HTTPS for Cloud Run)
- **CORS middleware** allowing `https://sirsi*` origins
- **Firebase Auth interceptor** for ID token validation

### Frontend Migration

| Before | After |
|:-------|:------|
| `import { opensignApi } from '../lib/opensign'` | `import { signingClient } from '../lib/grpc'` |
| `opensignApi.createEnvelope(data)` | `signingClient.createEnvelope(data)` |
| `fetch('/api/payments/create-session')` | `signingClient.createPayment({ envelopeId })` |
| Manual TypeScript types | Proto-generated types (`signing_pb.ts`, `catalog_pb.ts`) |

## Consequences

1. **Zero REST endpoints** in the frontend — 100% gRPC via ConnectRPC
2. **Full type safety** — All request/response shapes are proto-generated
3. **Single auth pattern** — Firebase ID token interceptor on every RPC
4. **Stripe auto-sync** — Product/bundle mutations automatically create/update Stripe objects
5. **Digital evidence chain** — SHA-256 hash, timestamps, MFA verification via proto-typed RPCs
6. **Bundle size impact** — `opensign.ts` deleted saves ~15 KB; ConnectRPC client is shared

## References

- ADR-015: OpenSign Convergence (superseded by this ADR)
- ADR-026: Hypervisor Command Protocol
- ADR-030: Self-Service Tenant Provisioning
- `proto/sirsi/admin/v2/catalog.proto`
- `proto/sirsi/sign/v1/signing.proto`
- `packages/sirsi-admin-service/main.go`
