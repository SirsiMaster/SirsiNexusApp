# ADR-015: Unified gRPC Convergence — Portal ↔ Sign Integration Blueprint

**Status:** Proposed  
**Authors:** Cylton Collymore, Antigravity (Agent)  
**Date:** February 9, 2026  
**Supersedes:** None  
**Related ADRs:** ADR-010 (Monorepo Unification), ADR-011 (UCS), ADR-013 (Sign Hierarchy), ADR-014 (Bipartite Execution)

---

## 1. Executive Summary

This ADR defines the canonical technical blueprint for converging the **Sirsi Nexus Portal** (`sirsi.ai/admin`) and **Sirsi Sign** (`sign.sirsi.ai`) onto a single, unified **Go + gRPC + Protocol Buffers** backbone. Today these two surfaces operate as architecturally disjoint systems — the Portal is a static HTML dashboard with no backend data layer, and Sign is a React/Vite application backed by its own gRPC contract service. This ADR prescribes a phased migration to eliminate this gap, producing a single Go service mesh that powers both surfaces through a common proto schema.

### Decision

**Adopt a Unified Gateway Model** where a single Go gRPC backend serves as the data plane for both the Admin Portal and Sirsi Sign. All CRUD operations, tenant management, contract lifecycle, and administrative functions will be defined in Protocol Buffers and served via Connect RPC (gRPC-Web compatible). The Portal frontend will migrate from static HTML to React, consuming the same transport and proto-generated types as Sign.

---

## 2. Current State Audit

### 2.1 Sirsi Sign (`packages/finalwishes-contracts`)

| Attribute | Current Value |
|-----------|---------------|
| **Framework** | React 18 + Vite |
| **Transport** | Connect RPC (`@connectrpc/connect-web`) |
| **Proto** | `contracts/v1/contracts.proto` (234 lines) |
| **Backend** | Go Cloud Run service (`contracts-grpc-210890802638.us-east4.run.app`) |
| **Auth** | Firebase Auth + MFA Gate + gRPC interceptor for token injection |
| **State** | Zustand (`useConfigStore`) + TanStack Query (`useAdmin.ts`) |
| **Domain** | `sign.sirsi.ai` (Firebase Hosting → `sirsi-sign.web.app`) |

**Existing gRPC Services (Sign):**
```
ContractsService
├── CreateContract
├── GetContract
├── ListContracts
├── UpdateContract
├── DeleteContract
├── GeneratePage
├── CreateCheckoutSession
├── CreatePlaidLinkToken
├── ExchangePlaidToken
└── StreamEvents (bidirectional)
```

### 2.2 Admin Portal (`packages/sirsi-portal/admin`)

| Attribute | Current Value |
|-----------|---------------|
| **Framework** | Static HTML + Tailwind CDN + Chart.js |
| **Transport** | None (hardcoded mock data) |
| **Proto** | None consumed directly |
| **Backend** | None (static pages only) |
| **Auth** | Firebase Auth via `security-init.js` + `admin-access-control.js` |
| **Domain** | `sirsi.ai/admin` (Firebase Hosting) |

**Existing Portal Pages:**
```
admin/
├── index.html           → Dashboard (charts, stats, activity)
├── users/               → User Management
├── security/            → Security Settings
├── site-settings.html   → Site Configuration
├── data-room.html       → Document Upload/Share
├── documentation.html   → Documentation
├── create-invoice.html  → Invoice Creator
├── revenue-dashboard.html → Revenue Analytics
├── dashboard/
│   ├── telemetry.html   → System Telemetry
│   └── system-logs.html → System Logs
└── system-status/
    ├── index.html       → Status Dashboard
    ├── api-server.html  → API Server Health
    ├── database.html    → Database Health
    ├── cdn.html         → CDN Status
    └── email-service.html → Email Service Status
```

### 2.3 Admin Service (`packages/sirsi-admin-service`)

| Attribute | Current Value |
|-----------|---------------|
| **Language** | Go |
| **Transport** | Connect RPC (`connect-go`) |
| **Proto** | `admin/v1/admin.proto` (138 lines) |
| **State** | In-memory mock + JSON file persistence |
| **Deployment** | Not yet deployed to Cloud Run |

