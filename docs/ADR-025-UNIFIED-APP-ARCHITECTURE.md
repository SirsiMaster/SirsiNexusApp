# ADR-025: Unified Sirsi Application Architecture

**Status:** Accepted  
**Date:** 2026-02-27  
**Deciders:** Cylton Collymore  
**Category:** Architecture  

## Context

The SirsiNexusApp repository contains 5 fragmented frontend implementations:

1. `ui/` — Premium Next.js app (archived, not deployed) with InfrastructureBuilder, CommandPalette, AI assistant
2. `packages/sirsi-portal/` — Static HTML landing page (live on Firebase)
3. `packages/sirsi-portal/sirsinexusportal/` — Embedded admin dashboard
4. `packages/sirsi-portal-app/` — Modern Vite+React 19 admin with gRPC
5. `packages/sirsi-sign/` — Signing/payment flows (Swiss Neo-Deco design)

These should be a single unified application delivered to three targets:
- **Web** (browser via Firebase Hosting)
- **macOS** (native desktop via Tauri)
- **Windows** (native desktop via Tauri)

## Decision

### 1. Landing Page: Visual Preservation + Typography Upgrade
- The static landing page (`packages/sirsi-portal/index.html`) retains its current layout and visual design
- Swiss Neo-Deco typography (Cinzel headings, Inter body) and quality elements from Sirsi Sign are blended in
- **The live page NEVER goes down** — all changes are staged locally or in a staging URL until verified
- Staging protocol: local dev → staging deploy → visual verification → production swap

### 2. Desktop Framework: Tauri
- **Tauri** (Rust-based) for native desktop packaging
- Produces: `.dmg`/`.app` (macOS), `.exe`/`.msi` (Windows)
- Same React codebase as the web app — Tauri wraps the same build
- Rust core enables native performance, small bundle size (~5MB vs Electron's ~150MB)

### 3. Sirsi Sign: Embedded Routes
- Signing flows are **embedded as routes** within the unified application, NOT a separate deployment
- Full contract lifecycle inside the app:
  - Create contracts from templates
  - Store, modify, issue contracts
  - Get contracts signed (via OpenSign)
  - Process payments (via Stripe SDK routes in Firebase)
- Product/catalog management inside the app, synced to Stripe environment
- **Goal: never leave Sirsi** — full native performance for all operations

### 4. Google Ecosystem: The "Sirsi Rail"
- All infrastructure runs on Google Cloud: Firebase, Firebase CLI, Vertex AI, Google AI Ultra
- Every feature, component, API, and route built for Sirsi is recorded in the UCS library
- Portfolio applications (FinalWishes, Assiduous, future apps) can:
  - **Replicate** components independently into their own apps
  - **Ride on the Sirsi Rail** — consume services directly via gRPC/API
- This creates a "Lego system" of integrations that work out-of-the-box

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Sirsi Rail (UCS)                    │
│  Components · Hooks · Auth · gRPC · Design Tokens    │
│           packages/sirsi-ui/                         │
├────────────────────┬─────────────────────────────────┤
│                    │                                 │
│   Sirsi App Core   │     Shared Services             │
│  (React 19 + Vite) │  ┌──────────┐ ┌─────────────┐  │
│                    │  │sirsi-auth│ │sirsi-sign   │  │
│  Routes:           │  │(Firebase)│ │(OpenSign)   │  │
│  · Dashboard       │  └──────────┘ └─────────────┘  │
│  · Contracts       │  ┌──────────┐ ┌─────────────┐  │
│  · Products/Catalog│  │  Stripe  │ │ Vertex AI   │  │
│  · Users/Tenants   │  │(Payments)│ │ (Guidance)  │  │
│  · Settings        │  └──────────┘ └─────────────┘  │
│  · Telemetry       │                                 │
│  · AI Assistant    │     Backend: sngp (Go+gRPC)     │
│                    │                                 │
├──────────┬─────────┴──────────┬──────────────────────┤
│  Web     │  macOS Desktop     │  Windows Desktop     │
│  (Vite)  │  (Tauri + Rust)    │  (Tauri + Rust)      │
│  Browser │  .dmg / .app       │  .exe / .msi         │
└──────────┴────────────────────┴──────────────────────┘
           │                    │
           └─── Swiss Neo-Deco ─┘
           (Emerald + Gold + Cinzel + Inter)

Portfolio Apps (FinalWishes, Assiduous, etc.)
  ├── Import UCS components (Lego blocks)
  ├── Consume Sirsi Rail services (gRPC/API)
  └── Override design tokens (Royal Blue, etc.)
```

## Consequences

### Positive
- Single codebase for web + desktop = reduced maintenance
- Tauri's Rust core provides near-native performance
- "Lego system" accelerates portfolio app development
- Swiss Neo-Deco consistency across all surfaces
- Never leaving Sirsi for core operations (sign, pay, manage)

### Negative
- Convergence of 5 frontends requires careful migration
- Tauri has a smaller ecosystem than Electron
- Must maintain visual parity across 3 delivery targets

### Risks
- Landing page must never go down during migration (mitigated by staging protocol)
- Premium components from `ui/` may need modernization (React 18 → 19)
- OpenSign and Stripe integrations need testing in Tauri's webview

## Implementation Phases

See `CONVERGENCE_PLAN.md` for detailed sprint breakdown.
