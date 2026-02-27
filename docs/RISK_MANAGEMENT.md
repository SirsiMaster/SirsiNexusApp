# Risk Management — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Risk Register

| ID | Risk | Severity | Likelihood | Mitigation |
|----|------|----------|-----------|------------|
| R1 | Data breach via API | Critical | Low | Defense in depth, MFA, RBAC, encrypted PII |
| R2 | Service unavailability | High | Low | Cloud Run auto-scaling, Firebase CDN |
| R3 | Dependency vulnerability | High | Medium | Dependabot alerts, regular updates |
| R4 | Cross-tenant data leak | Critical | Low | Tenant isolation via custom claims, row-level security |
| R5 | Payment processing failure | High | Low | Stripe webhooks with retry, idempotent operations |
| R6 | Key compromise | Critical | Very Low | Cloud KMS managed keys, rotation policy |
| R7 | Design system cross-pollination | Medium | Low | Application Firewall (ADR-020), scoped GEMINI.md |

## Risk Assessment Matrix
| | Low Impact | Medium Impact | High Impact | Critical Impact |
|---|-----------|--------------|-------------|----------------|
| **Likely** | Monitor | Mitigate | Mitigate | Immediate |
| **Possible** | Accept | Monitor | Mitigate | Mitigate |
| **Unlikely** | Accept | Accept | Monitor | Mitigate |
| **Rare** | Accept | Accept | Accept | Monitor |