**Existing gRPC Services (Admin):**
```
AdminService
├── ListEstates / GetEstate
├── LogDevSession
├── ManageUserRole / ListUsers
├── SendNotification / ListNotifications
└── GetSettings / UpdateSettings
```

### 2.4 Architectural Gap Analysis

| Gap | Impact | Severity |
|-----|--------|----------|
| Portal has no real backend data layer | Admin dashboard shows hardcoded mock data | 🔴 Critical |
| Portal and Sign use different auth handshakes | Auth state not shared; dual login possible | 🟡 Medium |
| No shared proto schema | Contract CRUD in Sign, Estate CRUD in Admin — no cross-reference | 🔴 Critical |
| Portal is static HTML, Sign is React | No shared component library, duplicate UI effort | 🟡 Medium |
| Admin Service not deployed | `admin.proto` services exist but are not reachable from production | 🔴 Critical |
| Tenant management lives in wrong package | `TenantManager.tsx` was built inside `finalwishes-contracts` | 🟠 High |

---

## 3. Target Architecture

### 3.1 Service Topology

```
┌──────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         sirsi-gateway (Go)                          │  │
│  │         ════════════════════                         │  │
│  │  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ AdminService │  │ ContractsService │             │  │
│  │  │  (admin.v2)  │  │  (contracts.v2)  │             │  │
│  │  └──────┬───────┘  └───────┬──────────┘             │  │
│  │         │                  │                         │  │
│  │  ┌──────┴──────────────────┴──────┐                 │  │
│  │  │       Shared Middleware        │                 │  │
│  │  │  Auth · CORS · Logging · Rate │                 │  │
│  │  └──────┬──────────────────┬──────┘                 │  │
│  │         │                  │                         │  │
│  │  ┌──────┴──────┐   ┌──────┴──────┐                  │  │
│  │  │  Firestore  │   │  Cloud SQL  │                  │  │
│  │  │  (Realtime) │   │   (PII)     │                  │  │
│  │  └─────────────┘   └─────────────┘                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                         ▲                                 │
│                         │  Connect RPC                    │
│                         │  (gRPC-Web / HTTP/2)            │
└─────────────────────────┼─────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────┴───────┐  ┌──────┴──────┐  ┌──────┴──────┐
│  sirsi.ai     │  │sign.sirsi.ai│  │Mobile (Expo)│
│  /admin       │  │  /vault     │  │  React      │
│  (React SPA)  │  │  (React SPA)│  │  Native     │
└───────────────┘  └─────────────┘  └─────────────┘
```

### 3.2 Unified Proto Schema (v2)

The v2 schema unifies Admin and Contracts into a single `buf` workspace with shared types.

```
proto/
├── buf.yaml                          # Workspace config
├── buf.gen.yaml                      # Multi-target generation config
├── sirsi/
│   ├── common/
│   │   └── v1/
│   │       └── common.proto          # Shared types: Pagination, Timestamp, Money
│   ├── admin/
│   │   └── v2/
│   │       ├── admin_service.proto   # AdminService v2
│   │       ├── tenant.proto          # TenantService
│   │       ├── user.proto            # UserService (expanded)
│   │       └── system.proto          # SystemService (telemetry, health)
│   ├── contracts/
│   │   └── v2/
│   │       ├── contract_service.proto # ContractsService v2
│   │       ├── payment.proto          # PaymentService (Stripe + Plaid)
│   │       └── signing.proto          # SigningService (OpenSign bridge)
│   └── vault/
│       └── v1/
│           └── vault_service.proto    # VaultService (document storage)
```

### 3.3 Shared Common Types

```protobuf
// proto/sirsi/common/v1/common.proto
syntax = "proto3";
package sirsi.common.v1;

message PaginationRequest {
  int32 page_size = 1;
  string page_token = 2;
}

message PaginationResponse {
  string next_page_token = 1;
  int32 total_count = 2;
}

message Money {
  int64 amount_cents = 1;
  string currency = 2; // ISO 4217, default "USD"
}

message AuditEntry {
  string actor_id = 1;
  string actor_email = 2;
  string action = 3;
  int64 timestamp = 4;
  string ip_address = 5;
  string user_agent = 6;
}

message FirebaseAuthContext {
  string uid = 1;
  string email = 2;
  string display_name = 3;
  repeated string roles = 4;      // "admin", "user", "entity_admin"
  string tenant_id = 5;           // Multi-tenant isolation
  bool mfa_verified = 6;
}
```

