# ADR-010: Sirsi Repository Unification

## Status
Proposed

## Context
The Sirsi ecosystem has grown into multiple isolated repositories:
- `SirsiNexusApp`: Core engine and primary UI.
- `sirsi-opensign`: E-signature service and integration.
- `sirsi-ui`: Shared UI component library.
- `sirsi-pitch-deck`: Presentation and marketing assets.

Maintaining multiple repositories introduces fragmentation, documentation drift, and deployment complexity. Specifically, cross-repo dependencies (like `sirsi-ui`) are difficult to manage without a unified monorepo structure.

## Decision
We will unify ALL `sirsi-XXX` repositories into the **SirsiNexusApp** repository. SirsiNexusApp will serve as the **Single Source of Truth (SSoT)** for the entire Sirsi ecosystem.

### Architectural Changes
1.  **Monorepo Adoption**: SirsiNexusApp will adopt a monorepo structure using a `packages/` directory for discrete services and libraries.
2.  **Service Migration**:
    - `sirsi-ui` moves to `packages/sirsi-ui`.
    - `sirsi-opensign` moves to `packages/sirsi-opensign`.
3.  **Documentation Consolidation**:
    - `sirsi-pitch-deck` moves to `docs/pitch-deck`.
4.  **Policy Update**: `GEMINI.md` will be updated to mandate a Single Repo policy.

## Consequences
- **Positive**: Simplified dependency management, atomic commits across services, unified documentation, and consistent CI/CD.
- **Negative**: Increased repository size and build times (mitigated by selective builds).
- **Neutral**: Developers must adapt to working within a single large repository.
