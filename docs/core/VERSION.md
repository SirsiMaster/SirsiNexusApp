# Sirsi Nexus — Unified Version History

> **Synoptic Ledger** — This document consolidates ALL version history from every era of SirsiNexus development into one canonical record. Previously tracked across `docs-backup/core-engine/CHANGELOG.md` (Rust), `ui/CHANGELOG.md` (old Next.js UI), and `docs/core/VERSION.md`. Unified March 3, 2026.

---

## Version Numbering

Sirsi Nexus follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

> **Note on Historical Numbering**: Early releases (Jun 2025) used aspirational version numbers (1.0.0, 1.1.0, 1.2.0) for pre-alpha milestones. The project normalized to `0.x.x-alpha` starting at v0.5.3 (Jul 2025). This ledger preserves the original numbering with annotations.

---

## Current Version

```
v0.9.0-alpha — March 6, 2026
Stack: Go + ConnectRPC | React 19 + Vite 7 | Protobuf ES v2 | Cloud SQL + Firestore | Firebase Auth
```

---
---

# ERA 3: React Migration (Feb–Mar 2026)

> **Stack**: Go (Golang) + ConnectRPC ⟶ React 19 + Vite 7 + TanStack Router  
> **Database**: Cloud SQL (PostgreSQL) + Firestore  
> **Design**: Swiss Neo-Deco (Emerald + Gold, Cinzel + Inter)  
> **Key ADRs**: ADR-027 (React Migration), ADR-026 (Hypervisor Protocol), ADR-028 (Proto Versioning), ADR-030 (Tenant Provisioning)

---

## Version 0.9.0-alpha (2026-03-06)

### 🏗 Protobuf ES v2 Upgrade & ADR-030 Phase 3 Completion

#### gRPC Infrastructure Upgrade
- All TypeScript schemas regenerated with `buf.build/bufbuild/es` (Protobuf ES v2.11.0)
- `sirsi-sign` migrated from `createPromiseClient` (Connect v1) → `createClient` (Connect v2)
- All `new Request()` constructors replaced with plain objects (v2 pattern)
- Deleted stale v1 gen files (`proto/admin/v1`, `proto/contracts/v1`) — 2,646 lines removed
- Removed 12 orphaned `_connect.ts` files from intermediate generation step
- Firebase sub-packages pinned to exact versions for Rollup compatibility

#### ADR-030 Phase 3: GitHub Automation & Catalog Sync
- Go backend: GitHub API integration (`go-github/v60`) for tenant repo provisioning
- `StripeCatalogSync.tsx`: reusable UCS component for Stripe product/price sync
- `catalog.ts`: canonical product/bundle definitions (Solo, Business, FinalWishes Core)
- Multi-step provisioning engine: Firebase → Stripe → GitHub → DNS
- GitHub integration gated by `SIRSI_GITHUB_PAT` env var

#### Commits
| Hash | Message |
|:-----|:--------|
| `5f16a9f` | feat(ADR-030 Phase 3 + gRPC v2): GitHub automation, catalog sync, Protobuf ES v2 upgrade |

---

## Version 0.8.3-alpha (2026-03-06)

### 🏗 ADR-030: Self-Service Tenant Provisioning & Commerce Architecture

Architecture and initial implementation for the Client Onboarding Engine — the system that enables new public clients to sign up, provision infrastructure, and begin using the platform without manual administrator intervention.

#### Commerce Architecture (Two Paths)
- **Path A — SaaS Self-Service (Priority)**: Free ($0) / Solo ($49/mo) / Business ($499/mo) via Stripe Checkout → Onboarding Wizard → Provisioned Tenant
- **Path B — Enterprise Bespoke**: Custom engagements via Sirsi Sign MSA/SOW → Product Catalog → e-Sign + Payment → Provisioned Tenant
- FinalWishes validated as vendor #1 on Path B — its catalog structure is the generalized blueprint

#### Pricing Page Rewrite
- Complete rewrite of `/pricing` with canonical tiers: Free, Solo ($49/mo), Business ($499/mo)
- Feature comparison matrix (7 categories, 25+ feature rows)
- ROI section, FAQ aligned to new tiers, enterprise callout to Sirsi Sign
- All CTAs linked to `/signup` with plan query params

#### Landing Page Enhancement
- Added "ROI-Positive from Day One" section with 4 key metrics
- "See pricing plans →" cross-link to `/pricing`