### 3.4 Tenant Service (New)

```protobuf
// proto/sirsi/admin/v2/tenant.proto
syntax = "proto3";
package sirsi.admin.v2;

import "sirsi/common/v1/common.proto";

service TenantService {
  rpc ListTenants(ListTenantsRequest) returns (ListTenantsResponse);
  rpc GetTenant(GetTenantRequest) returns (Tenant);
  rpc CreateTenant(CreateTenantRequest) returns (Tenant);
  rpc UpdateTenant(UpdateTenantRequest) returns (Tenant);
  rpc DeactivateTenant(DeactivateTenantRequest) returns (DeactivateTenantResponse);
}

message Tenant {
  string id = 1;
  string name = 2;                    // e.g., "FinalWishes"
  string slug = 3;                    // e.g., "finalwishes"
  string description = 4;
  TenantStatus status = 5;
  TenantConfig config = 6;
  sirsi.common.v1.AuditEntry created = 7;
  sirsi.common.v1.AuditEntry updated = 8;
}

enum TenantStatus {
  TENANT_STATUS_UNSPECIFIED = 0;
  TENANT_STATUS_ACTIVE = 1;
  TENANT_STATUS_SUSPENDED = 2;
  TENANT_STATUS_DEACTIVATED = 3;
}

message TenantConfig {
  string primary_color = 1;
  string logo_url = 2;
  string domain = 3;                  // Custom domain or subdomain
  repeated string enabled_services = 4; // ["contracts", "vault", "payments"]
  string stripe_connect_account_id = 5;
}

message ListTenantsRequest {
  sirsi.common.v1.PaginationRequest pagination = 1;
  TenantStatus status_filter = 2;
}

message ListTenantsResponse {
  repeated Tenant tenants = 1;
  sirsi.common.v1.PaginationResponse pagination = 2;
}

message GetTenantRequest { string id = 1; }
message CreateTenantRequest {
  string name = 1;
  string slug = 2;
  string description = 3;
  TenantConfig config = 4;
}
message UpdateTenantRequest {
  string id = 1;
  Tenant tenant = 2;
  repeated string update_mask = 3;
}
message DeactivateTenantRequest { string id = 1; }
message DeactivateTenantResponse { bool success = 1; }
```

---

## 4. Phased Migration Plan

### Phase 0: Foundation & Unification (Week 1-2)
> **Goal:** Establish the unified proto workspace and deploy the gateway.

| Step | Task | Owner | Artifact |
|------|------|-------|----------|
| 0.1 | Create unified `proto/` directory at monorepo root | Eng | `proto/buf.yaml` |
| 0.2 | Move `admin.proto` → `proto/sirsi/admin/v2/admin_service.proto` | Eng | Renamed proto |
| 0.3 | Move `contracts.proto` → `proto/sirsi/contracts/v2/contract_service.proto` | Eng | Renamed proto |
| 0.4 | Create `common.proto` with shared types | Eng | `proto/sirsi/common/v1/common.proto` |
| 0.5 | Create `tenant.proto` with TenantService | Eng | `proto/sirsi/admin/v2/tenant.proto` |
| 0.6 | Configure `buf.gen.yaml` for dual-target generation (Go + TypeScript) | Eng | `buf.gen.yaml` |
| 0.7 | Run `buf generate` → validate generated Go + TS code | Eng | `gen/` dirs |
| 0.8 | Create unified `sirsi-gateway` Go service that registers both services | Eng | `packages/sirsi-gateway/main.go` |
| 0.9 | Deploy `sirsi-gateway` to Cloud Run | Eng | Cloud Run service URL |
| 0.10 | Verify both `/admin.v2.AdminService/` and `/contracts.v2.ContractsService/` respond | QA | Health check |

**buf.gen.yaml (Unified):**
```yaml
version: v2
managed:
  enabled: true
plugins:
  # Go server + client
  - remote: buf.build/connectrpc/go
    out: gen/go
    opt: paths=source_relative
  - remote: buf.build/protocolbuffers/go
    out: gen/go
    opt: paths=source_relative
  # TypeScript client (React frontends)
  - remote: buf.build/connectrpc/es
    out: gen/ts
    opt: target=ts
  - remote: buf.build/bufbuild/es
    out: gen/ts
    opt: target=ts
```

