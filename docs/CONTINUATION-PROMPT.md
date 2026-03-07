# SirsiNexusApp — Continuation Prompt

**Version:** v0.9.3-alpha  
**Date:** March 7, 2026  
**Last Commit:** b79597b (fix: catalog timeAgo parsing + Cloud SQL CatalogService wiring)  
**Tag:** v0.9.3-alpha

---

## Identity & Context

You are working on **SirsiNexusApp** — the Sirsi Technologies master monorepo. Read `SIRSI_RULES.md` (synced to `GEMINI.md` / `CLAUDE.md`) before writing any code. It contains all operational directives, design tokens, and architectural constraints.

- **GitHub**: `https://github.com/SirsiMaster/SirsiNexusApp`
- **Local**: `/Users/thekryptodragon/Development/SirsiNexusApp`
- **Design Language**: Swiss Neo-Deco (Emerald `#059669` + Gold `#C8A951`, Cinzel + Inter)
- **Stack**: Go + ConnectRPC | React 19 + Vite 7 | Protobuf ES v2 | Cloud SQL + Firestore | Firebase Auth

---

## What Was Completed (v0.9.0 → v0.9.3-alpha)

### v0.9.0-alpha — gRPC v2 Infrastructure Upgrade
- `proto/buf.gen.yaml`: Uses `buf.build/bufbuild/es` (Protobuf ES v2.11.0)
- No more `_connect.ts` files — service descriptors live inside `_pb.ts` in v2
- All 28 React `useAdminService` hooks migrated to v2 import paths
- All orphaned `_connect.ts` files deleted
- `opensign.ts` REST SDK deleted — 100% gRPC

### v0.9.1-alpha — GitHub Automation
- `TenantService.CreateTenantGitHubRepo` creates repos from template `SirsiMaster/tenant-scaffold`
- Token-based auth via `SIRSI_GITHUB_PAT` env var on Cloud Run

### v0.9.2-alpha — Unified Commerce & Signing Pipeline (ADR-031)
- `CatalogService`: 12 RPC methods (CRUD products + bundles) with Stripe auto-sync
- `SigningService`: 12 RPC methods (envelopes, payments, MFA, vault)
- `TenantService`: 8 RPC methods (provision, RBAC, GitHub, settings)
- Old REST endpoints eliminated — all traffic through ConnectRPC
- ADR-031 published: Unified Commerce & Signing Pipeline

### v0.9.3-alpha — Cloud SQL + Live Telemetry + Backlog Sweep
- **Cloud SQL**: PostgreSQL 15 on `sirsi-vault-sql`, database `sirsi_admin`
  - `database.go` — pgx/v5 connection pool
  - `schema.sql` — 6 tables (tenants, catalog_products, catalog_bundles, signing_envelopes, provisioning_status, schema_migrations)
  - `catalog_sql.go` — SQL persistence for CatalogService
  - All 12 CatalogService handlers dual-write (in-memory + SQL)
- **Stripe Live Products**: 4 products provisioned on live Stripe
  - Free: `price_1T8DLDDHFENsYYPyaZdUsTBV` ($0/mo)
  - Solo: `price_1T8DLEDHFENsYYPyOPUf4pMJ` ($500/mo)
  - Business: `price_1T8DLEDHFENsYYPyRmUGUGIv` ($2,500/mo)
  - Platform Setup: `price_1T8DxxDHFENsYYPy7Arux3Ve` ($15,000 one-time) — created via API
- **Live Hypervisor Telemetry** (`telemetry.go`):
  - Cloud Run Admin API: service count, revision count, 24h deployments
  - Stripe API: MRR, active subscriptions, revenue this month
  - 60-second cache with parallel refresh, graceful mock fallback
