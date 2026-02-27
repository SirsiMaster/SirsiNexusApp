# ADR-020: Portfolio Application Firewall

## Status
**Accepted** — February 27, 2026

## Context
During a portfolio cleanup audit, we discovered a **cross-pollination problem**: the `GEMINI.md` in SirsiNexusApp contained directives that only belonged to specific tenant applications. AI agents (Antigravity/Gemini, Claude, Warp) were treating all portfolio directives as universal truth, causing:

1. **Design bleed**: Royal Neo-Deco styles (FinalWishes) appearing in SirsiNexusApp work (should be Swiss Financial)
2. **Stack confusion**: Dead technologies (Rust, Hedera, CockroachDB) listed as canonical
3. **Rule pollution**: Business rules from FinalWishes (pricing, launch scope) enforced across all repos

Additionally, the `111-Venture-Projects` governance repo was a vestige of the original development studio structure. FinalWishes had no standalone repository — its code was embedded inside `SirsiNexusApp/packages/sirsi-sign/` as tenant-specific data.

## Decision
Implement a strict **Application Firewall** architecture:

### 1. Repository Independence
Each repo has its own `GEMINI.md` (and equivalent AI config files) containing ONLY:
- **Universal rules** (§1): Identical across all repos — coding standards, pipeline protocol, sprint governance
- **Repo-specific rules** (§2+): Design language, tech stack details, business logic, canonical documents

### 2. Repo Restructure
| Before | After |
| :--- | :--- |
| `111-Venture-Projects` (GitHub repo) | **Renamed to `FinalWishes`** |
| FinalWishes code in `SirsiNexusApp/packages/sirsi-sign/` | Sirsi Sign is a **shared service**; FinalWishes is a **separate repo** |
| Single GEMINI.md for all portfolio context | Each repo has its own scoped GEMINI.md |

### 3. Design Language Firewall
| Application | Design Language | Boundary |
| :--- | :--- | :--- |
| SirsiNexusApp (Portal) | Swiss Financial | NEVER apply Royal Neo-Deco or Assiduous Modern |
| FinalWishes | Royal Neo-Deco | NEVER apply Swiss Financial or Assiduous Modern |
| Assiduous | Assiduous Modern | NEVER apply Royal Neo-Deco or Swiss Financial |

### 4. Shared Services Architecture
Sirsi Sign, UCS, and auth modules remain in SirsiNexusApp as shared infrastructure. Tenant apps consume these via:
- **gRPC/API calls** for Sirsi Sign workflows
- **Component checkout** from UCS for UI elements
- **Per-repo Firebase configuration** for auth/hosting

## Alternatives Considered
1. **Monorepo for all apps**: Rejected — design and business logic bleed is the core problem
2. **Separate config per package in monorepo**: Considered — but repo-level separation is cleaner for AI agents
3. **Central PORTFOLIO_RULES.md**: Rejected — agents can't reliably distinguish portfolio vs. repo context

## Consequences
- **Positive**: AI agents receive only relevant context per repo
- **Positive**: No more design bleed across applications
- **Positive**: Each repo is independently deployable and auditable
- **Positive**: Universal rules are synchronized (§1 in each GEMINI.md)
- **Negative**: Universal rule changes must be updated in multiple repos
- **Mitigation**: The universal rules section is small (~16 rules) and changes rarely

## References
- ADR-017: CockroachDB Decommission
- ADR-019: Rust/WASM Decommission
- GEMINI.md §0: Identity (updated to include portfolio architecture map)
