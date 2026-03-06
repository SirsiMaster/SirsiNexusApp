# Sirsi Portfolio Versioning Standard

**Status:** Active  
**Date:** March 6, 2026  
**Author:** Antigravity (The Agent)  
**Compliance:** GEMINI.md Rule 18 (Living Canon)

---

## 1. Three Versioning Scopes

The Sirsi ecosystem maintains **three independent versioning scopes**, each following Semantic Versioning ([semver.org](https://semver.org)):

| Scope | Format | Source of Truth | What Triggers a Bump |
|:---|:---|:---|:---|
| **Application** | `MAJOR.MINOR.PATCH-channel` | `packages/sirsi-portal-app/package.json` `"version"` | Code changes to the React app, Go backend, or infra |
| **Website** | Same version as Application | Deployed via CI/CD from the app build | Follows app — no independent version |
| **Documents** | `vX.Y.Z` in front matter | Each doc's own header/front matter | Content changes to canonical docs |

### 1.1 Application Versioning

```
MAJOR.MINOR.PATCH-channel

0.8.3-alpha
│ │ │   └─ Channel: alpha → beta → stable (rc for release candidates)
│ │ └──── PATCH: backwards-compatible fixes and polish
│ └────── MINOR: new features, pages, or integrations
└──────── MAJOR: breaking changes or architectural shifts
```

**Single source of truth**: `packages/sirsi-portal-app/package.json` → `"version"` field

**Propagation on every release**:
1. `package.json` → bump version
2. `VERSION` (root) → update to match
3. `docs/core/VERSION.md` → new entry at top
4. `docs/core/CHANGELOG.md` → new entry at top
5. `src/routes/changelog.tsx` → new release entry at top of array
6. Git tag: `git tag -a v0.8.3-alpha -m "description"`

### 1.2 Website Versioning

The website (`sirsi.ai`) is the React app. Its version **is** the app version. There is no separate website version. The version badge in the public header reads from `package.json` via `lib/version.ts`.

### 1.3 Document Versioning

Canonical documents (GEMINI.md, ADRs, style guides, policies) maintain their own version in their header/front matter:

```markdown
**Version:** 6.2.0 (CI/CD QA Gate Canon)
**Date:** March 5, 2026
```

Document versions are **independent** of the app version. A document is bumped when its content changes substantively:
- **PATCH** (6.2.0 → 6.2.1): Typo fixes, clarifications
- **MINOR** (6.2.0 → 6.3.0): New rules, sections, or policies added
- **MAJOR** (6.2.0 → 7.0.0): Structural reorganization or breaking rule changes

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

## 4. Files Updated on Every Release

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