#### Pre-Implementation Decisions (8/8 LOCKED)
1. Free Tier Wizard: Lite (3-step)
2. Managed vs. Self-Managed: Hybrid (Free/Solo=Managed, Business=Choice)
3. On-Premise: Deferred to Phase 5
4. Investor Portal: Keep existing layout
5. GitHub Strategy: Template repo (`SirsiMaster/tenant-scaffold`), automated, transferable
6. GitHub Tier Gating: Free=none, Solo=repo, Business=repo+CI/CD
7. Stripe Products: Create immediately
8. Pricing Page Format: Cards + Matrix

#### Tenant Repo Scaffold Specification
- Every Solo/Business repo gets: Full canonical doc suite, SIRSI_RULES.md, ADR-001, UCS component library, CI/CD pipelines
- Repos are transferable on client departure
- GitHub Free plan sufficient for Phase 1

#### Canon Updates
- `docs/ADR-030-SELF-SERVICE-TENANT-PROVISIONING.md` — Formal ADR
- `docs/ADR-INDEX.md` — Updated (25 ADRs)
- `docs/VERSIONING_STANDARD.md` — NEW: Codified versioning standard (app, website, document)
- Versioned documents enabled for Solo tier

#### Role-Based Routing Fixes
- Fixed routing collision: unique mock emails for Investor/Client demo credentials
- Client/Investor portal independent layout enforcement

#### Commits
| Hash | Message |
|:-----|:--------|
| `3dfbdaa` | feat: landing page redesign, role-based routing fixes, client portal independence |
| `b99abb5` | feat(ADR-030): Self-Service Tenant Provisioning — canonical ADR + pricing page rewrite |
| `6d99e19` | feat: ROI section on landing page, versioned docs for Solo, full scaffold spec |

---

## Version 0.8.2-alpha (2026-03-05)

### 🎨 UNIVERSAL DARK/LIGHT THEME PARITY — COMPLETE (Tasks 1-40/40)

Full conversion of the HTML Admin Console into a React 19 SPA with TanStack Router, code splitting, dark mode, and pixel-perfect Swiss Neo-Deco parity. See **ADR-027** for the full decision record.

#### Migration Achievement Summary

| Metric | Value |
|:-------|:------|
| Routes Ported | 25 |
| TypeScript/CSS Files | 64 |
| Lines of Code | ~6,100 |
| Commits | 13 |
| Build Output (Core) | ~390 KB (code-split) |
| Dark Mode | ✅ Persistent + System Preference |
| Visual QA | 11 pages audited, 100% parity |

#### Phase 1 — Core Route Porting (Feb 2026)
- `31d4f42` — Pixel-perfect parity for Security, Site Admin, Portal, Telemetry, System Logs
- Root layout (`__root.tsx`) with admin-header + admin-sidebar + content-wrapper
- All canonical CSS from `common-styles.css` ported to `index.css`

#### Phase 2 — Extended Routes (Feb 2026)
- `870d3a5` — Analytics, KPI Metrics, Committee, Messaging, Monitoring, Console
- Recharts integration for all chart-heavy pages

#### Phase 3 — System Status Pages (Mar 2026)
- `3c2a8cb` — Cache Status, API Server, Database Health, Backup Status
- `9bcd4d9` — All 25 routes registered in TanStack Router + sidebar navigation

#### Phase 4 — QA, Polish & Performance (Mar 2026)
- `2bb42e9` — **Bug Fix**: Portal strategic module cards rendering blank (CSS specificity)
- `48cd5dc` — **Code Splitting**: 24 routes lazy-loaded with `React.lazy()` + Suspense
- `be3afe5` — **Dark Mode**: Persistent toggle, system preference detection, no FOUC

#### Infrastructure & Canon Updates
- `bb2f112` — SIRSI_RULES.md v6.1.0: Typography Canon (Rule 21) + React Migration (Rule 22)
- `ad77595` — Typography standardization: bold purge + header canonization
- `4d576d5` — Dependency updates, shared components, ADR-026 compliance
- `1905dfd` — React dedupe fix in monorepo workspaces
- `d2bd4f3` (2026-03-03) — ADR-027, VERSION bump, Dev Intelligence dashboard rewrite
- `3bd5d06` (2026-03-03) — Synoptic VERSION.md unification + version badges in both headers
- `e3ad48f` (2026-03-03) — Purge all stale version references (11 files: v0.5.0, v0.7.9, v1.0.0 → v0.8.0)

