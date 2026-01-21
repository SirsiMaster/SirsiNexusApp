# ADR-003: TanStack Migration - Replacing Next.js with TanStack Start

**Status:** Approved  
**Date:** 2026-01-20  
**Author:** Antigravity (AI Agent) / Cylton Collymore  
**Decision Makers:** 111 Venture Studio Engineering

---

## Context

The current SirsiNexus monorepo uses **Next.js** as the primary web framework in the `ui/` package. This decision was made early in development but has become problematic due to:

1. **Security Vulnerabilities**: Next.js and its ecosystem (@next/eslint-plugin-next, eslint-config-next, @storybook/nextjs) contribute ~50+ of the 120 GitHub-reported vulnerabilities
2. **Architecture Mismatch**: Next.js is optimized for server-side rendering, but our architecture is **gRPC-first** with Go backends
3. **REST API Coupling**: Next.js API routes encourage REST patterns, conflicting with our gRPC + Protobuf mandate
4. **Complexity**: Next.js abstractions add unnecessary complexity for our SPA-focused applications

## Decision

**Replace Next.js with TanStack Start** across all web applications.

### Technology Stack V5

| Layer | Current | Target |
|-------|---------|--------|
| **Web Framework** | Next.js 15 | TanStack Start + TanStack Router |
| **Data Fetching** | REST/Axios | gRPC-Web + TanStack Query |
| **State** | Redux Toolkit | Zustand (already in use) |
| **Real-time** | Socket.io | WebSockets + gRPC Streaming |
| **Build** | Next.js bundler | Vite |

### Why TanStack Start?

1. **Type-Safe Routing**: First-class TypeScript, file-based routing similar to Next.js
2. **Framework Agnostic**: Works with any backend (perfect for gRPC)
3. **No SSR Lock-in**: Optional SSR, defaults to CSR which matches our SPA architecture
4. **TanStack Query Integration**: Native support for our data-fetching patterns
5. **Smaller Bundle**: No framework overhead from unused Next.js features
6. **Active Maintenance**: Maintained by Tanner Linsley (industry leader)

## Migration Plan

### Phase 1: Foundation (Contracts App - Current)
- ✅ `packages/finalwishes-contracts` already uses Vite + React (NOT Next.js)
- ✅ Can serve as migration template

### Phase 2: Component Library Extraction
- Extract reusable components from `ui/` to `packages/sirsi-ui`
- Ensure components are framework-agnostic (no Next.js dependencies)

### Phase 3: New Applications in TanStack
- All new apps (sign.sirsi.ai Vault, etc.) use TanStack Start
- Existing apps remain on Next.js until deprecated

### Phase 4: Full Migration
- Port `ui/` (sirsi.ai landing) to TanStack Start
- Remove Next.js dependencies entirely
- Close ~50+ security vulnerabilities automatically

## Consequences

### Positive
- Eliminates 50+ npm vulnerabilities
- Aligns with gRPC-first architecture
- Faster builds (Vite vs Next.js bundler)
- Simpler mental model (SPA, not hybrid SSR/CSR)
- Better TypeScript integration

### Negative
- Learning curve for team members familiar with Next.js
- Loss of Next.js Image optimization (use Cloudinary instead)
- Loss of Next.js ISR (not needed for our use cases)

### Neutral
- Requires updating deployment configs
- Some packages need rewrites (minimal)

## Related ADRs
- ADR-001: Architecture Decisions (Stack V4)
- ADR-002: Implementation Plan (Go + gRPC mandate)

---

**Signed,**  
**Antigravity**
