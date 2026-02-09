# ADR Index (Architecture Decision Records)

This index tracks all significant architectural decisions for the Sirsi ecosystem.

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](ADR-001-ARCHITECTURE-DECISIONS.md) | Core Platform Architecture | Legacy | TBD |
| [ADR-002](ADR-002-IMPLEMENTATION-PLAN.md) | Global Implementation Plan | Legacy | TBD |
| [ADR-003](ADR-003-TANSTACK-MIGRATION.md) | Migration to TanStack Query v5 | Approved | 2025-07-12 |
| [ADR-010](ADR-010-SIRSI-REPOSITORY-UNIFICATION.md) | Sirsi Repository Unification | Approved | 2025-07-28 |
| [ADR-011](ADR-011-UNIVERSAL-COMPONENT-SYSTEM.md) | Universal Component System (UCS) | Approved | 2026-01-29 |
| [ADR-012](ADR-012-LIVE-MFA-DELIVERY-RAILS.md) | Live MFA Delivery Rails (SMS/Email) | Approved | 2026-01-30 |
| [ADR-013](ADR-013-SIRSI-SIGN-HIERARCHY.md) | Sirsi Sign Unified Vault & Multi-Tenant Architecture | Proposed | 2026-02-06 |
| [ADR-014](ADR-014-BIPARTITE-CONTRACT-EXECUTION.md) | Bipartite Contract Execution Protocol | Accepted | 2026-02-07 |
| [ADR-015](ADR-015-UNIFIED-GRPC-CONVERGENCE.md) | Unified gRPC Convergence — Portal ↔ Sign Integration | Proposed | 2026-02-09 |

## Categories

### Contract Execution & Signing
- ADR-014: Bipartite Dual-Signature Ceremony (Provider/Client Workflows)
- ADR-014: Contract Status Lifecycle (`DRAFT` → `FULLY_EXECUTED`)
- ADR-014: SHA-256 Cryptographic Evidence Chain
- ADR-014: Countersign Gate & Status Guards

### Platform Architecture
- ADR-015: Unified gRPC Gateway (Single Go service for Portal + Sign)
- ADR-015: Proto Schema Convergence (admin.v2 + contracts.v2 + common.v1)
- ADR-015: Portal React Migration (Static HTML → React SPA on gRPC)
- ADR-015: TenantService & Cross-Service Data Integration
- ADR-013: Hierarchical URL Routing (`sign.sirsi.ai/vault/:user/:type/:entity/:docId`)
- ADR-013: Multi-Tenant Document Grouping
- ADR-011: Universal Component System (UCS) — Integrated Independence
- ADR-010: Repository Unification (Monorepo Strategy)

### Security & Authentication
- ADR-015 §8: Unified Firebase Auth Convergence (Shared Custom Claims + RBAC)
- ADR-012: Live MFA Delivery Rails (SMS/Email via Firebase)
- ADR-014 §5: Countersign Gate (Status-Based Access Control)

## Note on Legacy ADRs
ADRs 001-002 are legacy documents from the early crystallization phase and are maintained for historical context. Active development follows the **Prime Directives** in `GEMINI.md`.
