# ADR-030: Self-Service Tenant Provisioning & Client Onboarding Engine

**Status:** Accepted  
**Date:** March 6, 2026  
**Author:** Antigravity (The Agent)  
**Approved by:** Cylton Collymore (Superadmin)

---

## Context

The Sirsi platform requires a mechanism for new public clients to sign up, provision infrastructure, and begin using the platform without manual administrator intervention. The existing Client Portal (`/client-portal`) is a static placeholder with "Coming Soon" features. This ADR defines the architecture for transforming it into a self-service provisioning engine.

## Decision

### Commerce Architecture — Two Paths

**Path A — SaaS Self-Service (Priority)**
- Public pricing page at `sirsi.ai/pricing`
- Three tiers: **Free ($0)**, **Solo ($49/mo)**, **Business ($499/mo)**
- Stripe Checkout (subscription mode) for Solo and Business
- Automated 6-step onboarding wizard provisions tenant infrastructure
- Zero human intervention required

**Path B — Enterprise Bespoke**
- Custom engagements via Sirsi Sign (`sign.sirsi.ai`)
- Product catalog + MSA/SOW + e-signature + per-phase billing
- FinalWishes is vendor #1 on this path — its catalog structure is the proven blueprint
- Catalog interfaces (`Product`, `Bundle`, `WBSPhase`) are already generalized

Both paths converge at the **TenantService** (ConnectRPC) endpoint.

### Pricing Tiers

| | Free | Solo | Business |
|:---|:---|:---|:---|
| **Price** | $0/mo | $49/mo | $499/mo |
| **Target** | Exploration | Solo founders & startups | Existing businesses |
| **Users** | 1 | 5 | Unlimited |
| **Infrastructure** | Shared (Sirsi GCP) | Dedicated Cloud Run | Dedicated Cloud Run + DB |
| **Cloud Options** | GCP only | GCP only | GCP, AWS, Azure (On-Prem Phase 5) |
| **Contracts** | View only (3) | Full e-sign (25/mo) | Unlimited |
| **Document Vault** | 100MB | 5GB | 50GB |
| **GitHub Repo** | None | Private (SirsiMaster org) | Private + CI/CD templates |
| **Hypervisor** | Basic health | Standard telemetry | Full diagnostics + SLA |

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
├── GEMINI.md                        # Auto-generated, tenant-scoped canon
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
- **GEMINI.md**: Tenant-scoped operational directive inheriting Sirsi portfolio rules
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
