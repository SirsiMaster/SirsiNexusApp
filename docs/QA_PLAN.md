# QA Plan — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## QA Strategy
SirsiNexusApp follows a multi-layer testing strategy appropriate for a platform monorepo:

### Unit Testing
- **Go services**: `go test` with table-driven tests
- **React components**: Vitest + React Testing Library
- **Target coverage**: 80%+ for business logic, 60%+ for UI

### Integration Testing
- **gRPC services**: Integration tests against local Cloud SQL
- **Firebase**: Emulator-based testing for Auth and Firestore
- **Stripe/OpenSign**: Mock services for webhook testing

### E2E Testing
- **Sirsi Sign flows**: Browser-based signing ceremony verification
- **MFA flows**: TOTP enrollment and verification against Firebase Emulator

### CI/CD Pipeline Testing
- **golangci-lint**: Enforced on all Go code
- **ESLint + TypeScript**: Enforced on all React/TS code
- **Build verification**: Every PR must produce a clean build

## Environments
| Environment | Purpose | Access |
|-------------|---------|--------|
| Local | Development + Emulators | Developers |
| Staging | Pre-production validation | Team |
| Production | Live (`sign.sirsi.ai`) | Users |
