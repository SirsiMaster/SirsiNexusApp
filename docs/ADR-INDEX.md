# ADR Index (Architecture Decision Records)

This index tracks **all** architectural decisions for the SirsiNexusApp platform monorepo.

**Total ADRs: 23** (20 root + 3 Sirsi Platform)

---

## Master Registry

| ID | Title | Status | Date | File |
|----|-------|--------|------|------|
| [ADR-003](ADR-003-TANSTACK-MIGRATION.md) | Migration to TanStack Query v5 | Approved | 2025-07-12 | `docs/` |
| [SP-003](sirsi-platform/ADR-003-HMAC-SECURITY-LAYER.md) | HMAC-Based Security Layer for Multi-Tenant Vault | Accepted | 2025-12-31 | `docs/sirsi-platform/` |
| [SP-004](sirsi-platform/ADR-004-CONTRACTS-GRPC-SERVICE.md) | Contracts gRPC Service | Accepted | 2025-12-31 | `docs/sirsi-platform/` |
| [SP-005](sirsi-platform/ADR-005-PRINTABLE-MSA-VIEWER.md) | Printable MSA Viewer Component | Accepted | 2026-01-21 | `docs/sirsi-platform/` |
| [ADR-010](ADR-010-SIRSI-REPOSITORY-UNIFICATION.md) | Sirsi Repository Unification | Approved | 2025-07-28 | `docs/` |
| [ADR-011](ADR-011-UNIVERSAL-COMPONENT-SYSTEM.md) | Universal Component System (UCS) | Approved | 2026-01-29 | `docs/` |
| [ADR-012](ADR-012-LIVE-MFA-DELIVERY-RAILS.md) | Live MFA Delivery Rails (SMS/Email) | Approved | 2026-01-30 | `docs/` |
| [ADR-013](ADR-013-SIRSI-SIGN-HIERARCHY.md) | Hierarchical Routing & Multi-Tenant Differentiation | Accepted | 2026-02-10 | `docs/` |
| [ADR-014](ADR-014-BIPARTITE-CONTRACT-EXECUTION.md) | Bipartite Contract Execution Protocol | Accepted | 2026-02-07 | `docs/` |
| [ADR-015](ADR-015-OPENSIGN-CONVERGENCE.md) | OpenSign Convergence — Dual-Client Architecture | Accepted | 2026-02-09 | `docs/` |
| [ADR-016](ADR-016-CANONICAL-MFA-ROUTING-HUB.md) | Canonical MFA Routing Hub & Session Persistence | Accepted | 2026-02-12 | `docs/` |
| [ADR-017](ADR-017-COCKROACHDB-DECOMMISSION.md) | CockroachDB Decommission | Accepted | 2026-02-27 | `docs/` |
| [ADR-018](ADR-018-TECHNICAL-STACK-CONVERGENCE.md) | Technical Stack Convergence (Stack V4) | Approved | 2026-02-18 | `docs/` |
| [ADR-019](ADR-019-RUST-DECOMMISSION.md) | Rust/WASM Decommission — Go-Only Stack | Accepted | 2026-02-27 | `docs/` |
| [ADR-020](ADR-020-APPLICATION-FIREWALL.md) | Portfolio Application Firewall | Accepted | 2026-02-27 | `docs/` |
| [ADR-021](ADR-021-UNIFIED-GRPC-CONVERGENCE.md) | Unified gRPC Convergence — Portal ↔ Sign Integration | Proposed | 2026-02-09 | `docs/` |
| [ADR-022](ADR-022-GOVERNANCE-CONSOLE.md) | Sirsi Governance Console & Dynamic Catalog | Proposed | 2026-02-12 | `docs/` |
| [ADR-023](ADR-023-CONTRACT-LIFECYCLE.md) | Contract Lifecycle & Funding Status | Accepted | 2026-02-13 | `docs/` |
| [ADR-024](ADR-024-PITCH-DECK-VISUAL-STANDARD.md) | Pitch Deck Visual Standard & Rubric | Accepted | 2026-02-20 | `docs/` |
| [ADR-025](ADR-025-UNIFIED-APP-ARCHITECTURE.md) | Unified App Architecture — Web + Desktop (Tauri) | Accepted | 2026-02-27 | `docs/` |
| [ADR-026](ADR-026-HYPERVISOR-COMMAND-PROTOCOL.md) | Hypervisor Command Protocol — Operational Telemetry via gRPC | Accepted | 2026-03-02 | `docs/` |
| [ADR-027](ADR-027-REACT-PORTAL-MIGRATION.md) | React Portal Migration — HTML-to-React Admin Console | Accepted | 2026-03-03 | `docs/` |
| [ADR-028](ADR-028-PROTO-VERSIONING-ALIGNMENT.md) | Proto/gRPC Versioning Alignment — v2 Canonical | Accepted | 2026-03-03 | `docs/` |

