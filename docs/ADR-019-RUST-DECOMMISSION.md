# ADR-019: Rust/WASM Decommission

> **⚠️ PARTIAL SUPERSESSION (March 7, 2026):** This ADR decommissioned Rust/WASM for **in-browser and backend server** usage. That decision stands — Go remains the sole backend language. However, as of **Master Blueprint v4 (ADR-032)**, Rust is **RE-ADOPTED** for native platform clients:
> - **Tauri 2.x desktop app** (`packages/sirsi-desktop/`)
> - **Headless daemon** (`packages/sirsi-headless/`) for data center CLI/API deployment
> - **Mac Studio cluster coordinator** (`packages/sirsi-cluster/`) for sovereign compute
>
> Rust is used for **native compilation targets only** — not WASM, not backend servers. The Go + gRPC backend is unchanged.

## Status
**Accepted** — February 27, 2026 *(partially superseded by ADR-032, March 7, 2026)*

## Context
The SirsiNexusApp monorepo contained a Rust-based `core-engine/` directory (v0.7.6-alpha) that was part of an earlier architecture vision. This engine was intended to provide:

- WASM runtime for dynamic agent loading
- Cryptographic primitives (SHA-256, AES-GCM)
- Kubernetes orchestration via k8s-openapi
- Multi-cloud SDK integration (AWS, Azure, GCP)
- CockroachDB connectivity via sqlx
- Hedera DLT integration
- Redis agent context storage
- Qdrant vector database for AI workloads

**None of these capabilities were operationalized in production.** All production workloads run on:
- **Go** (Cloud Run gRPC services)
- **TypeScript** (Firebase Cloud Functions for Assiduous)
- **React/Vite** (all web frontends)

The Rust build artifacts (`target/`) consumed **11GB** of disk space. The core-engine source was **2.3MB**. Several dependencies referenced decommissioned services (CockroachDB — see ADR-017, AWS SDKs — all apps use GCP).

## Decision
**Remove all Rust code and tooling from SirsiNexusApp.** The canonical backend language for the Sirsi portfolio is **Go**.

### Removed
- `core-engine/` — Rust source directory (2.3MB)
- `Cargo.toml` — Workspace manifest
- `Cargo.lock` — Dependency lockfile (190KB)
- `hypervisor.rs` — Orphaned Rust file at repo root (18.5KB)
- `target/` — Build artifacts (11GB)

### Stack Update
The technology stack table in SIRSI_RULES.md §3 has been updated to remove the "Rust (WASM)" and "Hedera (HCS)" rows, with a note referencing this ADR.

## Alternatives Considered
1. **Keep Rust for desktop apps (Tauri)**: Rejected — Electron uses the same JS/TS stack as web, avoiding a second language. If desktop is needed, Go CLI + web UI is preferred.
2. **Keep Rust for cryptographic primitives**: Rejected — Go's `crypto` standard library provides SHA-256, AES-256, and all required primitives with FIPS-validated implementations.
3. **Keep Rust for performance-critical paths**: Rejected — no identified path requires Rust-level performance. Go's performance is sufficient for all current and planned workloads.

## Consequences
- **Positive**: ~13.5GB disk savings (11GB target + 2.5GB Homebrew rust/llvm)
- **Positive**: Simplified build pipeline — no Rust toolchain required
- **Positive**: Reduced cognitive load — one backend language (Go) instead of two
- **Positive**: Eliminates dead dependency references (CockroachDB, AWS SDKs, Hedera)
- **Negative**: If Rust is ever needed again, the code exists in Git history
- **Risk**: None — no production code references core-engine

## References
- ADR-017: CockroachDB Decommission
- SIRSI_RULES.md §3: Technology Stack