#### Proto/gRPC Alignment — ADR-028 (2026-03-03)
- `8e590b6` (2026-03-03) — Deleted legacy v1 proto and generated output from `packages/sirsi-admin-service/`
- Confirmed all consumers (Go backend, React app) already use v2 from root `/proto/`
- Synced React `src/gen/` with canonical `proto/gen/ts/` (SystemOverview types were missing)
- Annotated Sirsi Sign v1 contracts proto as separate service boundary

#### ADR Registry Unification (2026-03-03)
- `78f06a8` (2026-03-03) — Initial ADR audit: discovered 3 unindexed ADRs in `docs/sirsi-platform/`
- `df4524d` (2026-03-03) — Unified ADR registry: renumbered sirsi-platform ADRs to root
  - `sirsi-platform/ADR-003` → `ADR-006-HMAC-SECURITY-LAYER.md` (created 2025-12-31)
  - `sirsi-platform/ADR-004` → `ADR-007-CONTRACTS-GRPC-SERVICE.md` (created 2025-12-31) 
  - `sirsi-platform/ADR-005` → `ADR-008-PRINTABLE-MSA-VIEWER.md` (created 2026-01-21, updated 2026-01-22)
- Total ADRs: 23 (unified flat numbering, no sub-namespaces)

#### Stack Comparison

| Layer | ERA 1 (Jun 2025) | ERA 3 (Mar 2026) |
|:------|:-----------------|:-----------------|
| **Frontend** | Next.js + React (in `/ui`) | React 19 + Vite 7 + TanStack Router (`/packages/sirsi-portal-app`) |
| **Backend** | Rust + Axum | Go + ConnectRPC (ADR-018, ADR-019) |
| **Database** | CockroachDB | Cloud SQL + Firestore (ADR-017) |
| **Styling** | Tailwind + custom CSS | Tailwind + shadcn/ui + Swiss Neo-Deco tokens |
| **Charts** | Recharts | Recharts (unchanged) |
| **Icons** | Mixed | Lucide React (unified) |

---
---

# ERA 2: Platform Convergence (Feb 2026)

> **Stack Transition**: Rust → Go, CockroachDB → Cloud SQL/Firestore, Next.js → HTML Admin Portal  
> **Key ADRs**: ADR-017 (CockroachDB Decommission), ADR-018 (Stack Convergence), ADR-019 (Rust Decommission), ADR-020 (Application Firewall), ADR-025 (Unified App Architecture)

---

## Version 0.7.10-alpha (2026-02-27)

### 🏛 Platform Convergence — Stack V4

This era delivered the massive architectural convergence that retired legacy technologies and established the production-grade stack.

#### Decommissions
- **CockroachDB → Cloud SQL + Firestore** (ADR-017)
  - `b3e5c09` — Remove all runtime deps, health checks, port 26257 refs, update docker-compose to PostgreSQL
  - `b34babb` — Remove CockroachDB from k8s configs, replace with PostgreSQL on port 5432
  - `b013905` — ADR-017 document: rationale, files changed, consequences
- **Rust/WASM → Go** (ADR-019)
  - `ce94e6f` — ADR-019/020: Rust decommission + Application Firewall
  - All backend services migrated to Go with ConnectRPC (gRPC-Web)
  - `packages/sirsi-admin-service/` established as the Go backend

#### HTML Admin Portal — Swiss Neo-Deco
- `081cee6` — Swiss Neo-Deco: unified design language + UCS base stylesheet
- `ecaf1af` — Wire Swiss Neo-Deco into Sirsi Portal
- `09639f6` — Canonical compliance: add 10 missing docs + fix ADR numbering
- `59e34f4` — Rebrand admin portal to Sirsi Green and Gold UI
- `3b6ca22` — Complete admin portal setup with Connect v2 integration
- Established `packages/sirsi-portal/admin/` with Web Components (`admin-header.js`, `admin-sidebar.js`)
- 25+ HTML pages with shared `common-styles.css`

#### Governance
- SIRSI_RULES.md v6.0.0 → v6.1.0 with Rule 20 (Admin Page Layout Contract), Rule 21 (Typography Weight Canon), Rule 22 (React Migration Contract)
- 8 new ADRs issued (ADR-017 through ADR-025)
- `packages/sirsi-admin-service/` — Go backend with ConnectRPC
- `packages/sirsi-portal-app/` — React app scaffolded (Vite + TanStack Router)

---
---

# ERA 1: Foundation (Jun–Jul 2025)

> **Stack**: Rust + Axum + CockroachDB + Next.js/React  
> **Note**: The Rust backend and CockroachDB database were later **decommissioned** in ERA 2.  
> See ADR-017 (CockroachDB) and ADR-019 (Rust/WASM) for rationale.