---

## Categories

### Sirsi Platform (Sirsi Sign Service — `docs/sirsi-platform/`)
- SP-003: HMAC-Based Security Layer — MITM/replay protection for vault redirect flows
- SP-004: Contracts gRPC Service — gRPC contract CRUD and execution backend
- SP-005: Printable MSA Viewer — Full-fidelity legal document rendering component

### Portfolio & Governance
- ADR-017: CockroachDB Decommission — removed from all runtime, k8s, health checks
- ADR-019: Rust/WASM Decommission — Go confirmed as sole backend language
- ADR-020: Application Firewall — repo-scoped AI directives, design language firewalls
- ADR-025: Unified App Architecture — Single React codebase, Tauri desktop, Sirsi Rail UCS

### React Migration & Frontend Architecture
- ADR-027: React Portal Migration — 25 routes ported, code splitting, dark mode, responsive sidebar
- ADR-025: Unified App Architecture — Single React codebase, Tauri desktop, Sirsi Rail UCS
- ADR-003: Migration to TanStack Query v5
- ADR-018: Technical Stack Convergence (Stack V4 — Go, React, Firebase, Cloud SQL)

### Contract Execution & Signing
- ADR-014: Bipartite Dual-Signature Ceremony (Provider/Client Workflows)
- ADR-015: OpenSign Convergence — Dual-Client Architecture (gRPC + REST SDK)
- ADR-023: Contract Lifecycle (`DRAFT` → `FULLY_EXECUTED` → `COMPLETED` → `ARCHIVED`)
- SP-004: Contracts gRPC Service (backend implementation)
- SP-005: Printable MSA Viewer (legal document rendering)

### Platform Architecture
- ADR-028: Proto/gRPC Versioning Alignment — v2 canonical, v1 retired, single `/proto/` source of truth
- ADR-026: Hypervisor Command Protocol — Operational Telemetry via gRPC
- ADR-021: Unified gRPC Gateway (Single Go service for Portal + Sign)
- ADR-013: Hierarchical URL Routing (`sign.sirsi.ai/vault/:user/:type/:entity/:docId`)
- ADR-011: Universal Component System (UCS) — Integrated Independence
- ADR-010: Repository Unification (Monorepo Strategy)
- ADR-018: Technical Stack Convergence (Stack V4 — Go, React, Firebase, Cloud SQL)

### Security & Authentication
- ADR-016: Canonical MFA Routing Hub & Session Persistence
- ADR-012: Live MFA Delivery Rails (SMS/Email via Firebase)
- SP-003: HMAC Security Layer — vault redirect protection

### Presentation
- ADR-024: Pitch Deck Visual Standard & Rubric
- ADR-022: Governance Console & Dynamic Catalog

---

## ADR Numbering Convention

| Range | Scope | Notes |
|:------|:------|:------|
| ADR-001, ADR-002 | Legacy (FinalWishes) | From original `111-Venture-Projects` repo; not in SirsiNexusApp |
| ADR-003 | Root | First active ADR in this repo |
| SP-003 — SP-005 | Sirsi Platform | Sirsi Sign service-specific decisions; `SP-` prefix disambiguates from root ADRs |
| ADR-004 — ADR-009 | Never assigned | Gap in root numbering (Sirsi Sign used 003-005 independently before consolidation) |
| ADR-010 — ADR-028 | Root | Active platform ADRs (current) |
| ADR-029+ | Reserved | Next available for new decisions |

> **Last updated:** March 3, 2026 — Audit aligned all 23 ADRs (ADR-028)
