# ADR-027: React Portal Migration — HTML-to-React Admin Console

**Status**: Accepted  
**Date**: 2026-03-03  
**Deciders**: Lead Architect, Antigravity (Agent)  
**Supersedes**: N/A  
**Related**: ADR-025 (Unified App Architecture), ADR-018 (Technical Stack Convergence), ADR-026 (Hypervisor Command Protocol)

---

## Context

The Sirsi Admin Portal (`packages/sirsi-portal/admin/`) was built as a collection of static HTML files with shared Web Components (`admin-header.js`, `admin-sidebar.js`) and vanilla CSS (`common-styles.css`). While this approach enabled rapid prototyping and established the Swiss Neo-Deco design language, it created scaling limitations:

1. **No shared state** — each page is a full HTTP reload, no client-side routing
2. **No component reuse** — HTML copy/paste for repeated patterns (stat cards, tables, badges)
3. **No type safety** — no compile-time checks for data shapes
4. **No code splitting** — every page loads all assets
5. **No live data pipeline** — static mock data, no ConnectRPC integration path
6. **Manual dark mode** — CSS-only, no persistent toggle or system preference detection

ADR-025 established React 19 + Vite + TanStack Router as the target. ADR-018 confirmed Go + React as the converged stack. This ADR documents the **execution** of that migration.

## Decision

Migrate the HTML admin portal to a React 19 SPA (`packages/sirsi-portal-app/`) using a 4-phase approach, with the HTML files as the immutable source of truth per Rule 22.

### Migration Methodology

1. **HTML is the blueprint** — every React page must achieve pixel-perfect parity with its HTML counterpart before extending functionality
2. **CSS classes are canonical** — all layout classes (`sidebar-content`, `content-wrapper`, `sirsi-card`, `sirsi-table`) are ported to `index.css` with identical selectors
3. **Dark mode is additive** — `.dark` class variants are added as a new layer, not replacing light mode
4. **Code splitting is automatic** — `React.lazy()` + `Suspense` applied to all non-dashboard routes

### Technology Choices

| Concern | Choice | Rationale |
|:--------|:-------|:----------|
| **Framework** | React 19 + Vite 7 | ADR-025, ADR-018 alignment |
| **Router** | TanStack Router v1 | Type-safe routes, code splitting support |
| **UI Components** | shadcn/ui + Tailwind | ADR-025 mandate, canonical component library |
| **Charts** | Recharts | Already used in HTML portal, React-native library |
| **Icons** | Lucide React | Consistent with shadcn/ui ecosystem |
| **State** | React useState/useEffect | Sufficient for current scope; Zustand reserved for Phase 5+ |

## Phases Executed

### Phase 1 — Core Route Porting (5 routes)
- Dashboard, Security, Site Admin, Portal, Telemetry, System Logs
- Established root layout (`__root.tsx`) with header + sidebar + content wrapper
- All CSS classes from `common-styles.css` ported to `index.css`

### Phase 2 — Extended Routes (6 routes)
- Analytics, KPI Metrics, Committee, Messaging, Monitoring, Console
- Recharts integration for chart-heavy pages

### Phase 3 — System Status Pages (9 routes)
- Cache Status, API Server, Database Health, Backup Status
- Contracts, Data Room, AI Agents, Hypervisor, Users, Settings

### Phase 5 — React as Primary Platform (v0.8.0-alpha+)
- React app (`sirsi-portal-app`) becomes the **sole delivery platform**
- HTML admin portal (`sirsi-portal/admin/`) archived as historical reference only
- **Rule 22 superseded**: React no longer mirrors HTML — React IS the source of truth
- Universal theme toggle (single `<html class="dark">` — no per-page toggles)
- All text globally justified (`text-align: justify` on body)
- Centralized version badge in both public + admin headers (from `package.json`)
- Changelog page (`/changelog`) with full release timeline

#### Phase 5 Migration Scope
- All 37 routes confirmed as React-only
- No remaining HTML pages in production delivery
- Public pages (landing, about, blog, pricing, privacy, terms, changelog, login, signup, documentation) use PublicLayout (no sidebar)
- Portal pages use AdminLayout (sidebar + header + content-wrapper)

## Consequences

### Positive
- **37 routes** fully ported with functional parity
- **Single codebase** — no dual maintenance between HTML and React
- **Dark mode** with system preference detection and persistence
- **Type safety** across all components (zero `tsc` errors)
- **Component reuse** — `KpiCard`, `TenantCluster`, `StatCard` shared across pages
- **Centralized version** — `lib/version.ts` reads from `package.json`

### Negative
- **Mock data** — most pages use hardcoded data until ConnectRPC integration (Phase 6)

### Neutral
- HTML portal remains in repo as historical reference and design documentation

## Key Lessons

1. **CSS Specificity with shadcn/ui**: The `sirsi-card` class (from `index.css`) has `background: white` which overrides Tailwind `bg-*` classes. Fix: use inline `style.background` for cards requiring custom backgrounds.
2. **Recharts + React 19 Types**: Type conflicts resolved by dependency updates; no manual `@ts-ignore` needed.
3. **Dark Mode FOUC**: Initialize theme from `localStorage` in the state initializer, not in a `useEffect`, to avoid flash of unstyled content.
4. **Theme Toggle Must Be Universal**: A single `document.documentElement.classList.toggle('dark')` controls all pages. No per-page, per-component, or per-section theme toggles.

## Commit History

| Hash | Type | Message |
|:-----|:-----|:--------|
| `3b6ca22` | feat | Complete admin portal setup with connect v2 |
| `59e34f4` | style | Rebrand admin portal to Sirsi Green and Gold |
| `749319d` | feat | Technical Stack Convergence Phase 1 |
| `0b862d9` | feat | Phase 2: Port premium components |
| `1905dfd` | fix | React dedupe in monorepo |
| `31d4f42` | feat | Phase 1: pixel-perfect parity for 5 routes |
| `870d3a5` | feat | Phase 2: 6 remaining investor/intelligence routes |
| `3c2a8cb` | feat | Phase 3: system-status and dashboard sub-pages |
| `9bcd4d9` | feat | Register all 25 routes in router + sidebar |
| `4d576d5` | chore | Infrastructure updates, deps, ADR-026 |
| `2bb42e9` | fix | Fix blank strategic module cards on Portal |
| `48cd5dc` | perf | Code splitting — lazy-load 24 routes |
| `be3afe5` | fix | Dark mode persistence across reloads |
| `c3f995d` | feat | Phase 5.0: Version badge, public pages, changelog, justify |

## References

- ADR-025: Unified App Architecture
- ADR-018: Technical Stack Convergence
- ADR-026: Hypervisor Command Protocol
- `packages/sirsi-portal/admin/` — HTML historical reference (archived)
- `packages/sirsi-portal-app/` — React primary platform
- `docs/SWISS_NEO_DECO_STYLE_GUIDE.md` — Design language specification
