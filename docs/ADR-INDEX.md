# ADR Index (Architecture Decision Records)

This index tracks **all** architectural decisions for the Sirsi platform — the unified product that spans web application, desktop application (Tauri), mobile application (React Native), Cloud Hypervisor, website, and pitch deck. All distributions share one codebase, one set of rules, one ADR registry.

**Total ADRs: 37** | **Next available: ADR-043**

---

## Master Registry

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-003](ADR-003-TANSTACK-MIGRATION.md) | Migration to TanStack Query v5 | Approved | 2025-07-12 |
| [ADR-006](ADR-006-HMAC-SECURITY-LAYER.md) | HMAC-Based Security Layer for Multi-Tenant Vault | Accepted | 2025-12-31 |
| [ADR-007](ADR-007-CONTRACTS-GRPC-SERVICE.md) | Contracts gRPC Service | Accepted | 2025-12-31 |
| [ADR-008](ADR-008-PRINTABLE-MSA-VIEWER.md) | Printable MSA Viewer Component | Accepted | 2026-01-21 |
| [ADR-010](ADR-010-SIRSI-REPOSITORY-UNIFICATION.md) | Sirsi Repository Unification | Approved | 2025-07-28 |
| [ADR-011](ADR-011-UNIVERSAL-COMPONENT-SYSTEM.md) | Universal Component System (UCS) | Approved | 2026-01-29 |
| [ADR-012](ADR-012-LIVE-MFA-DELIVERY-RAILS.md) | Live MFA Delivery Rails (SMS/Email) | Approved | 2026-01-30 |
| [ADR-013](ADR-013-SIRSI-SIGN-HIERARCHY.md) | Hierarchical Routing & Multi-Tenant Differentiation | Accepted | 2026-02-10 |
| [ADR-014](ADR-014-BIPARTITE-CONTRACT-EXECUTION.md) | Bipartite Contract Execution Protocol | Accepted | 2026-02-07 |
| [ADR-015](ADR-015-OPENSIGN-CONVERGENCE.md) | OpenSign Convergence — Dual-Client Architecture | Accepted | 2026-02-09 |
| [ADR-016](ADR-016-CANONICAL-MFA-ROUTING-HUB.md) | Canonical MFA Routing Hub & Session Persistence | Accepted | 2026-02-12 |
| [ADR-017](ADR-017-COCKROACHDB-DECOMMISSION.md) | CockroachDB Decommission | Accepted | 2026-02-27 |
| [ADR-018](ADR-018-TECHNICAL-STACK-CONVERGENCE.md) | Technical Stack Convergence (Stack V4) | Approved | 2026-02-18 |
| [ADR-019](ADR-019-RUST-DECOMMISSION.md) | Rust/WASM Decommission — Go-Only Stack | Accepted | 2026-02-27 |
| [ADR-020](ADR-020-APPLICATION-FIREWALL.md) | Portfolio Application Firewall | Accepted | 2026-02-27 |
| [ADR-021](ADR-021-UNIFIED-GRPC-CONVERGENCE.md) | Unified gRPC Convergence — Portal ↔ Sign Integration | Proposed | 2026-02-09 |
| [ADR-022](ADR-022-GOVERNANCE-CONSOLE.md) | Sirsi Governance Console & Dynamic Catalog | Proposed | 2026-02-12 |
| [ADR-023](ADR-023-CONTRACT-LIFECYCLE.md) | Contract Lifecycle & Funding Status | Accepted | 2026-02-13 |
| [ADR-024](ADR-024-PITCH-DECK-VISUAL-STANDARD.md) | Pitch Deck Visual Standard & Rubric | Accepted | 2026-02-20 |
| [ADR-025](ADR-025-UNIFIED-APP-ARCHITECTURE.md) | Unified App Architecture — Web + Desktop (Tauri) | Accepted | 2026-02-27 |
| [ADR-026](ADR-026-HYPERVISOR-COMMAND-PROTOCOL.md) | Hypervisor Command Protocol — Operational Telemetry via gRPC | Accepted | 2026-03-02 |
| [ADR-027](ADR-027-REACT-PORTAL-MIGRATION.md) | React Portal Migration — HTML-to-React Admin Console | Accepted | 2026-03-03 |
| [ADR-028](ADR-028-PROTO-VERSIONING-ALIGNMENT.md) | Proto/gRPC Versioning Alignment — v2 Canonical | Accepted | 2026-03-03 |
| [ADR-029](ADR-029-CLOUD-RUN-DEPLOYMENT.md) | Cloud Run Deployment Architecture — sirsi-admin Service | Accepted | 2026-03-04 |
| [ADR-030](ADR-030-SELF-SERVICE-TENANT-PROVISIONING.md) | Self-Service Tenant Provisioning & Client Onboarding Engine | Accepted | 2026-03-06 |
| [ADR-031](ADR-031-UNIFIED-COMMERCE-PIPELINE.md) | Unified Commerce & Signing Pipeline — 100% gRPC | Accepted | 2026-03-06 |
| ADR-032 | Master Blueprint v4 — Total Maximal Architecture | Proposed | 2026-03-07 |
| ADR-033 | AlloyDB AI Migration + Cognitive SQL | Proposed | 2026-03-07 |
| ADR-034 | NebuLang Protocol — Knowledge Graph + DLT Anchoring | Proposed | 2026-03-07 |
| ADR-035 | Agent Swarm Architecture | Proposed | 2026-03-07 |
| ADR-036 | Self-Evolving Agent Protocol | Proposed | 2026-03-07 |
| ADR-037 | Hybrid LLM Engine — Quad-Model Routing | Proposed | 2026-03-07 |
| ADR-038 | Autonomous Infrastructure Genesis | Proposed | 2026-03-07 |
| ADR-039 | Direct-to-Metal Orchestration Protocol | Proposed | 2026-03-07 |
| ADR-040 | KG Query Engine — Predictive Infrastructure | Proposed | 2026-03-07 |
| ADR-041 | Tri-Silicon Mesh Orchestration | Proposed | 2026-03-07 |
| ADR-042 | Sovereign Compute Deployment Model (Mac Studio Clusters) | Proposed | 2026-03-07 |

