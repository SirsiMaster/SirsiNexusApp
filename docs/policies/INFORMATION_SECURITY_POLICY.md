# Information Security Policy

**Document ID:** SIRSI-ISP-001  
**Version:** 1.0.0  
**Effective Date:** January 28, 2026  
**Last Reviewed:** January 28, 2026  
**Next Review Date:** July 28, 2026  
**Classification:** Public  
**Owner:** Chief Information Security Officer (CISO)  
**Applies To:** Sirsi AI Corporation and all Portfolio Applications

---

## 1. Executive Summary

This Information Security Policy establishes the framework for protecting information assets across all Sirsi AI Corporation applications, including but not limited to: **SirsiNexus**, **Assiduous**, **FinalWishes**, and all future portfolio applications. This policy is designed to meet the requirements of:

- **SOC 1 Type II** (Service Organization Control)
- **SOC 2 Type II** (Security, Availability, Confidentiality, Processing Integrity, Privacy)
- **ISO/IEC 27001:2022** (Information Security Management Systems)
- **GDPR** (General Data Protection Regulation - EU 2016/679)
- **CCPA** (California Consumer Privacy Act)
- **HIPAA** (Health Insurance Portability and Accountability Act) - where applicable

---

## 2. Purpose and Scope

### 2.1 Purpose

This policy establishes the organization's commitment to protecting the confidentiality, integrity, and availability of all information assets. It defines the security controls, procedures, and responsibilities required to:

1. Identify, assess, and mitigate information security risks
2. Protect customer and organizational data from unauthorized access
3. Ensure business continuity and disaster recovery capabilities
4. Maintain compliance with applicable laws and regulations
5. Foster a security-conscious culture across the organization

### 2.2 Scope

This policy applies to:

- All employees, contractors, and third-party service providers
- All information systems, applications, and infrastructure
- All data processed, stored, or transmitted by Sirsi applications
- All physical and virtual environments
- All portfolio applications (current and future):
  - **SirsiNexus** - Agent-embedded migration & infrastructure platform
  - **Assiduous** - Professional services and consulting platform
  - **FinalWishes** - Legacy management and estate planning platform
  - **All future portfolio applications**

---

## 3. Information Security Governance

### 3.1 Leadership and Commitment

Executive leadership demonstrates commitment to information security through:

- Approval and enforcement of this security policy
- Allocation of adequate resources for security initiatives
- Regular review of security objectives and performance metrics
- Integration of security requirements into business processes

### 3.2 Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Executive Leadership** | Approve policies, allocate resources, ensure strategic alignment |
| **CISO** | Develop security strategy, oversee implementation, report to leadership |
| **Security Team** | Implement controls, monitor threats, conduct assessments |
| **Development Teams** | Secure coding practices, vulnerability remediation |
| **All Employees** | Compliance with policies, security awareness, incident reporting |

### 3.3 Information Security Management System (ISMS)

The organization maintains an ISMS compliant with ISO 27001:2022, including:

- **Risk Assessment Process** - Annual comprehensive assessment with continuous monitoring
- **Control Implementation** - Based on ISO 27001 Annex A controls
- **Performance Monitoring** - Key Risk Indicators (KRIs) and Key Performance Indicators (KPIs)
- **Continuous Improvement** - Regular audits, management reviews, corrective actions

---

## 4. Risk Management

### 4.1 Risk Assessment Methodology

Risk assessments are conducted:

- **Annually** - Comprehensive organizational risk assessment
- **Quarterly** - Review of high-risk areas and emerging threats
- **As Needed** - For new systems, significant changes, or security incidents

### 4.2 Risk Treatment

Identified risks are treated using one or more of the following strategies:

| Strategy | Application |
|----------|-------------|
| **Mitigate** | Implement controls to reduce risk to acceptable levels |
| **Transfer** | Insurance, contractual allocation to third parties |
| **Accept** | Document and monitor risks within tolerance |
| **Avoid** | Eliminate the activity generating the risk |

