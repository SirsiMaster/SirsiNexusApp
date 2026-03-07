# ADR-030: Self-Service Tenant Provisioning & Client Onboarding Engine

**Status:** Accepted  
**Date:** March 6, 2026  
**Author:** Antigravity (The Agent)  
**Approved by:** Cylton Collymore (Superadmin)

---

## Context

The Sirsi platform requires a mechanism for new public clients to sign up, provision infrastructure, and begin using the platform without manual administrator intervention. The existing Client Portal (`/client-portal`) is a static placeholder with "Coming Soon" features. This ADR defines the architecture for transforming it into a self-service provisioning engine.

## Decision

### Commerce Architecture — Converged Enforcement

**Commerce is unified across both SaaS and Enterprise paths:**
1. **SaaS Self-Service**: User-directed via `/signup/onboarding`
2. **Enterprise Bespoke**: Admin-directed via Sirsi Sign envelopes

**The "Sirsi Way" of Payment Handling:**
- All payments (subscriptions and one-offs) route through the **OpenSign REST API**.
- Every SaaS signup creates a **Legal Execution Record** (Signup Envelope) in the **Sirsi Vault** before redirecting to Stripe.
- **Financial Settlement** is managed by the OpenSign Payment Bridge, ensuring consistent webhook handling and ledger updates across the entire portfolio.
- SaaS Tiers occupy first-class slots in the **Universal Catalog**, subjecting them to the same pricing algorithms and Hypervisor observability as enterprise SOWs.

### Pricing Tiers (Standardized)

| | Free | Solo | Business |
|:---|:---|:---|:---|
| **Price** | $0/mo | $500/mo | $2,500/mo |
| **Target** | Exploration | Independent Professionals | Enterprise Operations |
| **Users** | 1 | 5 | Unlimited |
| **Infrastructure** | Shared (Sirsi GCP) | Dedicated Cloud Run | Dedicated Cloud Run + DB |
| **Cloud Options** | GCP only | GCP only | GCP, AWS, Azure |
| **Contracts** | View only (3) | Full e-sign (10 active) | Unlimited active |
| **Document Vault** | 100MB | 10GB | 100GB |
| **GitHub Repo** | None | Private (SirsiMaster org) | Private + CI/CD templates |
| **Hypervisor** | Basic health | Standard telemetry | Full diagnostics + SLA |

*Prices standardized in `packages/sirsi-sign/src/data/catalog.ts` per Rule 12.*

### Locked Decisions

1. **Free Tier Wizard**: Lite (3-step) — account, org profile, instant provision
2. **Infrastructure Default**: Hybrid — Free/Solo always Managed (Sirsi GCP); Business gets choice
3. **On-Premise**: Deferred to Phase 5
4. **Investor Portal**: Keep existing layout; ensure pages work
5. **GitHub Strategy**: Template repo (`SirsiMaster/tenant-scaffold`), automated creation, transferable
6. **GitHub Tier Gating**: Free=none, Solo=repo, Business=repo+CI/CD
7. **Stripe Products**: Created immediately
8. **Pricing Page**: Cards + feature comparison matrix

### Tenant Data Model

New `tenants` table in Cloud SQL:

| Column | Type | Notes |
|:---|:---|:---|
| `id` | UUID | Primary key |
| `slug` | VARCHAR(64) | Unique, URL-safe |
| `name` | VARCHAR(255) | Display name |
| `owner_uid` | VARCHAR(128) | Firebase UID |
| `superadmin_uids` | TEXT[] | Always includes Cylton + Hypervisor |
| `plan` | ENUM | `free`, `solo`, `business` |
| `cloud_provider` | ENUM | `gcp`, `aws`, `azure`, `local` |
| `provisioning_status` | ENUM | `pending`, `provisioning`, `active`, `suspended`, `archived` |
| `stripe_customer_id` | VARCHAR(128) | Stripe reference |

### Superadmin Attachment (Mandatory)

Every provisioned tenant is automatically attached to:
1. **Cylton (Superadmin)** — Full access to all tenant dashboards
2. **Sirsi Hypervisor** — Autonomous monitoring, telemetry, SLA enforcement

This is enforced at the data layer — `superadmin_uids` is immutable by the client.

### GitHub Repository Strategy

- Template repo: `SirsiMaster/tenant-scaffold`
- Created via GitHub API on Solo/Business provisioning
- Includes canonical CI/CD workflows (same as portfolio companies)
- **Transferable**: If client churns, repo ownership transfers to their account
- IP split: Client owns their code; Sirsi retains scaffold template + UCS IP

#### Scaffold Contents (Every Tenant Repo Gets)