- **Bundle split**: sirsi-sign 1,325 KB → 948 KB (29% reduction)
- **npm audit**: 9 vulnerabilities → 0 (removed Storybook/Next.js orphans)
- **OpenSign cleanup**: ADR-015 variable names → ADR-031 nomenclature
- **Tenant scaffold repo**: `SirsiMaster/tenant-scaffold` (17 files)
- **Catalog Manager UI**: `/catalog` route — CRUD, KPI row, Stripe sync status

---

## Live Infrastructure

| System | URL / Instance | Status |
|:-------|:---------------|:-------|
| **sirsi.ai** | `https://sirsi.ai` | 🟢 React SPA (Firebase Hosting `sirsi-ai`) |
| **sign.sirsi.ai** | `https://sign.sirsi.ai` | 🟢 Sirsi Sign (Firebase Hosting `sirsi-sign`) |
| **Cloud Run** | `https://sirsi-admin-210890802638.us-central1.run.app` | 🟢 Go ConnectRPC (rev `sirsi-admin-00008-9xh`) |
| **Cloud SQL** | `sirsi-vault-sql` / db `sirsi_admin` | 🟢 PostgreSQL 15, schema v1 |
| **Stripe** (Live) | `acct_1ShDB5DHFENsYYPy` | 🟢 4 products, 4 prices |
| **Firebase Auth** | `sirsi-nexus-live` | 🟢 MFA enforced |

### Cloud Run Environment Variables (set on service)
- `DATABASE_URL` — Cloud SQL via unix socket proxy
- `STRIPE_SECRET_KEY` — Live Stripe API key
- `SIRSI_GITHUB_PAT` — GitHub automation token

---

## Outstanding Work — Go-Forward Plan

### 🔴 P0 — Critical Path (Must Complete Next)

#### 1. SigningService Integration Tests (SendGrid + Stripe Checkout)
The `signing_service.go` has 3 TODO stubs that prevent real Sirsi Sign from working end-to-end:
- **Line 292**: `RequestWireInstructions` — needs SendGrid Go SDK integration
- **Line 341**: `SendMFACode` — needs SendGrid (email) + Twilio (SMS) integration
- **Line 445**: `ListVaultFiles` — needs Cloud Storage Go SDK integration

**Files**: `packages/sirsi-admin-service/signing_service.go`

#### 2. Firebase Auth → Real Login (Replace Mock Auth)
The React app uses `VITE_AUTH_MODE=mock` for local dev. Production login (`/login`) route currently uses the same mock auth path for demo access. Need to verify:
- Firebase Auth signInWithEmailAndPassword works in production
- MFA enrollment flow (TOTP) works end-to-end
- Demo access portal is separated from real auth
- `useAuth.tsx` mock vs real paths are correctly gated

**Files**: `packages/sirsi-portal-app/src/hooks/useAuth.tsx`, `packages/sirsi-portal-app/src/routes/login.tsx`

#### 3. AdminService Estate Methods (4 Unimplemented)
These 4 ConnectRPC methods return `CodeUnimplemented`:
- `GetEstate` (line 121)
- `CreateEstate` (line 128)
- `UpdateEstate` (line 135)
- `DeleteEstate` (line 142)

These are needed for FinalWishes estate document management. Implement with Cloud SQL persistence.

**Files**: `packages/sirsi-admin-service/main.go`

### 🟡 P1 — Infrastructure Hardening

#### 4. Cloud SQL — Wire Remaining Services
CatalogService is wired to SQL. Still in-memory:
- `SigningService` (envelopes, payments) — should persist to `signing_envelopes` table
- `TenantService` (tenants, provisioning) — should persist to `tenants` + `provisioning_status` tables
- `AdminService` (users, system overview) — read from Firebase Auth / Cloud SQL

**Files**: `packages/sirsi-admin-service/main.go`, new `tenant_sql.go`, `signing_sql.go`

#### 5. Dependabot Alerts (4 remaining — all low severity)
All are in deep transitive dependencies, not directly exploitable:
- `fast-xml-parser` — stack overflow in XMLBuilder (OpenSign dependency)
- `@tootallnate/once` x3 — scoping issue (legacy Cloud Functions dependency)

