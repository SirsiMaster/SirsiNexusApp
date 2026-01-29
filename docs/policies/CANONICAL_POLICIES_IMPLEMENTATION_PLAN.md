# Canonical Policies Implementation Plan

**Document ID:** SIRSI-CPIP-001 | **Version:** 1.0.0 | **Date:** January 28, 2026  
**Owner:** CISO & CTO | **Status:** Approved

---

## 1. Objective

Implement a **unified, canonical security policy framework** across all current and future Sirsi Portfolio applications. This ensures consistent compliance with **GDPR**, **SOC 1**, **SOC 2**, and **ISO 27001** across the entire ecosystem.

---

## 2. Policy Documents

| Document | Path | Purpose |
|----------|------|---------|
| Information Security Policy | `docs/policies/INFORMATION_SECURITY_POLICY.md` | Master security framework |
| Privacy Policy | `docs/policies/PRIVACY_POLICY.md` | GDPR/CCPA data protection |
| Authorization Policy | `docs/policies/AUTHORIZATION_POLICY.md` | Access control & MFA |
| Security Audit Report | `docs/policies/SECURITY_AUDIT_REPORT.md` | Compliance findings |
| This Plan | `docs/policies/CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md` | Implementation roadmap |

---

## 3. Current Applications

| Application | Repository | Status |
|-------------|------------|--------|
| **SirsiNexus** | `/SirsiNexusApp` (Monorepo) | ✅ Policies created here |
| **Assiduous** | TBD in monorepo | 🔄 Inherits from SirsiNexus |
| **FinalWishes** | `packages/finalwishes-contracts` | 🔄 Needs policy symlinks |
| **Sirsi Portal** | `packages/sirsi-portal` | 🔄 Needs policy symlinks |
| **Sirsi OpenSign** | `packages/sirsi-opensign` | 🔄 Needs policy symlinks |

---

## 4. Implementation Strategy

### 4.1 Monorepo Centralization

Policies are stored **once** in the monorepo root and referenced by all applications:

```
SirsiNexusApp/
├── docs/
│   └── policies/                    # CANONICAL SOURCE
│       ├── INFORMATION_SECURITY_POLICY.md
│       ├── PRIVACY_POLICY.md
│       ├── AUTHORIZATION_POLICY.md
│       ├── SECURITY_AUDIT_REPORT.md
│       └── CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md
├── packages/
│   ├── finalwishes-contracts/
│   │   └── docs/ → ../../docs/policies (symlink)
│   ├── sirsi-portal/
│   │   └── docs/ → ../../docs/policies (symlink)
│   └── sirsi-opensign/
│       └── docs/ → ../../docs/policies (symlink)
```

### 4.2 New Application Onboarding

All new portfolio applications MUST:

1. **Inherit** policies from the monorepo `docs/policies/` directory
2. **Implement** MFA enforcement per Authorization Policy Section 4
3. **Display** Privacy Policy in application footer/settings
4. **Log** all access events per Information Security Policy Section 11
5. **Complete** security checklist before production deployment

### 4.3 External Project Repositories

For external/standalone repositories (outside monorepo):