### 4.3 Risk Register

A centralized risk register is maintained with:

- Risk identification and description
- Likelihood and impact assessment
- Current controls and residual risk
- Risk owner and treatment plan
- Review and update timestamps

---

## 5. Access Control

### 5.1 Access Control Principles

All access is governed by the following principles:

1. **Least Privilege** - Users receive minimum access required for their role
2. **Need-to-Know** - Access granted only when business need is demonstrated
3. **Separation of Duties** - Critical functions require multiple approvals
4. **Defense in Depth** - Multiple layers of security controls

### 5.2 User Access Management

#### 5.2.1 Account Provisioning

- Formal approval process for all access requests
- Role-based access control (RBAC) with predefined permission sets
- Unique user identifiers for all users
- Access granted within 24 hours of approved request

#### 5.2.2 Access Review

| Review Type | Frequency | Scope |
|-------------|-----------|-------|
| User Access Review | Quarterly | All user accounts and permissions |
| Privileged Access Review | Monthly | Administrative and elevated access |
| Service Account Review | Semi-annually | Non-human accounts |
| Third-Party Access Review | Annually | Vendor and partner access |

#### 5.2.3 Access Revocation

- Immediate revocation upon termination
- Within 24 hours for role changes
- Automated deprovisioning workflows

### 5.3 Authentication Requirements

#### 5.3.1 Password Policy

| Requirement | Standard |
|-------------|----------|
| Minimum Length | 14 characters |
| Complexity | Uppercase, lowercase, numbers, special characters |
| History | Cannot reuse last 12 passwords |
| Expiration | 90 days (365 days with MFA enabled) |
| Lockout | 5 failed attempts, 30-minute lockout |

#### 5.3.2 Multi-Factor Authentication (MFA) Policy

**MFA IS REQUIRED FOR:**

| User Category | MFA Requirement | Supported Methods |
|--------------|-----------------|-------------------|
| **Administrative Accounts** | **MANDATORY** | TOTP, Hardware Keys (FIDO2/WebAuthn) |
| **Developer Access** | **MANDATORY** | TOTP, Hardware Keys |
| **Production System Access** | **MANDATORY** | TOTP, Hardware Keys |
| **Consumer Accounts** | **MANDATORY** | TOTP, SMS*, Hardware Keys |
| **Financial Integration Access** | **MANDATORY** | TOTP, Hardware Keys |

*SMS MFA is available but TOTP is strongly recommended due to SIM-swapping risks.

#### 5.3.3 Financial Integration Authentication

**CRITICAL REQUIREMENT: MFA Before Financial Services**

All users must complete Multi-Factor Authentication **BEFORE** accessing any financial integration services, including but not limited to:

- **Plaid Link** - Bank account linking
- **Stripe** - Payment processing
- **Chase** - Banking integrations
- **Any third-party financial API**

