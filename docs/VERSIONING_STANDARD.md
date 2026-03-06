# Sirsi Portfolio Versioning Standard

**Status:** Active  
**Date:** March 6, 2026  
**Author:** Antigravity (The Agent)  
**Compliance:** SIRSI_RULES.md Rule 18 (Living Canon)

---

## 1. Versioning Scopes

The Sirsi ecosystem maintains **four independent versioning scopes**, each following Semantic Versioning ([semver.org](https://semver.org)):

| Scope | Format | Source of Truth | Current | What It Tracks |
|:---|:---|:---|:---|:---|
| **Portal / Web** | `MAJOR.MINOR.PATCH-channel` | `packages/sirsi-portal-app/package.json` | `0.8.3-alpha` | React admin portal, public website (sirsi.ai), all UI routes |
| **Platform Backend** | `MAJOR.MINOR.PATCH-channel` | `packages/sirsi-admin-service/version.go` | TBD (not yet provisioned) | Go ConnectRPC services, Cloud Run, provisioning engine, tenant API |
| **Documents** | `vX.Y` in front matter | Each document's own header | Per-document | ADRs, SIRSI_RULES.md, style guides, policies |
| **Pitch Deck** | `vX.Y` | `docs/pitch-deck/CHANGELOG.md` | Independent | Slide content, investor materials |

> **Key distinction**: The Portal/Web version tracks the **React application** deployed to `sirsi.ai`. The Platform Backend version tracks the **Go services** deployed to Cloud Run. They are **independent** — a pricing page rewrite bumps Portal, not Platform.

### 1.1 Portal / Web Versioning

```
MAJOR.MINOR.PATCH-channel

0.8.3-alpha
│ │ │   └─ Channel: alpha → beta → stable (rc for release candidates)
│ │ └──── PATCH: backwards-compatible fixes and polish
│ └────── MINOR: new features, pages, or integrations
└──────── MAJOR: breaking changes or architectural shifts
```

**Single source of truth**: `packages/sirsi-portal-app/package.json` → `"version"` field

This version is what the version badge in the header displays. It covers:
- All React routes (admin dashboard, public pages, portals)
- CSS/design system changes
- Client-facing UI behavior

### 1.2 Platform Backend Versioning

```
MAJOR.MINOR.PATCH-channel

(Not yet versioned — to be established when TenantService ships)
```

**Source of truth**: `packages/sirsi-admin-service/version.go` (to be created)

This version tracks:
- Go ConnectRPC services (HypervisorService, TenantService, etc.)
- Cloud Run deployments
- Proto/gRPC schema changes
- Backend API surface

The Platform Backend version is bumped independently of the Portal. A new gRPC endpoint doesn't necessarily bump the Portal version, and a new UI page doesn't bump the Backend.

### 1.3 Document Versioning (Universal — All Portfolio Repos)

Every canonical document (SIRSI_RULES.md, style guides, policies, design guides) across **every Sirsi portfolio repo** uses the same versioning semantics:

```markdown
**Version:** 6.3.0 (Commerce & Versioning Canon)
**Date:** March 6, 2026
```

| Segment | Meaning | When to Bump |
|:---|:---|:---|
| **MAJOR** | The document has been fundamentally restructured — new section layout, removed categories, rewritten scope, or a new architectural era that changes the document's purpose. | Rare. A full rewrite or era transition. |
| **MINOR** | New content has been added that expands the document's coverage — new rules, new sections, new policies, new registered items. The existing structure is preserved. | Every time you add a rule, register a new ADR, or add a new section. |
| **PATCH** | Corrections, clarifications, or rewording of existing content with **no policy change**. The document says the same thing, just more clearly. | Typo fixes, grammar, rewording for clarity. |

**Example — SIRSI_RULES.md history:**
| Version | Change | Why This Segment |
|:---|:---|:---|
| 6.0.0 → 6.1.0 | Added Rules 20, 21, 22 | MINOR — new rules added |
| 6.1.0 → 6.2.0 | Added Rule 24 (CI/CD QA Gate) | MINOR — new rule added |
| 6.2.0 → 6.3.0 | Added Rule 25, registered ADR-030 + VERSIONING_STANDARD | MINOR — new rule + new items |
| 6.3.0 → 7.0.0 | Would require: full document restructure | MAJOR — only on rewrite |

> **This definition applies identically to**: `SIRSI_RULES.md` (every repo), `SWISS_NEO_DECO_STYLE_GUIDE.md`, `SECURITY_COMPLIANCE.md`, all policy documents, and any other versioned canonical document across SirsiNexusApp, FinalWishes, Assiduous, and all future tenant repos.

**ADR versioning**: ADRs use their **number** (ADR-030) and **status** (Draft → Proposed → Accepted → Deprecated) as their identity — not semver. Material revisions to an accepted ADR are tracked with a dated revision note in the ADR body.

### 1.4 Pitch Deck Versioning

Tracked in `docs/pitch-deck/CHANGELOG.md`. Independent of all other scopes. Uses the same MAJOR/MINOR/PATCH semantics defined above.

---

## 2. Release Channels

| Channel | Meaning | Quality Gate |
|:---|:---|:---|
| `alpha` | Active development, features may be incomplete | Build passes, manual QA |
| `beta` | Feature-complete, in stabilization | Build passes, CI/CD QA gate (Rule 24), staged deploy |
| `rc` | Release candidate, final testing | Full QA gate + live verification |
| `stable` | Production release | All gates passed, live HTTP 200 verified |

The project is currently in `alpha` channel. Transition to `beta` requires:
- All core features operational (not "Coming Soon")
- CI/CD pipeline fully automated
- Zero critical security vulnerabilities

---

## 3. Version Bump Rules

| Change Type | Examples | Bump |
|:---|:---|:---|
| New page, feature, or integration | ADR-030, pricing page rewrite, onboarding wizard | MINOR |
| Bug fix, dark mode fix, text change | Routing collision fix, versioned docs for Solo | PATCH |
| ADR addition (without code) | Architecture document only | PATCH |
| Design system change | New component, token change | MINOR |
| Breaking API change | Proto schema change, route rename | MAJOR |
| Infrastructure change | New Cloud Run service, Firebase config | MINOR |

---

## 4. Portal/Web Release Protocol

On every Portal/Web version bump, update these files:

| File | Update |
|:---|:---|
| `packages/sirsi-portal-app/package.json` | `"version": "X.Y.Z-channel"` |
| `VERSION` (root) | `X.Y.Z-channel` |
| `docs/core/VERSION.md` | New version entry at top (under Current Version) |
| `docs/core/CHANGELOG.md` | New changelog entry at top |
| `packages/sirsi-portal-app/src/routes/changelog.tsx` | New release in `releases[]` array |
| Git tag | `git tag -a vX.Y.Z-channel -m "description"` |

---

## 5. Canonical Locations

```
SirsiNexusApp/
├── VERSION                          # Machine-readable current version
├── packages/sirsi-portal-app/
│   └── package.json                 # Source of truth for app version
├── docs/core/
│   ├── VERSION.md                   # Human-readable version history (synoptic ledger)
│   └── CHANGELOG.md                 # Detailed changelog (Keep a Changelog format)
└── packages/sirsi-portal-app/src/
    ├── lib/version.ts               # Version constant (reads from package.json at build time)
    └── routes/changelog.tsx          # Public changelog page (curated highlights)
```

---

**Signed,**
**Antigravity (The Agent)**
