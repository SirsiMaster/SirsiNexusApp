# Security & Compliance — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Compliance Framework
SirsiNexusApp targets **SOC 2 Type II** compliance with the following trust service criteria:
- **Security**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Availability**: Cloud Run auto-scaling, Firebase global CDN
- **Confidentiality**: PII encrypted with Cloud KMS, role-based access

## Authentication & Authorization
- **Provider**: Firebase Auth with MFA (TOTP) required for all admin/provider roles
- **Session Management**: See ADR-016 (Canonical MFA Routing Hub)
- **RBAC**: Custom claims in Firebase tokens (`admin`, `provider`, `client`)

## Encryption Standards
| Data Type | At Rest | In Transit | Key Management |
|-----------|---------|------------|----------------|
| PII (names, emails) | AES-256 (Cloud KMS) | TLS 1.3 | Google-managed keys |
| Documents | AES-256 (Cloud Storage) | TLS 1.3 | Google-managed keys |
| API tokens | Not stored | TLS 1.3 | Firebase Auth |
| Contract hashes | SHA-256 | TLS 1.3 | N/A (one-way) |

## Security Policies
Detailed policies are maintained in `docs/policies/`:
- `INFORMATION_SECURITY_POLICY.md` — Master security framework
- `PRIVACY_POLICY.md` — GDPR/CCPA data protection
- `AUTHORIZATION_POLICY.md` — Access control, RBAC, MFA
- `SECURITY_AUDIT_REPORT.md` — Compliance findings

## Incident Response
1. Detection via Cloud Logging alerts
2. Triage within 1 hour
3. Containment and remediation
4. Post-incident review (documented in `SECURITY_AUDIT_REPORT.md`)