---

## Version 0.7.5-alpha (2025-07-11)

### Architectural Audit — Vision Restoration

Critical architectural audit revealed missing core SirsiNexus components from the original vision.

#### Findings
- ❌ LLM-Based Intelligent Agents (only cloud API connectors existed)
- ❌ Model Context Protocol (MCP) Integration
- ❌ Complete GCP Infrastructure
- ❌ Unified Hypervisor (service orchestrator ≠ intelligent hypervisor)

#### Documentation Updates
- Comprehensive Architecture Design added
- README updated with unified vision and roadmap
- Phase 7.5 detailed implementation plan

---

## Version 0.5.5-alpha (2025-07-08)

### UI Consistency & Sirsi Assistant Integration

#### Added
- Sirsi Assistant migrated from sidebar to header (single primary AI interface)
- All pages conform to consistent ClientLayout design patterns
- `SirsiHeaderAssistant.tsx` component with React hooks
- Removed 200+ lines of duplicate AI sidebar functionality
- Real-time message history with timestamps and typing indicators

---

## Version 0.5.4-alpha (2025-07-08)

### Dark Mode Implementation (Old UI) `[SUPERSEDED — reimplemented in v0.8.0 for React app]`

- Universal dark mode across all 9 major pages in the `/ui` Next.js app
- Consistent theme architecture
- Zero visual artifacts

---

## Version 0.5.3-alpha (2025-07-07)

### Complete Frontend-Backend Integration

**100% end-to-end integration** achieved.

#### Frontend (Next.js `/ui`)
- 41 pages compile successfully with zero TypeScript errors
- Complete settings UI with 14 categories and 100+ features
- API integration layer fully implemented

#### Backend (Rust/Axum) `[DECOMMISSIONED — ADR-019]`
- Zero compilation errors across entire Rust codebase
- All API endpoints properly structured
- Database connectivity established with CockroachDB `[DECOMMISSIONED — ADR-017]`

#### Database (CockroachDB) `[DECOMMISSIONED — ADR-017, replaced by Cloud SQL + Firestore]`
- 8 tables created with proper schema and indexes

#### Integration
- Settings UI → Backend APIs fully connected
- Credential management with AES-256-GCM encryption
- Authentication middleware operational
- Multi-cloud provider support (AWS, Azure, GCP, DigitalOcean)

---

## Versions 0.4.1 – 0.4.4 (2025-07-03 to 2025-07-04)

### UI Component Polish (`/ui` Next.js app) `[SUPERSEDED — /ui app replaced by /packages/sirsi-portal-app]`

> *Originally tracked in `ui/CHANGELOG.md`*

#### v0.4.4 (2025-07-04) — Backend Test Infrastructure
- New `/test-backend` page for comprehensive validation
- WebSocket service layer with automatic reconnection
- CDB compliance improved from 35% to 85%

#### v0.4.3 (2025-07-03) — Form Validation
- FormMessage component fixed for react-hook-form validation
- FormProvider wrapper added to all form components
- Test pass rate improved from 79.8% to 93.3% (97/104 tests)

#### v0.4.2 (2025-07-03) — Glass Morphism
- Body background matched to sidebar glass styling
- `backdrop-filter: blur(30px) saturate(300%)`
- Webpack module error resolved via cache clear

#### v0.4.1 (2025-07-03) — Tab Component Fixes
- TabsList z-index issues fixed in analytics section
- Opaque white overlay removed from TabsTrigger
- Simplified dark background with single layer system

---

## Versions 0.2.0 – 0.2.2 (2025-07-04 to 2025-07-05)

### Rust Core Engine `[DECOMMISSIONED — ADR-019, replaced by Go + ConnectRPC]`

> *Originally tracked in `docs-backup/core-engine/CHANGELOG.md`*

#### v0.2.2 (2025-07-05) — Production Ready Phase 2
- Complete documentation consolidation (API Guide, Operations Guide, Architecture)
- Real Azure SDK integration (replaced all mock services)
- Production Kubernetes manifests and Helm charts
- Docker multi-stage builds with security scanning
- Resolved all 24+ critical Rust compilation errors
- Sub-millisecond agent response times, ~50MB baseline memory

