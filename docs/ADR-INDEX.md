# ADR Index (Architecture Decision Records)

This index tracks all significant architectural decisions for the SirsiNexusApp platform monorepo.

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-003](ADR-003-TANSTACK-MIGRATION.md) | Migration to TanStack Query v5 | Approved | 2025-07-12 |
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

## Categories

### Portfolio & Governance (NEW — Feb 27, 2026)
- ADR-017: CockroachDB Decommission — removed from all runtime, k8s, health checks
- ADR-019: Rust/WASM Decommission — Go confirmed as sole backend language
- ADR-020: Application Firewall — repo-scoped AI directives, design language firewalls

### Contract Execution & Signing
- ADR-014: Bipartite Dual-Signature Ceremony (Provider/Client Workflows)
- ADR-015: OpenSign Convergence — Dual-Client Architecture (gRPC + REST SDK)
- ADR-023: Contract Lifecycle (`DRAFT` → `FULLY_EXECUTED` → `COMPLETED` → `ARCHIVED`)
- ADR-023: Funding Sub-States (Unfunded / Partially Funded / Fully Funded)

### Platform Architecture
- ADR-021: Unified gRPC Gateway (Single Go service for Portal + Sign)
- ADR-013: Hierarchical URL Routing (`sign.sirsi.ai/vault/:user/:type/:entity/:docId`)
- ADR-011: Universal Component System (UCS) — Integrated Independence
- ADR-010: Repository Unification (Monorepo Strategy)
- ADR-018: Technical Stack Convergence (Stack V4 — Go, React, Firebase, Cloud SQL)

### Security & Authentication
- ADR-016: Canonical MFA Routing Hub & Session Persistence
- ADR-012: Live MFA Delivery Rails (SMS/Email via Firebase)

### Presentation
- ADR-024: Pitch Deck Visual Standard & Rubric
- ADR-022: Governance Console & Dynamic Catalog

## Note on ADR Numbering
ADRs 001-002 were legacy documents from the FinalWishes repo (formerly 111-Venture-Projects) and do not exist in SirsiNexusApp. ADRs 004-009 were never assigned in this repo. Active numbering begins at ADR-003.