```
github.com/SirsiMaster/{tenant-slug}/
├── .github/
│   └── workflows/
│       ├── ci-validate.yml          # Same QA gate as all Sirsi portfolio repos (Rule 24)
│       └── deploy.yml               # Firebase/Cloud Run deploy, parameterized per tenant
├── packages/
│   ├── {tenant-app}/                # React app (scaffolded from UCS)
│   └── sirsi-ui/                    # UCS component library (symlinked/subtree)
├── docs/
│   ├── PROJECT_SCOPE.md             # Auto-generated, customized to tenant
│   ├── ARCHITECTURE_DESIGN.md       # Canonical structure, tenant-specific content
│   ├── TECHNICAL_DESIGN.md          # Stack decisions, tenant-scoped
│   ├── DATA_MODEL.md                # Tenant data schema
│   ├── API_SPECIFICATION.md         # Tenant API surface
│   ├── SECURITY_COMPLIANCE.md       # Security requirements (SOC 2 baseline)
│   ├── DEPLOYMENT_GUIDE.md          # Deployment instructions for tenant infra
│   ├── QA_PLAN.md                   # Testing strategy
│   ├── ADR-INDEX.md                 # Tenant-specific ADR registry
│   ├── ADR-001-TENANT-INITIALIZATION.md  # Auto-generated: records provisioning decisions
│   └── ADR-TEMPLATE.md             # Standard template for future decisions
├── SIRSI_RULES.md                        # Auto-generated, tenant-scoped canon
│                                    #   - Tenant identity, slug, plan tier
│                                    #   - Sirsi UCS rules inherited
│                                    #   - Portfolio architecture reference
│                                    #   - CI/CD QA gate protocol
│                                    #   - Design language assignment
│                                    #   - Superadmin attachment declaration
├── firebase.json                    # Firebase Hosting config (tenant-scoped)
├── package.json                     # Workspace root
└── README.md                        # Auto-generated getting started guide
```

Every repo inherits:
- **UCS infrastructure**: Sirsi UI component library, design tokens, shared utilities
- **Canonical documentation**: Full doc suite customized to the tenant's profile
- **ADR-001**: Auto-generated ADR recording the tenant's provisioning decisions (cloud provider, plan, region, timestamp)
- **SIRSI_RULES.md**: Tenant-scoped operational directive inheriting Sirsi portfolio rules
- **CI/CD pipelines**: Identical to FinalWishes/Assiduous workflow patterns

## Consequences

- The public pricing page becomes a real commerce surface with working Stripe integration
- Every new client signup automatically provisions infrastructure and registers with the Hypervisor
- The FinalWishes catalog structure becomes the generalized enterprise onboarding template
- GitHub Free plan is sufficient for Phase 1; Team plan ($4/user/mo) deferred

## References

- ADR-026: Hypervisor Command Protocol
- ADR-027: React Portal Migration
- ADR-029: Cloud Run Deployment Architecture
- `packages/sirsi-sign/src/data/catalog.ts` (Enterprise catalog blueprint)

## Phase 3: Implementation Status (March 6, 2026)

**Phase 3 (GitHub Automation & API Convergence) is COMPLETE.**

1.  **Stripe/OpenSign Bridge**: Decommissioned parallel Stripe logic. All SaaS signups now create a legal record in the Vault via the OpenSign Payment Bridge (`/api/payments/create-session`).
2.  **GitHub Infrastructure-as-Code**: The Go `sirsi-admin-service` now integrates with the GitHub API (`github.com/google/go-github/v60`).
    - Solo and Business plans automatically trigger the creation of a private repository from the `SirsiMaster/tenant-scaffold` template.
    - Repositories are named according to the tenant slug and initialized with canonical Sirsi documentation and CI/CD workflows.
3.  **Real-Time Provisioning Status**: The Onboarding Wizard has transitioned from simulated client-side timers to a robust polling mechanism.
    - Frontend calls `tenantClient.getProvisioningStatus` every 2 seconds.
    - Backend tracks progress in a stateful map, allowing for reliable recovery and multi-step progress tracking.
    - Supports `PROVISIONING_STATE_FAILED` and individual step status updates.
4.  **Security Integration**: GitHub integration is gated by `SIRSI_GITHUB_PAT`. If missing, the system gracefully skips repository creation while maintaining the overall orchestration flow.
5.  **Componentized Catalog Sync**: Extracted the Stripe synchronization logic into `StripeCatalogSync.tsx`, enabling portfolio companies (FinalWishes, Assiduous) to replicate automated catalog-to-payment-gateway provisioning in their respective admin portals.