---

## Categories

### Contract Execution & Signing
- ADR-006: HMAC Security Layer — MITM/replay protection for vault redirect flows
- ADR-007: Contracts gRPC Service — gRPC contract CRUD and execution backend
- ADR-008: Printable MSA Viewer — Full-fidelity legal document rendering component
- ADR-014: Bipartite Dual-Signature Ceremony (Provider/Client Workflows)
- ADR-015: OpenSign Convergence — Dual-Client Architecture (gRPC + REST SDK) — **SUPERSEDED by ADR-031**
- ADR-023: Contract Lifecycle (`DRAFT` → `FULLY_EXECUTED` → `COMPLETED` → `ARCHIVED`)
- ADR-031: Unified Commerce & Signing Pipeline — CatalogService + SigningService, 100% gRPC, zero REST

### Platform Architecture
- ADR-028: Proto/gRPC Versioning Alignment — v2 canonical, v1 retired, single `/proto/` source of truth
- ADR-026: Hypervisor Command Protocol — Operational Telemetry via gRPC
- ADR-021: Unified gRPC Gateway (Single Go service for Portal + Sign)
- ADR-013: Hierarchical URL Routing (`sign.sirsi.ai/vault/:user/:type/:entity/:docId`)
- ADR-011: Universal Component System (UCS) — Integrated Independence
- ADR-010: Repository Unification (Monorepo Strategy)
- ADR-018: Technical Stack Convergence (Stack V4 — Go, React, Firebase, Cloud SQL)
- ADR-029: Cloud Run Deployment — sirsi-admin ConnectRPC service, scale-to-zero, vendored Go builds
- ADR-030: Self-Service Tenant Provisioning — SaaS tiers (Free/Solo/Business), onboarding wizard, Stripe subscriptions

### Portfolio & Governance
- ADR-017: CockroachDB Decommission — removed from all runtime, k8s, health checks
- ADR-019: Rust/WASM Decommission — Go sole backend; **NOTE: Rust re-adopted for native clients (Tauri, headless, cluster) per ADR-032**
- ADR-020: Application Firewall — repo-scoped AI directives, design language firewalls

### Master Blueprint v4 (Proposed — Epochs 3-10)
- ADR-032: Master Blueprint v4 — Total maximal architecture plan
- ADR-033: AlloyDB AI Migration — Cloud SQL → AlloyDB with cognitive SQL
- ADR-034: NebuLang Protocol — Knowledge Graph with DLT truth anchoring
- ADR-035: Agent Swarm — Coordinator + domain agent architecture
- ADR-036: Self-Evolving Agent — Agents that expand their own capabilities
- ADR-037: Hybrid LLM Engine — Quad-model routing (reasoning/speed/sovereign/in-DB)
- ADR-038: Autonomous Genesis — Natural language → production stack
- ADR-039: Direct-to-Metal — NETCONF/Redfish/DCGM/TPU direct hardware
- ADR-040: KG Query Engine — Predictive infrastructure-as-data
- ADR-041: Tri-Silicon Mesh — Silicon-aware workload scheduling
- ADR-042: Sovereign Compute — Mac Studio M5 Max cluster deployment
- ADR-025: Unified App Architecture — Single React codebase, Tauri desktop, Sirsi Rail UCS

### React Migration & Frontend Architecture
- ADR-027: React Portal Migration — 25 routes ported, code splitting, dark mode, responsive sidebar
- ADR-025: Unified App Architecture — Single React codebase, Tauri desktop, Sirsi Rail UCS
- ADR-003: Migration to TanStack Query v5
- ADR-018: Technical Stack Convergence (Stack V4 — Go, React, Firebase, Cloud SQL)

### Security & Authentication
- ADR-016: Canonical MFA Routing Hub & Session Persistence
- ADR-012: Live MFA Delivery Rails (SMS/Email via Firebase)
- ADR-006: HMAC Security Layer — vault redirect protection

### Presentation
- ADR-024: Pitch Deck Visual Standard & Rubric
- ADR-022: Governance Console & Dynamic Catalog

---

## ADR Numbering

| Range | Status |
|:------|:-------|
| ADR-001, ADR-002 | Legacy (FinalWishes repo, not in SirsiNexusApp) |
| ADR-003 | Active — TanStack Query v5 |
| ADR-004, ADR-005, ADR-009 | Never assigned |
| ADR-006 — ADR-008 | Active — Vault security, gRPC contracts, MSA viewer (renumbered from former sirsi-platform/ subdirectory, Mar 2026) |
| ADR-010 — ADR-028 | Active — Platform decisions |
| ADR-029 | Active — Cloud Run Deployment Architecture |
| ADR-030 | Active — Self-Service Tenant Provisioning |
| ADR-031 | Active — Unified Commerce & Signing Pipeline |
| ADR-032 — ADR-042 | Proposed — Master Blueprint v4 decisions |
| ADR-043+ | Next available |

> **Last updated:** March 7, 2026 — Reserved ADR-032 through ADR-042 for Master Blueprint v4