**Action**: Audit if these are in production paths or only dev/build dependencies. Suppress if not exploitable.

#### 6. Firebase Cloud Functions Audit
9 Cloud Functions still deployed on `sirsi-nexus-live`:
- `handlePaymentWebhook` — may conflict with Stripe endpoints on Cloud Run
- `createCheckoutSession` — legacy, now handled by SigningService gRPC
- `getMFAEnrollment`, `grantInvestorAccess` — may overlap with Cloud Run

**Action**: Identify which functions are still called by live clients (sirsi-sign.web.app). Decommission duplicates. Keep only those needed for Firebase-specific triggers (scheduled cleanup, etc).

**Files**: `packages/sirsi-admin-service/signing_service.go` (Stripe), `.github/workflows/deploy-unified-functions.yml`

#### 7. ADR-021 (Unified gRPC Convergence) — Status: Proposed
This ADR is still in "Proposed" status. Now that v0.9.2+ achieved 100% gRPC, this should be marked "Accepted" and closed.

**Files**: `docs/ADR-021-UNIFIED-GRPC-CONVERGENCE.md`

### 🟢 P2 — Feature Completion

#### 8. Onboarding Wizard E2E Verification
The `/signup/onboarding` route exists (33KB, 5-step wizard) but hasn't been E2E tested with live Stripe checkout. Steps:
- Step 1: Pick plan (Free/Solo/Business)
- Step 2: Company info
- Step 3: Stripe checkout → real payment
- Step 4: GitHub repo creation
- Step 5: Dashboard redirect

**Test**: Sign up as a test tenant, verify Stripe session, verify GitHub repo creation, verify tenant record in Cloud SQL.

**Files**: `packages/sirsi-portal-app/src/routes/signup/onboarding.tsx`

#### 9. Command Palette — 2 TODO Actions
The Command Palette (`⌘K`) has 2 unfinished actions:
- "New Contract" → navigates to `/contracts` but doesn't open create modal (line 100)
- "Ask AI" → no action (line 110)

**Files**: `packages/sirsi-portal-app/src/components/command-palette/CommandPalette.tsx`

#### 10. Hypervisor Sub-Tabs (DevOps, Security, Database, etc.)
The Operations Command Center has 10 tabs. Currently:
- **OVERVIEW** — ✅ Live telemetry (Cloud Run + Stripe)
- **DEVOPS** — Has mock CI/CD pipeline data
- **INFRASTRUCTURE** — Has mock Cloud Run/Kubernetes data
- **SECURITY** — Has mock auth/MFA metrics
- **DATABASE** — Has mock Cloud SQL health data
- **FRONTEND** — Has mock Lighthouse/bundle data
- **BACKEND** — Has mock gRPC latency data
- **INTEGRATIONS** — Has mock Stripe/SendGrid/GitHub data
- **COST** — Has mock cloud spend breakdown
- **INCIDENTS** — Has mock incident timeline

**Action**: Wire remaining tabs to live data where APIs are available. Prioritize DATABASE (Cloud SQL health via `pg_stat` queries) and INTEGRATIONS (Stripe balance, GitHub API rate limits).

**Files**: `packages/sirsi-admin-service/main.go` (GetHypervisorDevOps, GetHypervisorSecurity, etc.)

#### 11. Sirsi Sign — Vault Landing & Contract Builder
Per the archived continuation prompt `docs/CONTINUATION-PROMPT-SIGN-PLATFORM.md`:
- **Vault Landing** (`sign.sirsi.ai`) — needs proper login/register UI
- **Contract Builder** — generalize the Sirsi Configurator into a reusable template system
- **Live Contract** — Tameeka Lockhart contract was the original driver; verify if still pending