#### v0.2.1 (2025-07-04) — Enhanced Protobuf Schema
- Comprehensive protobuf redesign following Google API Design Guidelines
- Google API standards: Timestamp, FieldMask, Empty types
- Enhanced session management with lifecycle states
- Full CRUD operations for agent management
- Pagination support with page tokens
- Multi-language proto support (Go, Java, C#)

#### v0.2.0 (2025-07-04) — AI Hypervisor & Agent Framework
- WebSocket-to-gRPC bridge architecture (WS 8080, gRPC 50051)
- AgentServiceImpl with all gRPC service methods
- Multi-agent orchestration, session-based management
- Redis session persistence
- AWS Agent with resource discovery, cost analysis, security review
- 1000+ concurrent WebSocket connections supported

---

## Versions 1.0.0 – 1.2.0 (2025-06-25)

### Foundation Milestones `[ASPIRATIONAL NUMBERING — normalized to 0.x.x after this era]`

> These releases used aspirational major version numbers during initial development.
> The project later normalized to `0.x.x-alpha` semver.

#### v1.2.0 (2025-06-25) — Frontend Foundation Complete
- React/Next.js app with 100% TypeScript compilation
- Complete component library with type safety
- State management with Redux Toolkit
- Infrastructure template support (Bicep, Terraform, Pulumi)

#### v1.1.0 (2025-06-25) — CockroachDB Migration `[DECOMMISSIONED — ADR-017]`
- PostgreSQL → CockroachDB schema conversion
- Docker Compose with CockroachDB
- Connection pooling, migration management
- Type system alignment (TIMESTAMPTZ, INT8)

#### v1.0.0 (2025-06-25) — Foundation Complete
- Rust core engine with Axum framework `[DECOMMISSIONED — ADR-019]`
- CockroachDB database integration `[DECOMMISSIONED — ADR-017]`
- Authentication with Argon2 + JWT
- Project CRUD, user management, API framework
- Zero compilation errors, >85% test coverage

---

## Version 0.1.0 (2025-06-24)

### Initial Project Scaffolding

- Initial Rust project setup with Cargo
- Basic API structure using Axum framework
- Authentication system (Argon2 hashing, JWT login)
- Project and resource management CRUD
- PostgreSQL + SQLx integration
- OpenTelemetry + request tracing

---
---

# ADR Registry (By Era)

### ERA 3 — React Migration
| ADR | Title | Date |
|:----|:------|:-----|
| ADR-030 | Self-Service Tenant Provisioning & Client Onboarding Engine | 2026-03-06 |
| ADR-027 | React Portal Migration — HTML-to-React Admin Console | 2026-03-03 |
| ADR-026 | Hypervisor Command Protocol — Operational Telemetry via gRPC | 2026-03-02 |

### ERA 2 — Platform Convergence
| ADR | Title | Date |
|:----|:------|:-----|
| ADR-025 | Unified App Architecture — Web + Desktop (Tauri) | 2026-02-27 |
| ADR-024 | Pitch Deck Visual Standard & Rubric | 2026-02-20 |
| ADR-020 | Application Firewall | 2026-02-27 |
| ADR-019 | Rust/WASM Decommission — Go-Only Stack | 2026-02-27 |
| ADR-018 | Technical Stack Convergence (Stack V4) | 2026-02-18 |
| ADR-017 | CockroachDB Decommission | 2026-02-27 |

### ERA 1 — Foundation
| ADR | Title | Date |
|:----|:------|:-----|
| ADR-016 | Canonical MFA Routing Hub | 2026-02-12 |
| ADR-015 | OpenSign Convergence — Dual-Client Architecture | 2026-02-09 |
| ADR-014 | Bipartite Contract Execution Protocol | 2026-02-07 |
| ADR-013 | Hierarchical Routing & Multi-Tenant Differentiation | 2026-02-10 |
| ADR-012 | Live MFA Delivery Rails | 2026-01-30 |
| ADR-011 | Universal Component System (UCS) | 2026-01-29 |
| ADR-010 | Sirsi Repository Unification | 2025-07-28 |
| ADR-003 | Migration to TanStack Query v5 | 2025-07-12 |

---

## Archived Source Files

These files contained the original version history that has been consolidated into this document:
- `docs-backup/core-engine/CHANGELOG.md` — Rust Core Engine (v0.1.0 → v0.2.2)
- `ui/CHANGELOG.md` — Old Next.js UI (v0.4.1 → v0.4.4)
- `docs-backup/core/VERSION.md` — Previous copy of this file (duplicate)

---

**Next Review Date**: On next major version bump  
**Version Control**: Git tags mark all releases  
**Canonical Location**: `docs/core/VERSION.md` (this file)  
**Machine-Readable Version**: Root `VERSION` file + `packages/sngp/version.json`