```
Authentication Flow for Financial Services:
┌─────────────────────────────────────────────────────────────┐
│  1. User Login (Username + Password)                         │
│                         ↓                                    │
│  2. MFA Challenge (TOTP/Hardware Key)                       │
│                         ↓                                    │
│  3. Session Established (Authenticated + MFA Verified)       │
│                         ↓                                    │
│  4. Access Granted to Protected Resources                    │
│                         ↓                                    │
│  5. Financial Integration (Plaid, Stripe, etc.) Available   │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Financial integration buttons/links are disabled until MFA is complete
- Session tokens include MFA verification claim (`mfa_verified: true`)
- Re-authentication required for sensitive financial operations
- Audit logging captures all financial integration access attempts

### 5.4 Privileged Access Management

- Separate privileged accounts from standard accounts
- Just-in-time (JIT) access for administrative functions
- Privileged Access Workstations (PAW) for sensitive operations
- Session recording for privileged activities
- Quarterly certification of privileged access

---

## 6. Data Protection

### 6.1 Data Classification

| Classification | Description | Examples | Controls |
|----------------|-------------|----------|----------|
| **Restricted** | Highly sensitive, regulated | PII, PHI, Financial Data, Credentials | Encryption, Access Logs, DLP |
| **Confidential** | Business sensitive | Internal plans, Customer data | Encryption, Access Control |
| **Internal** | Internal use only | Policies, Procedures | Access Control |
| **Public** | Approved for public release | Marketing materials | Integrity controls |

### 6.2 Encryption Standards

| Data State | Encryption Standard |
|------------|---------------------|
| **At Rest** | AES-256-GCM |
| **In Transit** | TLS 1.3 (minimum TLS 1.2) |
| **Key Management** | Google Cloud KMS / HashiCorp Vault |
| **Database** | Transparent Data Encryption (TDE) |
| **Backups** | AES-256 with separate key hierarchy |

### 6.3 Data Handling

#### 6.3.1 Data Retention

- Data retained only as long as necessary for business purposes
- Retention periods defined by data classification and legal requirements
- Automated deletion processes with verification
- Secure destruction of physical and electronic media

#### 6.3.2 Data Loss Prevention (DLP)

- Network DLP monitoring for data exfiltration
- Endpoint DLP on corporate devices
- Email filtering for sensitive data patterns
- Cloud DLP for storage services

---

## 7. Network Security

### 7.1 Network Architecture

- **Zero Trust Network Architecture** - Never trust, always verify
- **Network Segmentation** - Isolation of sensitive environments
- **Micro-segmentation** - Workload-level isolation in Kubernetes

### 7.2 Network Controls

| Control | Implementation |
|---------|---------------|
| **Firewall** | Cloud-native firewalls, Web Application Firewall (WAF) |
| **Intrusion Detection** | Network and Host-based IDS/IPS |
| **DDoS Protection** | Cloud-native DDoS mitigation |
| **VPN** | mTLS-based service mesh, WireGuard for remote access |
| **DNS Security** | DNSSEC, DNS filtering |

### 7.3 Service-to-Service Security

- **mTLS** via SPIRE/SPIFFE for workload identity
- **Service Mesh** with Istio for traffic management and security
- **API Gateway** with rate limiting and authentication
- **Dynamic Secrets** via HashiCorp Vault

---

## 8. Application Security

### 8.1 Secure Development Lifecycle (SDLC)

| Phase | Security Activities |
|-------|---------------------|
| **Requirements** | Security requirements, Threat modeling |
| **Design** | Security architecture review |
| **Development** | Secure coding standards, SAST |
| **Testing** | DAST, Penetration testing, Code review |
| **Deployment** | Configuration validation, Container scanning |
| **Operations** | Vulnerability management, Monitoring |

### 8.2 Code Security

- **Static Application Security Testing (SAST)** - CodeQL, Semgrep
- **Dynamic Application Security Testing (DAST)** - OWASP ZAP
- **Software Composition Analysis (SCA)** - Dependency scanning
- **Container Security** - Trivy, image signing
- **Infrastructure as Code** - Terraform security scanning

### 8.3 API Security

- JWT authentication with RS256 signing
- OAuth 2.0 / OpenID Connect integration
- Rate limiting (100 requests/minute standard, 1000/minute authenticated)
- Input validation and output encoding
- API versioning and deprecation policy

---

## 9. Incident Response

### 9.1 Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **P1 - Critical** | Active breach, data exfiltration | 15 minutes | Confirmed breach, ransomware |
| **P2 - High** | Potential breach, service disruption | 1 hour | Suspicious activity, DDoS |
| **P3 - Medium** | Security violation, policy breach | 4 hours | Failed penetration test |
| **P4 - Low** | Minor issues, informational | 24 hours | False positives, policy questions |

### 9.2 Incident Response Process

1. **Detection** - Automated alerting, user reports
2. **Triage** - Initial assessment and classification
3. **Containment** - Limit impact and prevent spread
4. **Eradication** - Remove threat from environment
5. **Recovery** - Restore services to normal operation
6. **Lessons Learned** - Post-incident review and improvements

### 9.3 Breach Notification

- **Internal** - Executive notification within 1 hour of confirmation
- **Regulatory** - Within 72 hours (GDPR), 60 days (CCPA)
- **Affected Parties** - As required by law and contract
- **Law Enforcement** - When criminal activity suspected

---

## 10. Business Continuity and Disaster Recovery

### 10.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| **Recovery Time Objective (RTO)** | 4 hours |
| **Recovery Point Objective (RPO)** | 1 hour |
| **Maximum Tolerable Downtime (MTD)** | 24 hours |

### 10.2 Backup Strategy

- Automated daily backups with point-in-time recovery
- Geographic redundancy (multi-region)
- Regular backup testing (monthly restoration tests)
- Immutable backups for ransomware protection

### 10.3 Business Continuity

- Annual BCP testing and tabletop exercises
- Documented recovery procedures
- Alternate processing sites
- Communication plans for stakeholders

---

## 11. Compliance Monitoring

### 11.1 Continuous Compliance

- Automated compliance scanning
- Real-time policy enforcement
- Compliance dashboards and reporting
- Exception management process

### 11.2 Audit Program

| Audit Type | Frequency | Scope |
|------------|-----------|-------|
| **Internal Audit** | Quarterly | All controls |
| **External Audit (SOC 2)** | Annual | Trust Service Criteria |
| **Penetration Test** | Annual | Applications and infrastructure |
| **Vulnerability Assessment** | Continuous | All systems |

### 11.3 Metrics and Reporting

Key Performance Indicators (KPIs):

- Mean Time to Detect (MTTD) - Target: < 1 hour
- Mean Time to Respond (MTTR) - Target: < 4 hours
- Patch compliance rate - Target: > 95%
- Security training completion - Target: 100%
- MFA adoption rate - Target: 100%

---

## 12. Third-Party Security

### 12.1 Vendor Risk Management

- Security assessment for all critical vendors
- Contractual security requirements
- Annual vendor security reviews
- Right to audit clauses

### 12.2 Third-Party Access

- Dedicated accounts for third parties
- Limited to necessary access only
- Time-bound access with regular review
- Monitoring and logging of third-party activities

---

## 13. Security Awareness and Training

### 13.1 Training Requirements

| Audience | Training | Frequency |
|----------|----------|-----------|
| **All Employees** | Security Awareness | Annual + Onboarding |
| **Developers** | Secure Coding | Annual |
| **Administrators** | Security Operations | Quarterly |
| **Executives** | Security Leadership | Annual |

### 13.2 Awareness Program

- Monthly security newsletters
- Phishing simulations (quarterly)
- Security champions program
- Incident lessons learned sharing

---

## 14. Policy Compliance

### 14.1 Enforcement

Violations of this policy may result in:

- Disciplinary action up to and including termination
- Civil or criminal penalties where applicable
- Contract termination for third parties
- Revocation of access privileges

### 14.2 Exceptions

- Security exceptions require CISO approval
- Risk acceptance documented and time-limited
- Compensating controls required
- Regular review of active exceptions

---

## 15. Document Control

### 15.1 Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-01-28 | Security Team | Initial release |

### 15.2 Review and Approval

This policy is reviewed annually or when significant changes occur. Approval is required from:

- Chief Executive Officer (CEO)
- Chief Information Security Officer (CISO)
- Chief Technology Officer (CTO)
- Legal Counsel

---

## 16. References

- ISO/IEC 27001:2022 - Information Security Management Systems
- SOC 2 Trust Service Criteria
- GDPR - General Data Protection Regulation
- NIST Cybersecurity Framework
- CIS Controls v8
- OWASP Application Security Verification Standard (ASVS)

---

**Document Classification:** Public  
**Copyright:** © 2026 Sirsi AI Corporation. All Rights Reserved.
