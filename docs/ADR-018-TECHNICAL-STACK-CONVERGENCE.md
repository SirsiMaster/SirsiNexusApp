# ADR-017: Technical Stack Convergence (Stack V4)

## Status
Proposed -> Approved

## Context
The Sirsi Nexus platform has historically operated on a fragmented architecture:
- **Backend**: Rust (`core-engine`) for logic + Firebase Functions for auth/security.
- **Frontend**: Static HTML (`sirsi-portal`) + Next.js (`ui`).
- **Communication**: Diverse (REST, direct Firestore, gRPC).

To achieve "Absolute Convergence" and follow the **Stack V4 Absolute Truth** (Rule 3), we are consolidating the entire platform.

## Decision
1. **Unified Backend**: All core logic migrated to **Go (Golang)** in `packages/sirsi-admin-service`. 
   - **Protocol**: ConnectRPC/gRPC-Web.
   - **Auth**: Firebase Admin Go SDK.
2. **Unified Frontend**: All dashboards and portals migrated to **React 18+ (React 19)** + **Vite** in `packages/sirsi-portal-app`.
   - **Router**: TanStack Router.
   - **State**: TanStack Query (Server) + Zustand (Local).
   - **Styling**: TailwindCSS (Emerald Green / Royal Neo-Deco).
3. **AI Integration**: Transition orchestration to **Gemini 3.0 (Vertex AI)**.
4. **Bipartite MFA**: Enforcement of MFA at the Router level (TanStack Router `beforeLoad` checks).

## Execution Roadmap

### Phase 1: Database & Persistence Convergence (Current)
* **Goal**: Replace mock handlers with real persistence.
* **Actions**: Implement Postgres for PII/Contracts and Firestore for real-time telemetry.

### Phase 2: High-Fidelity Dashboard Porting
* **Goal**: Achieve 1:1 visual parity with legacy HTML assets.
* **Actions**: Convert Advanced Analytics, System Telemetry, and Security Logs to React components.

### Phase 3: AI & Guidance Engine Rollout
* **Goal**: Transition AI orchestration to Go using Gemini 3.0 (Vertex AI).
* **Actions**: Implement real-time server-side telemetry analysis and guidance prompts.

### Phase 4: Decommissioning & Legacy Purge
* **Goal**: Remove all technical debt.
* **Actions**: Permanent deletion of `core-engine/` and legacy static HTML portals after UAT.

## Verification
- gRPC-Web calls verified via DevTools.
- Deployment via `firebase-nexus-live` successful.
- "Command Center" dashboard serving live data from Go backend.