### Phase 1: Portal React Migration (Week 3-4)
> **Goal:** Convert the Admin Portal from static HTML to a React SPA consuming gRPC.

| Step | Task | Detail |
|------|------|--------|
| 1.1 | Scaffold `packages/sirsi-portal-app` as a Vite + React project | Mirror `finalwishes-contracts` structure |
| 1.2 | Install `@connectrpc/connect-web`, `@bufbuild/protobuf` | Same deps as Sign |
| 1.3 | Configure Connect transport pointed at unified gateway | `createConnectTransport({ baseUrl: GATEWAY_URL })` |
| 1.4 | Implement `useAdminService.ts` hooks (TanStack Query) | Wrap List/Get/Update RPCs |
| 1.5 | Implement `useTenantService.ts` hooks | Wrap TenantService RPCs |
| 1.6 | Port Dashboard page → React component | Replace hardcoded stats with `AdminService.GetDashboardStats` |
| 1.7 | Port User Management → React component | Replace static table with `AdminService.ListUsers` |
| 1.8 | Build Tenant Management page | New page consuming `TenantService.ListTenants` |
| 1.9 | Build Contract Admin page | Cross-service: calls `ContractsService.ListContracts` |
| 1.10 | Implement shared Firebase Auth provider | Same `ProtectedRoute` + `MFAGate` pattern as Sign |
| 1.11 | Deploy Portal React SPA to Firebase Hosting (`sirsi.ai`) | Update `firebase.json` hosting config |

**Transport Configuration:**
```typescript
// packages/sirsi-portal-app/src/lib/transport.ts
import { createConnectTransport } from "@connectrpc/connect-web";
import { auth } from "./firebase";

export const transport = createConnectTransport({
  baseUrl: import.meta.env.VITE_GATEWAY_URL ?? "https://sirsi-gateway-HASH.us-east4.run.app",
  interceptors: [
    (next) => async (req) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        req.header.set("Authorization", `Bearer ${token}`);
      }
      return next(req);
    },
  ],
});
```

### Phase 2: Cross-Service Data Integration (Week 5-6)
> **Goal:** Wire the Admin Portal to display contract data from Sign's backend, and wire Sign to respect tenant configs from Admin.

| Step | Task | Detail |
|------|------|--------|
| 2.1 | Add `ListContracts` call to Portal's "Contract Manager" tab | Portal reads contracts via same gRPC service |
| 2.2 | Add `GetTenant` call to Sign's contract creation flow | Sign fetches tenant config (colors, branding) |
| 2.3 | Implement cross-service auth validation | Gateway validates Firebase token once, injects `FirebaseAuthContext` into both services |
| 2.4 | Implement role-based access (RBAC) at gateway level | `admin` role → full access; `user` role → own contracts only |
| 2.5 | Add `AuditService` proto for cross-cutting event logging | All mutations emit audit events |
| 2.6 | Build "Unified Activity Feed" in Portal dashboard | Combines contract events + user events + system events |
| 2.7 | Implement `DashboardStatsService` RPC | Aggregates real-time metrics: contracts created, payments processed, active users |

**RBAC Middleware (Go):**
```go
// packages/sirsi-gateway/middleware/auth.go
func FirebaseAuthInterceptor() connect.UnaryInterceptorFunc {
    return func(next connect.UnaryFunc) connect.UnaryFunc {
        return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
            token := req.Header().Get("Authorization")
            if token == "" {
                return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("missing auth token"))
            }
            
            // Verify Firebase ID token
            decoded, err := firebaseAuth.VerifyIDToken(ctx, strings.TrimPrefix(token, "Bearer "))
            if err != nil {
                return nil, connect.NewError(connect.CodeUnauthenticated, err)
            }
            
            // Inject auth context for downstream handlers
            authCtx := &AuthContext{
                UID:         decoded.UID,
                Email:       decoded.Claims["email"].(string),
                Roles:       decoded.Claims["roles"].([]string),
                MFAVerified: decoded.Claims["mfa_verified"].(bool),
            }
            ctx = context.WithValue(ctx, authContextKey, authCtx)
            return next(ctx, req)
        }
    }
}
```

