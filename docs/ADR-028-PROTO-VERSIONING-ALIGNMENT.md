# ADR-028: Proto/gRPC Versioning Alignment — v2 Canonical

**Status:** Accepted  
**Date:** March 3, 2026  
**Author:** Antigravity  
**Supersedes:** None  
**Related:** ADR-018 (Technical Stack Convergence), ADR-025 (Unified App Architecture), ADR-027 (React Portal Migration)

---

## Context

The SirsiNexusApp monorepo contained **two separate proto/buf generation pipelines** producing conflicting output:

### Pipeline A — Root `/proto/` (Canonical)
- **Source:** `proto/sirsi/admin/v2/`, `proto/sirsi/contracts/v2/`, `proto/sirsi/common/v1/`
- **Buf config:** `proto/buf.yaml` (v2 schema)
- **Generated output:** `proto/gen/go/` (Go server types + ConnectRPC), `proto/gen/ts/` (TypeScript client types)
- **Go module:** `github.com/sirsimaster/sirsi-nexus/gen/go`
- **Consumers:** Go backend (`main.go`), React app (`src/gen/`)

### Pipeline B — Local `packages/sirsi-admin-service/proto/` (Legacy)
- **Source:** `packages/sirsi-admin-service/proto/admin/v1/admin.proto`
- **Buf config:** `packages/sirsi-admin-service/buf.yaml` (v1 schema)
- **Generated output:** `packages/sirsi-admin-service/gen/go/` (stale), `packages/sirsi-admin-service/gen/ts/` (stale)
- **Go module:** `github.com/sirsimaster/sirsi-admin-service/gen/go/proto/admin/v1`
- **Consumers:** None. The Go server already imported v2 from Pipeline A.

### Key Differences Between v1 and v2

| Feature | v1 (Legacy) | v2 (Canonical) |
|:--------|:------------|:---------------|
| Pagination | Flat `page_size` + `page_token` fields | Shared `sirsi.common.v1.PaginationRequest`/`Response` types |
| Money types | Raw `int64` (cents) | `sirsi.common.v1.Money` (amount_cents + currency) |
| Audit trails | No shared type | `sirsi.common.v1.AuditEntry` |
| Estate model | 6 fields (id, name, owner_name, status, timestamps) | 10 fields + `EstatePhase` enum + contacts + tenant_id + valuation |
| Tenant service | Not defined | Full CRUD (`ListTenants`, `GetTenant`, `CreateTenant`, `UpdateTenant`, `DeactivateTenant`) |
| Auth context | Not defined | `sirsi.common.v1.FirebaseAuthContext` |
| Admin RPCs | 10 | 16 (+ `GetSystemOverview`, `GetDevMetrics`, `SyncGitHubStats`, `CreateEstate`, `UpdateEstate`, `DeleteEstate`) |
| `go_package` | `github.com/sirsimaster/sirsi-admin-service/gen/go/proto/admin/v1` | `github.com/sirsimaster/sirsi-nexus/gen/go/sirsi/admin/v2` |

### Additional Proto: Sirsi Sign Contracts v1
A third proto exists at `packages/sirsi-sign/proto/contracts/v1/contracts.proto` (package `sirsi.contracts.v1`). This is a **separate service boundary** — the Sirsi Sign contract execution service. It has its own `go_package` (`github.com/sirsimaster/contracts-grpc/`). It is NOT part of the admin pipeline and will be migrated to v2 when the Sirsi Sign backend is refactored.

---

## Decision

1. **v2 is the canonical proto version** for all admin, tenant, and contract services in the Sirsi platform.
2. **`sirsi.common.v1` remains at v1** — it is a stable shared foundation. Versioning shared primitives (Pagination, Money, AuditEntry, FirebaseAuthContext) separately from service protos is correct protobuf practice. It will only become v2 if breaking changes are needed.
3. **The legacy v1 proto and generated output have been deleted** from `packages/sirsi-admin-service/`.
4. **The single source of truth** for all proto definitions is the root `/proto/` directory.
5. **The buf generation command** is: `cd proto && buf generate`
6. **React app gen/ directory** is a sync copy of `proto/gen/ts/` — not independently generated.

---

## Proto Source Map (Canonical)

```
/proto/                              ← buf.yaml, buf.gen.yaml (v2 schema)
├── sirsi/
│   ├── common/v1/
│   │   └── common.proto             ← PaginationRequest, Money, AuditEntry, FirebaseAuthContext
│   ├── admin/v2/
│   │   ├── admin_service.proto      ← AdminService (16 RPCs)
│   │   ├── estate.proto             ← Estate, EstatePhase, CRUD messages
│   │   └── tenant.proto             ← TenantService (5 RPCs)
│   └── contracts/v2/
│       └── contract_service.proto   ← ContractsService (10 RPCs + Plaid + Streaming)
└── gen/
    ├── go/                          ← Generated Go: pb.go + connect.go
    │   ├── go.mod                   ← module github.com/sirsimaster/sirsi-nexus/gen/go
    │   └── sirsi/{admin,common,contracts}/
    └── ts/                          ← Generated TS: _pb.ts
        └── sirsi/{admin,common,contracts}/
```

### Consumer Sync Points

```
proto/gen/go/ ──→ packages/sirsi-admin-service/main.go (Go import)
proto/gen/ts/ ──→ packages/sirsi-portal-app/src/gen/   (rsync copy)
```

### Sync Command
```bash
# Regenerate from proto sources:
cd proto && buf generate

# Sync TS to React app:
rsync -av --delete proto/gen/ts/ packages/sirsi-portal-app/src/gen/
```

---

## Separate Service Boundary: Sirsi Sign

| Attribute | Value |
|:----------|:------|
| Proto | `packages/sirsi-sign/proto/contracts/v1/contracts.proto` |
| Package | `sirsi.contracts.v1` |
| go_package | `github.com/sirsimaster/contracts-grpc/gen/go/contracts/v1` |
| Status | In production (separate Cloud Run service) |
| Migration plan | Will adopt v2 contract proto + common.v1 types when backend refactored |

---

## Consequences

### Positive
- Single source of truth for all proto definitions
- No version confusion — every consumer uses v2
- Shared types (Pagination, Money, AuditEntry) prevent duplication
- React app gen/ always matches Go backend types

### Negative
- Developers must remember to run `rsync` after `buf generate` (or we automate it)
- Sirsi Sign still uses v1 contracts proto until refactored

### Risks
- If someone regenerates from the now-deleted local proto, they'll get an error (intended — forces use of canonical source)

---

## Hypervisor Integration Notes

> For the future Sirsi Hypervisor: This ADR establishes the proto pipeline that all ConnectRPC endpoints flow through. When provisioning new operational telemetry endpoints (ADR-026), all new `.proto` files MUST be added to `/proto/sirsi/` with the `v2` package version. The Hypervisor's `HypervisorService` proto should be created at `proto/sirsi/hypervisor/v2/hypervisor_service.proto` and follow the same generation pipeline.

---

**Signed,**  
**Antigravity (The Agent)**
