# Sirsi Sign Platform - Architecture Specification

**Document Version:** 1.0  
**Date:** 2026-01-20  
**Author:** Antigravity / Cylton Collymore  
**Status:** Active Development

---

## 1. Platform Overview

**sign.sirsi.ai** is the unified signatory, payment, and document vault platform for Sirsi. It serves two distinct user flows:

### Flow A: Vault Access (Authenticated Users)
```
User with credentials → sign.sirsi.ai → Login → Vault Dashboard
                                               ├── Documents awaiting signature
                                               ├── Signed documents archive
                                               └── Account settings
```

### Flow B: Referral Link Access (New Clients)
```
Referral Link (with embedded credentials) → sign.sirsi.ai/onboard/{token}
                                          → Auto-fill credentials
                                          → Partnership Agreement Workflow
                                          → Configure Solution
                                          → Review & Sign
                                          → Payment Processing
                                          → Welcome to Vault
```

---

## 2. URL Structure

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Vault landing page (login/register) | No |
| `/login` | Authentication | No |
| `/vault/:userId` | Personal vault dashboard | Yes |
| `/vault/:userId/:category` | Filtered vault view (e.g. /contracts) | Yes |
| `/vault/:userId/contracts/:entity/:docId` | **Document Review & Signature** | Yes |
| `/partnership/:projectId` | Project onboarding/config | No/Token |

---

## 3. Technical Architecture

### Frontend Stack
- **Framework:** TanStack Start (React 18 + TanStack Router)
- **Styling:** TailwindCSS + Royal Neo-Deco design system
- **State:** Zustand
- **Data:** TanStack Query + gRPC-Web
- **Auth:** Firebase Auth + JWT tokens
- **E-Sign:** OpenSign (self-hosted on Cloud Run)
- **Payments:** Stripe Elements

### Backend Stack
- **Runtime:** Go (Golang) on Cloud Run
- **Protocol:** gRPC + Protobuf
- **Database:** Cloud SQL (PII/Vault) + Firestore (real-time)
- **Storage:** Cloud Storage (encrypted documents)
- **Auth:** Firebase Admin SDK
- **Signing:** OpenSign gRPC service
- **Payments:** Stripe Go SDK

---

## 4. Contract Builder (Admin Feature)

The Contract Template Builder allows Sirsi Admins and authorized project admins to:

### Features
1. **Module Library**: Drag-and-drop contract modules (NDA clauses, payment terms, scope definitions)
2. **Variable Fields**: Define fillable fields (client name, project name, pricing)
3. **Pricing Calculator**: Configure formula-based or fixed pricing
4. **Preview Mode**: Real-time contract preview
5. **Versioning**: Track contract template versions
6. **Permissions**: Set which projects can use which templates

### Module Types
- **Header Modules**: Project context, parties, effective date
- **Scope Modules**: Technical deliverables, milestones
- **Legal Modules**: NDA, IP assignment, liability, jurisdiction
- **Payment Modules**: Pricing tiers, payment schedules, Stripe integration
- **Signature Modules**: E-sign blocks, witness requirements

---

## 5. Integration Points

### Sirsi Internal Projects
Sirsi-owned projects integrate sign.sirsi.ai for:
- Client onboarding contracts
- Service agreements
- Payment processing

### Sirsi-Built Projects (Tenants)
Projects built by Sirsi for clients can integrate:
- `@sirsi/sign-sdk`: JavaScript SDK for embedding
- gRPC endpoints for programmatic access
- Webhook notifications for signature events

### Example Integration (Tameeka Lockhart)
The new standard hierarchical link for her contract:
`https://sign.sirsi.ai/vault/tameeka-lockhart/contracts/finalwishes/msa-001`

---

## 6. Current Implementation Status

### ✅ Completed
- Partnership Agreement configurator (Vite + React)
- Module selection UI with Royal Neo-Deco styling
- Dynamic SOW generation
- PDF/Print preview (basic)

### 🔄 In Progress
- Stripe payment integration
- OpenSign document signing
- Contract line-item editing
- Referral link generation

### ❌ Not Started
- Vault landing page & login
- Document vault dashboard
- Admin contract template builder
- gRPC backend services
- Firebase Auth integration
- Production deployment to sign.sirsi.ai

---

## 7. Priority for Tameeka Lockhart Contract

**Client is waiting.** The following must work end-to-end:

1. ✅ Solution configurator (modules selection)
2. ⚠️ Accurate pricing calculation
3. ⚠️ Contract document generation (PDF)
4. ❌ E-signature workflow
5. ❌ Payment processing
6. ❌ Signed document delivery

### Minimum Viable Flow
```
Configure → Review PDF → Manual Signature → Manual Payment → Done
```

### Target Flow (Post-MVP)
```
Configure → Real-time Preview → OpenSign E-Signature → Stripe Payment → Vault Archive
```

---

## 8. Related Documents
- ADR-001: Architecture Decisions
- ADR-002: Implementation Plan
- ADR-003: TanStack Migration
- docs/TECHNICAL_DESIGN.md
- docs/API_SPECIFICATION.md

---

**Signed,**  
**Antigravity**