### Phase 3: Full Go Backend Convergence (Week 7-10)
> **Goal:** Migrate all Sign-specific backend logic into the unified gateway; deprecate the standalone `contracts-grpc` service.

| Step | Task | Detail |
|------|------|--------|
| 3.1 | Merge `contracts-grpc` Go handlers into `sirsi-gateway` | Single binary serves all services |
| 3.2 | Migrate Firestore contract storage to use shared connection pool | Remove duplicate Firebase Admin SDK initialization |
| 3.3 | Consolidate Stripe webhook handlers | Single `/webhooks/stripe` endpoint, routes by event type |
| 3.4 | Add OpenSign bridge RPCs to gateway | `SigningService.CreateSigningRequest`, `GetSignatureStatus` |
| 3.5 | Add Vault document storage RPCs | `VaultService.UploadDocument`, `ListDocuments`, `GetDocument` |
| 3.6 | Implement `SystemService` for health/telemetry | `/health`, `/ready`, structured telemetry |
| 3.7 | DNS cutover: Point Sign transport to unified gateway URL | Update `VITE_GATEWAY_URL` in Sign's `.env` |
| 3.8 | Feature-flag old endpoint, validate zero-downtime migration | Parallel-run old + new for 48 hours |
| 3.9 | Deprecate standalone `contracts-grpc` Cloud Run service | Remove from deployment pipeline |
| 3.10 | Update `deploy-contracts.sh` to deploy via gateway | Single deployment artifact |

### Phase 4: Portal Full Parity & Polish (Week 11-12)
> **Goal:** Portal achieves feature parity with all current static HTML pages, fully backed by real data.

| Step | Task | Detail |
|------|------|--------|
| 4.1 | Port Revenue Dashboard → React + Chart.js with real Stripe data | `AdminService.GetRevenueMetrics` |
| 4.2 | Port System Status → React with real health checks | `SystemService.GetServiceHealth` |
| 4.3 | Port Telemetry → React with Cloud Monitoring data | `SystemService.GetTelemetry` |
| 4.4 | Port Data Room → React with Cloud Storage integration | `VaultService.UploadDocument` |
| 4.5 | Port Invoice Creator → React with Stripe Invoice API | `PaymentService.CreateInvoice` |
| 4.6 | Implement Notification Center | `AdminService.ListNotifications` + real-time via SSE |
| 4.7 | Port System Logs → React with Cloud Logging API | `SystemService.QueryLogs` |
| 4.8 | Implement Security Settings → React with Firebase rules | `AdminService.UpdateSecurityPolicy` |
| 4.9 | Remove all static HTML admin pages | Clean cut to React SPA |
| 4.10 | Final E2E test suite across Portal + Sign | Playwright cross-surface tests |

---

## 5. Sequence Diagrams

### 5.1 Admin Views Contract List (Cross-Service)

```
Admin User        Portal SPA         sirsi-gateway        Firestore
    │                 │                    │                   │
    │  Navigate to    │                    │                   │
    │  /admin/contracts                    │                   │
    │ ───────────────>│                    │                   │
    │                 │                    │                   │
    │                 │ Firebase.getIdToken()                  │
    │                 │ ─────────────────> │                   │
    │                 │ <───── token ───── │                   │
    │                 │                    │                   │
    │                 │ ContractsService   │                   │
    │                 │ .ListContracts()   │                   │
    │                 │ [Bearer token]     │                   │
    │                 │ ──────────────────>│                   │
    │                 │                    │                   │
    │                 │                    │ Verify Firebase   │
    │                 │                    │ token + check     │
    │                 │                    │ admin role        │
    │                 │                    │                   │
    │                 │                    │ Firestore query   │
    │                 │                    │ ──────────────────>│
    │                 │                    │ <── contracts ──── │
    │                 │                    │                   │
    │                 │ <── ListContractsResponse ──           │
    │                 │                    │                   │
    │ <── Render table │                   │                   │
    │     with data    │                   │                   │
```

### 5.2 Sign Fetches Tenant Config