**Files**: `packages/sirsi-sign/src/`, `packages/sirsi-opensign/`

### 🔵 P3 — Future Roadmap

#### 12. Vertex AI / Gemini Integration
The Hypervisor's AI layer is spec'd but not implemented:
- Gemini-powered AI recommendations in the Operations Command Center
- Natural language command execution ("Scale to 3 instances")
- Anomaly detection on telemetry data

**Requires**: Vertex AI API provisioning, Gemini model access

#### 13. WebSocket Streaming for Real-Time Dashboards
Currently all Hypervisor data is fetched via gRPC polling. For a truly real-time Operations Command Center:
- Server-Sent Events (SSE) or WebSocket connection from React to Cloud Run
- Push telemetry updates (deployment events, incidents) without polling

#### 14. Multi-Tenant Cloud Run Provisioning (ADR-030 Phase 5: On-Premise)
The tenant provisioning flow creates GitHub repos. Future:
- Auto-provision dedicated Cloud Run services per tenant
- Custom domain mapping (`{slug}.sirsi.ai`)
- Isolated Cloud SQL schemas per tenant

#### 15. SOC 2 Compliance Automation
Per `docs/SECURITY_COMPLIANCE.md`:
- Automated evidence collection for SOC 2 Type II
- Continuous compliance monitoring in Hypervisor Security tab
- Sealed audit logs in Cloud SQL

---

## Key File Inventory

### Go Backend (`packages/sirsi-admin-service/`)
| File | Lines | Purpose |
|:-----|:------|:--------|
| `main.go` | 1,795 | All ConnectRPC service handlers |
| `signing_service.go` | ~470 | SigningService handlers |
| `telemetry.go` | 295 | Live Cloud Run + Stripe telemetry |
| `catalog_sql.go` | 210 | SQL persistence for CatalogService |
| `database.go` | 75 | Cloud SQL connection pool (pgx) |
| `schema.sql` | 130 | PostgreSQL schema (6 tables) |
| `deploy.sh` | 120 | Cloud Run deploy script |
| `Dockerfile` | 38 | Multi-stage build |

### React Frontend (`packages/sirsi-portal-app/`)
| Area | Routes | Key Files |
|:-----|:-------|:----------|
| **Public** | landing, login, signup, docs, about, pricing, blog, privacy, terms | `src/routes/*.tsx` |
| **Admin** | dashboard, users, tenants, contracts, catalog, operations, data-room, messaging, settings | `src/routes/*.tsx` |
| **System Status** | monitoring, telemetry, system-logs, security, cache-status, api-server, database-health, backup-status | `src/routes/*.tsx` |
| **Hypervisor** | hypervisor, console, ai-agents, analytics | `src/routes/*.tsx` |
| **Investor** | investor-portal, kpi-metrics, committee | `src/routes/*.tsx` |
| **Onboarding** | /signup/onboarding (5-step wizard) | `src/routes/signup/onboarding.tsx` |

### Shared Libraries
| Package | Purpose |
|:--------|:--------|
| `packages/sirsi-ui/` | Universal Component System (UCS) |
| `packages/sirsi-sign/` | E-Signing + Payment workflows |
| `packages/sirsi-auth/` | Auth module |
| `packages/sngp/` | gRPC service definitions |

---

## Deploy Commands

### Frontend (Firebase Hosting)
```bash
firebase deploy --only hosting:sirsi-ai --project sirsi-nexus-live
```

### Backend (Cloud Run)
```bash
cd packages/sirsi-admin-service && ./deploy.sh
```
Or see workflow: `.agents/workflows/deploy-admin-service.md` (turbo-all)

### Cloud Functions
```bash
# See workflow: .agents/workflows/deploy-unified-functions.md
```

---

## Test Credentials
- **Name**: Cylton Collymore
- **Email**: cylton@sirsi.ai
- **Demo Access**: Portal ID `CC-001`, Access Code `Sirsi2026`
