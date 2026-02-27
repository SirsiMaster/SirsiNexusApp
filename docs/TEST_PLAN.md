# Test Plan — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Test Strategy
Platform-level testing across all packages in the monorepo.

## Test Matrix

| Package | Unit Tests | Integration | E2E | CI/CD |
|---------|-----------|-------------|-----|-------|
| `sirsi-sign` | Vitest | Firebase Emulator | Browser | ✅ ESLint + Build |
| `sirsi-portal` | Vitest | — | Browser | ✅ ESLint + Build |
| `sirsi-auth` | Go test | Firebase Emulator | MFA Flow | ✅ golangci-lint |
| `sngp` | Go test | Cloud SQL | gRPC calls | ✅ golangci-lint |
| `sirsi-ui` | Vitest | — | Storybook | ✅ ESLint + Build |
| `sirsi-opensign` | — | — | Deployment | ✅ Firebase deploy |

## Acceptance Criteria
1. Zero errors in DevTools console (Rule 3)
2. All CI/CD pipeline jobs green
3. No visual regressions on deployed pages
4. All form flows complete without errors
5. MFA enrollment and verification work end-to-end

## Browser Testing
| Browser | Required |
|---------|----------|
| Chrome (latest) | ✅ Primary |
| Safari (latest) | ✅ Secondary |
| Firefox (latest) | Best effort |
| Mobile Safari (iOS) | ✅ Required |
| Chrome (Android) | ✅ Required |