```
Client User       Sign SPA           sirsi-gateway          Firestore
    │                │                    │                     │
    │ /contracts     │                    │                     │
    │ /finalwishes   │                    │                     │
    │ ──────────────>│                    │                     │
    │                │                    │                     │
    │                │ TenantService      │                     │
    │                │ .GetTenant("fw")   │                     │
    │                │ ──────────────────>│                     │
    │                │                    │ Query tenants       │
    │                │                    │ ────────────────────>│
    │                │                    │ <── tenant config ── │
    │                │                    │                     │
    │                │ <── Tenant{        │                     │
    │                │   colors, logo,    │                     │
    │                │   stripe_acct      │                     │
    │                │ } ─────────────────│                     │
    │                │                    │                     │
    │                │ Apply tenant       │                     │
    │                │ theme/branding     │                     │
    │ <── Branded    │                    │                     │
    │     contract   │                    │                     │
    │     page ──────│                    │                     │
```

### 5.3 Unified Deployment Pipeline

```
Developer          GitHub              Cloud Build          Cloud Run
    │                 │                    │                    │
    │ git push main   │                    │                    │
    │ ───────────────>│                    │                    │
    │                 │ Trigger on push    │                    │
    │                 │ ──────────────────>│                    │
    │                 │                    │                    │
    │                 │                    │ 1. buf lint        │
    │                 │                    │ 2. buf generate    │
    │                 │                    │ 3. go test ./...   │
    │                 │                    │ 4. go build        │
    │                 │                    │    sirsi-gateway   │
    │                 │                    │ 5. docker build    │
    │                 │                    │ 6. docker push     │
    │                 │                    │                    │
    │                 │                    │ Deploy to          │
    │                 │                    │ Cloud Run          │
    │                 │                    │ ──────────────────>│
    │                 │                    │                    │
    │                 │                    │ 7. npm run build   │
    │                 │                    │    (portal-app)    │
    │                 │                    │ 8. npm run build   │
    │                 │                    │    (sign-app)      │
    │                 │                    │ 9. firebase deploy │
    │                 │                    │    --only hosting  │
    │                 │                    │                    │
    │ <── Deploy      │                    │                    │
    │     complete ───│                    │                    │
```

---

## 6. Proto Migration Strategy

### 6.1 Versioning Rules

| Rule | Detail |
|------|--------|
| **v1 → v2 Transition** | v1 protos remain operational during migration; v2 adds new fields using next available field numbers |
| **Wire Compatibility** | v2 messages are backward-compatible; new fields use `optional` or additive enums |
| **No Breaking Renames** | Message/field names in v1 are preserved in v2; new services get new packages |
| **Dual Registration** | Gateway registers both v1 and v2 handlers during transition window |

### 6.2 Buf Configuration

```yaml
# proto/buf.yaml
version: v2
modules:
  - path: .
    name: buf.build/sirsimaster/sirsi-nexus
lint:
  use:
    - DEFAULT
  except:
    - PACKAGE_VERSION_SUFFIX
breaking:
  use:
    - WIRE_JSON
```

### 6.3 Code Generation Targets

| Target | Package | Output Dir |
|--------|---------|------------|
| Go (Gateway) | `connect-go` + `protocolbuffers/go` | `gen/go/sirsi/` |
| TypeScript (Portal) | `connect-es` + `bufbuild/es` | `packages/sirsi-portal-app/gen/` |
| TypeScript (Sign) | `connect-es` + `bufbuild/es` | `packages/finalwishes-contracts/gen/` |

---

## 7. Database Architecture (Converged)

### 7.1 Hybrid Storage Strategy

```
┌─────────────────────────────────────────────────┐
│                 Firestore (NoSQL)                │
│                                                   │
│  collections/                                     │
│  ├── contracts/{contractId}     ← Real-time sync  │
│  ├── tenants/{tenantId}         ← Tenant configs  │
│  ├── notifications/{notifId}    ← Push notifs     │
│  ├── audit_log/{logId}          ← Event stream    │
│  └── settings/system            ← System config   │
│                                                   │
│  Rationale: Real-time listeners, flexible schema, │
│  rapid prototyping, offline sync for mobile.      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Cloud SQL (PostgreSQL)               │
│                                                   │
│  tables/                                          │
│  ├── users                      ← PII, RBAC      │
│  ├── vault_documents            ← Document refs   │
│  ├── payment_records            ← SOC 2 audit     │
│  ├── signature_evidence         ← SHA-256 chain   │
│  └── compliance_log             ← Legal retention │
│                                                   │
│  Rationale: ACID compliance for financial data,   │
│  PII encryption at rest, SQL joins for reporting. │
└─────────────────────────────────────────────────┘
```