```bash
# Add as Git submodule
git submodule add https://github.com/111Ventures/sirsi-policies.git docs/policies

# Or copy with version tracking
curl -O https://raw.githubusercontent.com/111Ventures/sirsi-policies/main/policies.zip
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETE

| Task | Status | Owner |
|------|--------|-------|
| Create Information Security Policy | ✅ Done | Security |
| Create Privacy Policy | ✅ Done | Legal/Security |
| Create Authorization Policy | ✅ Done | Security |
| Create Security Audit Report | ✅ Done | Security |
| Create Implementation Plan | ✅ Done | Security |

### Phase 2: Code Implementation (Week 2) ✅ COMPLETE

| Task | Status | Owner | Location |
|------|--------|-------|----------|
| Create shared policy package | ✅ Done | Engineering | `packages/sirsi-ui/` |
| Implement MFA middleware | ✅ Done | Engineering | `packages/sirsi-portal/functions/src/middleware/` |
| Add policy links to all applications | ✅ Done | Engineering | `packages/sirsi-ui/src/components/PolicyLinks.tsx` |
| Create policy acceptance flow | ✅ Done | Engineering | `packages/sirsi-ui/src/components/ConsentBanner.tsx` |
| Implement useMFA hook | ✅ Done | Engineering | `packages/sirsi-ui/src/hooks/useMFA.ts` |
| Implement useConsent hook | ✅ Done | Engineering | `packages/sirsi-ui/src/hooks/useConsent.ts` |
| Create MFARequired component | ✅ Done | Engineering | `packages/sirsi-ui/src/components/MFARequired.tsx` |

### Phase 3: Verification (Week 3) - COMPLETED

| Task | Status | Owner | Implementation |
|------|--------|-------|----------------|
| Audit MFA enforcement in FinalWishes | ✅ Done | Security | `SirsiVault.tsx` (Financial Ops) |
| Audit MFA enforcement in SirsiNexus | ✅ Done | Security | `security-init.js` (Root Admin/Inv) |
| Verify Privacy Policy display | ✅ Done | QA | Static Pages created & linked |
| Document evidence for SOC 2 | ✅ Done | Compliance | `SECURITY_AUDIT_REPORT.md` updated |

---

## 12. Implementation Tracking (Phase 3 Complete)

| Target Application | MFA / Security Script | Policy Page Integration | Status |
|-------------------|----------------------|-------------------------|--------|
| **SirsiNexusApp** (Root) | `assets/js/security-init.js` | Static templates in `/` | ✅ Complete |
| **Sirsi Portal** | `sirsinexusportal/assets/js/security-init.js` | Static templates in `sirsi-portal/` | ✅ Complete |
| **Sirsi OpenSign** (Infra) | `public/assets/js/security-init.js` | Static templates in `public/` | ✅ Complete |
| **FinalWishes** | `AppLayout.tsx` (Hook Based) | `PolicyLinks.tsx` component | ✅ Complete |

---

## 🏛 Summary of Canonical Implementation

| Application | MFA Enforcement | Privacy/Terms Policy |
|-------------|-----------------|---------------------|
| **SirsiNexusApp** | Global `security-init.js` | Canonical Symlinks in Root |
| **Sirsi Portal** | Global `security-init.js` | Canonical Symlinks in `sirsi-portal/` |
| **Sirsi OpenSign** (Infra) | Global `security-init.js` | Canonical Symlinks in `sirsi-opensign/public/` |
| **FinalWishes** | `SirsiVault.tsx` (Financial Ops) | `AppLayout.tsx` (Consent/Footer) |

### Phase 4: Verification & Certification (In Progress)

| Task | Status | Owner |
|------|--------|-------|
| SOC 2 Type II audit scheduling | 🔄 Pending | Compliance |
| ISO 27001 gap assessment | 🔄 Pending | Security |
| GDPR DPA updates | 🔄 Pending | Legal |

---

## 6. Technical Implementation

### 6.1 MFA Enforcement Middleware

```typescript
// packages/sirsi-auth/src/middleware/requireMFA.ts
import { Request, Response, NextFunction } from 'express';

export function requireMFA(req: Request, res: Response, next: NextFunction) {
  const token = req.auth;
  
  if (!token?.mfa_verified) {
    return res.status(403).json({
      error: 'mfa_required',
      message: 'Multi-factor authentication required',
      redirect: '/auth/mfa',
      policy: 'https://sirsi.ai/policies/authorization'
    });
  }
  
  next();
}

// Usage in financial routes
app.use('/api/plaid', requireMFA);
app.use('/api/stripe', requireMFA);
app.use('/api/banking', requireMFA);
```

### 6.2 Privacy Policy Component

```tsx
// packages/sirsi-ui/src/components/PolicyLinks.tsx
import React from 'react';

export const PolicyLinks: React.FC = () => (
  <div className="policy-links">
    <a href="/policies/privacy">Privacy Policy</a>
    <a href="/policies/terms">Terms of Service</a>
    <a href="/policies/security">Security</a>
  </div>
);

// Usage in Footer
<Footer>
  <PolicyLinks />
</Footer>
```

### 6.3 Policy Consent Tracking

```typescript
// packages/sirsi-auth/src/services/consent.ts
interface Consent {
  userId: string;
  policyId: string;
  version: string;
  timestamp: Date;
  ipAddress: string;
}

async function recordConsent(userId: string, policyId: string): Promise<void> {
  await db.collection('consents').add({
    userId,
    policyId,
    version: '1.0.0',
    timestamp: new Date(),
    ipAddress: request.ip
  });
}
```

---

## 7. Governance

### 7.1 Policy Update Process

1. **Propose** changes via GitHub PR
2. **Review** by Security and Legal
3. **Approve** by CISO
4. **Notify** all application owners
5. **Update** version in all applications
6. **Communicate** to users (if material change)

### 7.2 Review Schedule

| Policy | Review Frequency | Next Review |
|--------|-----------------|-------------|
| Information Security | Annually | January 2027 |
| Privacy | Annually | January 2027 |
| Authorization | Annually | January 2027 |

### 7.3 Contact

**Policy Owner:** CISO  
**Technical Implementation:** CTO  
**Legal Review:** General Counsel  
**Email:** security@sirsi.ai

---

## 8. Checklist for New Applications

When onboarding a new portfolio application:

- [ ] Add symlink/submodule to canonical policies
- [ ] Implement MFA middleware (copy from sirsi-auth)
- [ ] Add PolicyLinks component to footer
- [ ] Implement consent tracking
- [ ] Add security logging
- [ ] Complete security checklist
- [ ] Document in ADR-INDEX.md
- [ ] Notify Security team for review

---

## 9. Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| MFA Adoption Rate | 100% | TBD |
| Policy Consent Rate | 100% | TBD |
| SOC 2 Readiness | 95% | 88% |
| Security Training | 100% | TBD |

---

**Approved By:**  
- [ ] CEO  
- [ ] CISO  
- [ ] CTO  
- [ ] General Counsel

**© 2026 Sirsi AI Corporation. All Rights Reserved.**
