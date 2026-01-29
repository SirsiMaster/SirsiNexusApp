# Authorization Policy

**Document ID:** SIRSI-AP-001 | **Version:** 1.0.0 | **Effective:** January 28, 2026  
**Owner:** CISO | **Classification:** Internal  
**Applies To:** All Sirsi Portfolio Applications (SirsiNexus, Assiduous, FinalWishes, +++)

---

## 1. Purpose & Scope

This Authorization Policy establishes the framework for managing access to all Sirsi systems and data, ensuring compliance with **SOC 1**, **SOC 2**, **ISO 27001**, and **GDPR**.

**Applications Covered:** SirsiNexus, Assiduous, FinalWishes, Sirsi Portal, Sirsi OpenSign, all future portfolio applications.

---

## 2. Authorization Principles

| Principle | Implementation |
|-----------|----------------|
| **Least Privilege** | Minimum access required for role |
| **Need-to-Know** | Business justification required |
| **Separation of Duties** | Critical functions require multiple approvals |
| **Defense in Depth** | Multiple security layers |
| **Default Deny** | Access denied unless explicitly granted |
| **Zero Trust** | Never trust, always verify |

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Standard Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Platform owners | Full access, all systems |
| **Admin** | Application administrators | Full access, assigned application |
| **Developer** | Development team | Code repos, dev environments |
| **Security** | Security operations | Security tools, logs, incidents |
| **Manager** | Team supervisors | Team data, approvals, reports |
| **User** | Standard end-user | Application-specific features |
| **Auditor** | Internal/external auditors | Read-only logs and configs |

### 3.2 Application-Specific Roles

**SirsiNexus:** Infrastructure Admin, Migration Specialist, Agent Operator  
**FinalWishes:** Estate Admin, Document Creator, Beneficiary Viewer, Legal Partner  
**Assiduous:** Engagement Manager, Consultant, Client User, Finance

---

## 4. Multi-Factor Authentication (MFA) Requirements

### 4.1 MFA by User Type

| User Type | MFA Status | Methods |
|-----------|------------|---------|
| **Administrators** | **MANDATORY** | TOTP, Hardware Key |
| **Developers** | **MANDATORY** | TOTP, Hardware Key |
| **All Employees** | **MANDATORY** | TOTP, Hardware Key, SMS |
| **Consumer Users** | **MANDATORY** | TOTP, SMS, Hardware Key |

### 4.2 MFA by Access Type

| Access Type | MFA Required | Re-authentication |
|-------------|--------------|-------------------|
| Login | Yes | 24-hour session |
| Sensitive Data | Yes | Per-session |
| Financial Operations | Yes | Per-transaction |
| Password Change | Yes | Immediate |
| Document Signing | Yes | Per-document |

### 4.3 Financial Integration MFA (CRITICAL)

**MFA MUST be completed BEFORE accessing Plaid, Stripe, or any financial service.**

```
Auth Flow:
1. Username/Password → Session initialized
2. MFA Challenge (TOTP/Hardware Key) → mfa_verified: true
3. Session authenticated → Standard features unlocked
4. Financial integrations enabled → Plaid/Stripe accessible

⚠️ WITHOUT MFA: Financial buttons disabled, API returns 403
```

**Token Claims:**
```json
{
  "mfa_verified": true,
  "mfa_method": "totp",
  "mfa_timestamp": 1738108418,
  "acr": "urn:sirsi:mfa:verified"
}
```

---

## 5. Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum Length | 14 characters |
| Complexity | Upper, lower, numbers, special |
| History | Last 12 cannot reuse |
| Expiration | 90 days (365 with hardware MFA) |
| Lockout | 5 attempts, 30-min lockout |

---

## 6. Privileged Access Management

- JIT (Just-in-Time) access: 4-hour maximum
- Dual authorization for critical operations
- Session recording for privileged activities
- Break-glass procedures for emergencies
- Monthly privileged access reviews

---

## 7. Access Request & Review

**Request Flow:** Request → Manager Approval → Security Review* → Access Granted  
*Security review required for: privileged, cross-system, sensitive data access

**Review Schedule:**
- User Access: Quarterly
- Privileged Access: Monthly
- Service Accounts: Semi-annually
- Third-Party: Annually
- Dormant Accounts (>90 days): Monthly

---

## 8. Audit & Monitoring

**Logged Events:** User ID, IP, timestamp, resource, action, success/failure, MFA status

**Alerts:**
- Multiple failed logins: Medium (15 min)
- Privileged access outside hours: High (5 min)
- Mass data download: Critical (immediate)

**Retention:** Access logs 1 year online, 7 years archive

---

## 9. Compliance Mapping

| Framework | Controls |
|-----------|----------|
| **SOC 2** | CC6.1 (auth), CC6.2 (authorization), CC6.3 (modification) |
| **ISO 27001** | A.5.15-18 (access control), A.8.2-3 (privileged access) |
| **GDPR Art. 32** | Confidentiality, integrity, availability |

---

## 10. Enforcement & Exceptions

**Violations:** Immediate access revocation, disciplinary action, termination  
**Exceptions:** CISO approval, documented risk, compensating controls, time-limited

---

**© 2026 Sirsi Technologies Inc.. All Rights Reserved.**