---

## 8. Authentication Convergence

### 8.1 Unified Auth Flow

Both Portal and Sign will use the same Firebase Auth instance and the same Custom Claims schema:

```json
{
  "uid": "abc123",
  "email": "cylton@sirsi.ai",
  "custom_claims": {
    "roles": ["admin", "entity_admin"],
    "tenant_id": "sirsi",
    "mfa_verified": true,
    "mfa_method": "totp",
    "permissions": ["contracts:read", "contracts:write", "users:manage", "tenants:manage"]
  }
}
```

### 8.2 Role Hierarchy

```
Sirsi Admin (root)
  ├── Can manage all tenants, users, contracts, and system settings
  ├── Full cross-tenant visibility
  └── System-level operations (maintenance mode, deployments)
  
Entity Admin (tenant-scoped)
  ├── Can manage contracts and users within their tenant
  ├── Cannot see other tenants' data
  └── Cannot modify system-level settings
  
User (restricted)
  ├── Can view/sign own contracts
  ├── Cannot access admin surfaces
  └── Read-only on vault documents assigned to them
```

---

## 9. Process Flows

### 9.1 Complete Contract Lifecycle (Post-Convergence)

```
1. ADMIN creates tenant config via Portal        → TenantService.CreateTenant
2. ADMIN creates contract for client via Portal   → ContractsService.CreateContract
3. System sends client invite email               → SendGrid (UCS)
4. CLIENT opens deep link: sign.sirsi.ai/vault/... → Sign SPA loads
5. Sign SPA fetches tenant branding               → TenantService.GetTenant
6. CLIENT configures solution (carte selection)    → Local state (Zustand)
7. CLIENT signs contract (ADR-014)                 → ContractsService.UpdateContract
8. System emits signature event                    → AuditService.LogEvent
9. ADMIN sees "Waiting for Countersign" in Portal  → ContractsService.ListContracts
10. ADMIN countersigns via Portal                  → ContractsService.UpdateContract
11. Contract status → FULLY_EXECUTED               → Firestore real-time update
12. System triggers payment checkout               → ContractsService.CreateCheckoutSession
13. CLIENT completes payment (Stripe)              → Webhook → PaymentService
14. Payment confirmed in Financial Ledger          → Firestore + Cloud SQL
15. ADMIN views financial dashboard                → AdminService.GetRevenueMetrics
```

### 9.2 Tenant Onboarding Flow (New)

```
1. ADMIN navigates to Portal → Tenant Registry
2. ADMIN clicks "Add Tenant"
3. Portal calls TenantService.CreateTenant with:
   - name, slug, description
   - branding config (colors, logo)
   - Stripe Connect account ID
   - enabled services
4. Gateway writes tenant doc to Firestore
5. Gateway provisions tenant-scoped Firestore collections
6. ADMIN configures contract templates for tenant
7. Tenant is now available in Sign SPA's route namespace
   (sign.sirsi.ai/contracts/{tenant_slug})
```

---

## 10. Testing Strategy

### 10.1 Test Layers

| Layer | Tool | Scope |
|-------|------|-------|
| **Proto Lint** | `buf lint` | Schema consistency, naming conventions |
| **Proto Breaking** | `buf breaking` | Wire compatibility validation |
| **Unit Tests** | Go `testing` | Individual handler logic |
| **Integration Tests** | Go `testing` + Testcontainers | Full gRPC round-trips with Firestore emulator |
| **E2E (Portal)** | Playwright | Portal UI → Gateway → Firestore, full flow |
| **E2E (Sign)** | Playwright | Sign UI → Gateway → Stripe/OpenSign, full flow |
| **Cross-Surface** | Playwright | Admin creates contract → Client sees it in Sign |
| **Load Testing** | k6 | Gateway throughput under 1000 concurrent RPC calls |

### 10.2 CI Pipeline Stages

```yaml
# .github/workflows/gateway-ci.yml
stages:
  - name: proto-validation
    steps:
      - buf lint
      - buf breaking --against 'buf.build/sirsimaster/sirsi-nexus'
      
  - name: generate
    steps:
      - buf generate
      - Commit gen/ if changed
      
  - name: test
    steps:
      - go test ./... -race -count=1
      - go vet ./...
      
  - name: build
    steps:
      - docker build -t sirsi-gateway .
      
  - name: deploy
    if: branch == main
    steps:
      - gcloud run deploy sirsi-gateway --image=...
```

---

## 11. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Proto schema migration breaks existing Sign clients | Medium | High | Wire-compatible v2; dual-register v1+v2 handlers |
| Firebase Auth custom claims lag during RBAC rollout | Medium | Medium | Session-based state fallback (existing MFA pattern) |
| Gateway single point of failure | Low | Critical | Cloud Run auto-scaling + health checks + multi-region |
| Firestore → Cloud SQL data migration for PII | Low | High | Phased: new PII in SQL, legacy PII migrated in batch |
| Developer velocity drops during rewrite | Medium | Medium | Phase 1 runs in parallel; static HTML remains until React is verified |
| React Portal increases bundle size vs static HTML | Low | Low | Code splitting, lazy routes, same Vite setup as Sign |

---

## 12. Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| All admin CRUD backed by real gRPC data | Zero hardcoded values in Portal | 100% |
| Cross-surface contract visibility | Contract created in Portal appears in Sign within 2s | < 2s |
| Single deployment artifact | One Cloud Run service serves all RPC methods | 1 service |
| Auth convergence | Single Firebase Auth config with shared custom claims | 1 auth realm |
| Proto schema coverage | All data types defined in protobuf | 100% |
| Zero downtime migration | Existing Sign traffic unaffected during cutover | 0 errors |
| Performance parity | gRPC latency < 200ms p95 for all RPCs | < 200ms |

---

## 13. Dependency Map

```
ADR-015 depends on:
├── ADR-010 (Monorepo)           ← Packages already colocated
├── ADR-011 (UCS)                ← Stripe/Plaid/SendGrid already UCS-managed
├── ADR-013 (Sign Hierarchy)     ← Hierarchical URL routing established
├── ADR-014 (Bipartite Signing)  ← Contract execution protocol defined
└── Firebase Auth                 ← Custom claims already implemented

ADR-015 enables:
├── Mobile App (React Native)    ← Same proto types, same gateway
├── Sirsi AI Agent Integration   ← Agents call gateway RPCs directly
├── Multi-Tenant SaaS            ← Tenant isolation at gateway level
└── Advanced Analytics           ← Unified telemetry stream
```

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Gateway** | The unified Go service (`sirsi-gateway`) serving all gRPC/Connect RPCs |
| **Portal** | The admin interface at `sirsi.ai/admin` |
| **Sign** | The contract execution interface at `sign.sirsi.ai` |
| **Tenant** | A portfolio entity (e.g., FinalWishes, Assiduous) that has its own branding and contract templates |
| **Connect RPC** | gRPC-Web compatible protocol that works over HTTP/1.1 and HTTP/2 |
| **buf** | Build tool for Protocol Buffers providing linting, breaking change detection, and code generation |
| **UCS** | Universal Component System — shared infrastructure utilities (Stripe, Plaid, etc.) |

---

## 15. References

- [Connect RPC Go Documentation](https://connectrpc.com/docs/go/getting-started/)
- [Connect RPC Web (TypeScript)](https://connectrpc.com/docs/web/getting-started/)
- [Buf Build](https://buf.build/docs/)
- [Firebase Admin Go SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Run gRPC Support](https://cloud.google.com/run/docs/triggering/grpc)
- `GEMINI.md` §3 — Stack V4 (Go + gRPC + Protobuf)
- `ARCHITECTURE_DESIGN.md` §1.6 — UCS Integration
- `ADR-014` — Bipartite Contract Execution Protocol

---

*This ADR serves as the canonical integration blueprint. All implementation must align with the phases, schemas, and contracts defined herein. Deviations require an amendment to this document via the standard ADR review process.*
