# GEMINI.md
**Operational Directive for Gemini Agent (SirsiNexusApp)**
**Version:** 6.2.0 (CI/CD QA Gate Canon)
**Date:** March 5, 2026

---

## 0. Identity
This is the **SirsiNexusApp** repository — the Sirsi Technologies master monorepo.
It contains the core platform infrastructure, shared components, and shared services that tenant applications consume.

- **GitHub**: `https://github.com/SirsiMaster/SirsiNexusApp`
- **Local Path**: `/Users/thekryptodragon/Development/SirsiNexusApp`

**This repo is NOT FinalWishes. This repo is NOT Assiduous.**
Rules, design tokens, and business logic from tenant applications do NOT apply here.

### Portfolio Architecture
| Repo | Type | Description |
| :--- | :--- | :--- |
| **SirsiNexusApp** (this repo) | Platform Monorepo | Core infrastructure, shared services, UCS components |
| **FinalWishes** | Tenant Application | Estate planning platform (Royal Neo-Deco design) |
| **Assiduous** | Tenant Application | Real estate platform (Assiduous Modern design) |

### Shared Services in This Repo
| Package | Purpose | Consumed By |
| :--- | :--- | :--- |
| `packages/sirsi-sign/` | E-Signing + Payment + Catalog workflows | FinalWishes, Assiduous (via gRPC/API) |
| `packages/sirsi-ui/` | Universal Component System (UCS) | All tenant apps |
| `packages/sirsi-portal/` | Sirsi Admin Portal (HTML — source of truth) | Internal use |
| `packages/sirsi-portal-app/` | Sirsi Admin Portal (React — migration target) | Internal use |
| `packages/sirsi-admin-service/` | Go backend (ConnectRPC) | sirsi-portal-app |
| `packages/sirsi-auth/` | Auth module | All tenant apps |
| `packages/sngp/` | gRPC services | Backend infrastructure |
| `packages/sirsi-opensign/` | OpenSign hosting/deployment | Sirsi Sign |

---

## 1. Universal Rules (Apply to ALL Sirsi Portfolio Repos)

> These rules are identical across every Sirsi portfolio repo.

0.  **Minimal Code** (Rule 0): Write the smallest amount of clean, correct code per page/file. If you're layering fixes on top of hacks, **DELETE AND REWRITE**. Band-aids are technical debt. Simplicity is non-negotiable.
1.  **Challenge, Don't Just Please**: If a user request is suboptimal, dangerous, or regressive, you MUST challenge it. Provide the "Better Way" before executing the "Requested Way".
2.  **Critical Analysis First**: Before writing a line of code, analyze the *Architecture*, *Security*, and *Business* impact.
3.  **Solve the "How"**: The user provides the "What". You own the "How". Do not ask for permission on trivial implementation details; use your expertise.
4.  **Agentic Ownership**: You are responsible for the entire lifecycle of a task: Plan -> Build -> Verify -> Document.
5.  **Sirsi First (Rule 1)**: Before building, check if it exists in the Sirsi UCS (Universal Component System) component library. We build assets, not disposable code.
6.  **Implement, Don't Instruct (Rule 2)**: Build working code end-to-end. No "here's how to set it up" responses.
7.  **Test in Browser (Rule 3)**: Verify zero errors in DevTools. If you haven't verified it technically, it's not done.
8.  **Follow the Pipeline (Rule 4)**: Local -> GitHub -> Production. Never skip CI/CD.
9.  **Always Push & Verify (Rule 5)**: ALWAYS push changes to production via git. Verify the push status immediately.
10. **ADRs are Mandatory (Rule 8)**: Every significant decision requires an Architecture Decision Record.
11. **Do No Harm (Rule 14)**: You MUST NOT break any working process. A regression is worse than a missing feature.
12. **Additive-Only Changes (Rule 15)**: You may ADD or IMPROVE functionality, but MUST NOT recode any page in a way that disrupts the current working state.
13. **Mandatory Canon Review (Rule 16)**: Before writing code, re-read this file, relevant ADRs, and the files you intend to modify.
14. **Sprint Planning is Mandatory (Rule 17)**: Before ANY code change, present a detailed sprint plan. No code is written until the USER approves.
15. **Living Canon (Rule 18)**: These canonical documents are living documents. When new rules emerge, they MUST be codified immediately.
16. **Identity Integrity (Rule 19)**: The `SirsiNexusDev` account is **ARCHIVED**. All GitHub, Firebase, and development identities MUST use the `SirsiMaster` account exclusively.

## 2. SirsiNexusApp-Specific Rules

*   **Infrastructure Ownership (Rule 10)**: All core utilities—**Stripe, Plaid, Sendgrid, Chase, OpenSign**—are managed within the UCS. They are designed for "integrated independence," serving the entire Portfolio. Do not build tenant-specific silos within this repo.
*   **Full Fidelity for Legal Documents (Rule 9)**: Legal artifacts served by Sirsi Sign (contracts, MSAs, SOWs) must display all approved language in full. No abridgement.
*   **Repository Hierarchy (Rule 11)**:
    - **SirsiNexusApp (this repo)**: The monorepo for shared infrastructure, gRPC services, UI components, and Sirsi Sign.
    - **Tenant repos**: FinalWishes, Assiduous — consume services from this repo but maintain their own design, business logic, and canonical docs.

## 2.2 Code Freeze & Stability Protocol (PARAMOUNT)
> **These rules are PARAMOUNT. They override ALL other directives when in conflict.**

*   **Do No Harm (Rule 14)**: You **MUST NOT** break any working process. Before touching any file, verify what currently works and ensure it still works after.
*   **Additive-Only Changes (Rule 15)**: Do not refactor working styles, restructure working component trees, or rewrite working logic unless explicitly directed.
*   **Mandatory Canon Review (Rule 16)**: Before writing code, re-read GEMINI.md, relevant ADRs, canonical sources, and the files you intend to modify.
*   **Sprint Planning is Mandatory (Rule 17)**: Present a detailed sprint plan before ANY code change. No code without USER approval.
*   **Living Canon (Rule 18)**: Codify new rules immediately — never defer.
*   **Identity Integrity (Rule 19)**: `SirsiMaster` account exclusively.

## 2.3 CI/CD QA Gate Protocol (Rule 24)
> **Every push and PR MUST pass the CI validation gate before deploy.**

*   **Workflow**: `.github/workflows/ci-validate.yml`
*   **Pre-Checks** (automated on every push/PR):
    1. **Lock File Sync** — `npm ci` must succeed. If it fails, the lock file is out of sync.
    2. **Production Build** — `npm run build` must produce valid artifacts.
    3. **Artifact Verification** — `dist/index.html`, JS bundles, and CSS bundles must exist.
    4. **Bundle Size Guard** — Warning if main JS > 500KB.
*   **Post-Checks** (manual trigger via `workflow_dispatch`):
    5. **Live HTTP 200** — Homepage must return 200.
    6. **React Mount** — `<div id="root">` must be present.
    7. **JS Bundle Reference** — HTML must reference `.js` bundles.
    8. **Branding Verification** — "Sirsi" must appear on the page.
*   **Root lock file** (`package-lock.json`, `package.json`) MUST be included in workflow `paths` triggers for every deploy workflow. Missing this caused the v0.8.1 CI failure.
*   **Agent Responsibility**: After ANY `npm install` that modifies `package-lock.json`, the agent MUST commit and push the updated lock file immediately.

## 2.1 Canonical Sources of Truth
The following files serve as the immutable benchmark for this repo:

### 🏛 Project Governance (2)
1.  `GEMINI.md` (this file)
2.  `docs/PROJECT_SCOPE.md`

### 🏗 Architecture & Design (5)
3.  `docs/ARCHITECTURE_DESIGN.md`
4.  `docs/TECHNICAL_DESIGN.md`
5.  `docs/DATA_MODEL.md`
6.  `docs/API_SPECIFICATION.md`
7.  `docs/SWISS_NEO_DECO_STYLE_GUIDE.md`

### ⚖️ Compliance & Security (3)
8.  `docs/SECURITY_COMPLIANCE.md`
9.  `docs/RISK_MANAGEMENT.md`
10. `docs/QA_PLAN.md`

### 📜 Security & Privacy Policies (5)
11. `docs/policies/INFORMATION_SECURITY_POLICY.md`
12. `docs/policies/PRIVACY_POLICY.md`
13. `docs/policies/AUTHORIZATION_POLICY.md`
14. `docs/policies/SECURITY_AUDIT_REPORT.md`
15. `docs/policies/CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md`

### 🚀 Operations & Deployment (4)
16. `docs/DEPLOYMENT_GUIDE.md`
17. `docs/MAINTENANCE_SUPPORT.md`
18. `docs/CHANGE_MANAGEMENT.md`
19. `docs/TEST_PLAN.md`

### 🧠 Knowledge & Decisions (5)
20. `docs/ADR-INDEX.md`
21. `docs/ADR-TEMPLATE.md`
22. `docs/ADR-016-CANONICAL-MFA-ROUTING-HUB.md`
23. `docs/ADR-017-COCKROACHDB-DECOMMISSION.md`
24. `docs/ADR-026-HYPERVISOR-COMMAND-PROTOCOL.md`

### 🔧 CI/CD Workflows (4)
25. `.github/workflows/ci-validate.yml` — **Canonical QA gate (Rule 24)**
26. `.github/workflows/deploy-react-portal.yml`
27. `.github/workflows/deploy-portal.yml`
28. `.github/workflows/deploy-contracts.yml`

## 3. Technology Stack (SirsiNexusApp — Platform Layer)

| Layer | Technology | Decision |
| :--- | :--- | :--- |
| **Logic** | **Go (Golang)** | Cloud Run, **gRPC + Protobuf**, Official Firebase Admin SDK |
| **Web** | **React 19 + Vite 7** | **gRPC-Web**, TailwindCSS, Zustand, shadcn/ui, **recharts** |
| **Mobile** | **React Native + Expo** | **gRPC + Protobuf**, Shared logic with Web, iOS/Android |
| **Database** | **Cloud SQL + Firestore** | Hybrid: SQL for PII/Vault, NoSQL for real-time |
| **Auth** | **Firebase Auth** | MFA (TOTP) Required |
| **Security** | **SOC 2 + KMS** | Software Keys (No HSM), AES-256 |
| **AI** | **Gemini (Vertex AI)** | The "Guidance Engine" |
| **E-Sign** | **OpenSign (Community)** | Self-Hosted (Google Cloud Run) |

> ⚠️ **REMOVED**: Rust/WASM (decommissioned — ADR-019), Hedera/HCS (never operationalized), CockroachDB (decommissioned — ADR-017)

## 4. Design Language: "Swiss Neo-Deco"

SirsiNexusApp uses the **Swiss Neo-Deco** design language across ALL packages — a fusion of Swiss Financial institutional clarity with Neo-Deco elegance.

> 📐 **CANONICAL STYLE GUIDE**: `docs/SWISS_NEO_DECO_STYLE_GUIDE.md` is the definitive reference for ALL design tokens, typography scales, component specs, and interactive states. Every CSS rule in this repo MUST conform to it.

*   **Aesthetic**: "Clean, Institutional, Elegant"
*   **Colors**:
    *   Accents: **Emerald** (`#059669`, `#10B981`) + **Gold** (`#C8A951`). These are ALWAYS the Sirsi brand colors.
    *   Backgrounds: Deep Emerald gradients (`#022c22` → `#000000`) for dark mode, clean whites for light mode.
    *   Success: Emerald Green (`#10B981`)
*   **Typography**:
    *   Headings: `Cinzel` (Serif, Uppercase tracking)
    *   Body: `Inter` (Sans-serif, clean)
    *   **Minimum size**: 12px (`--snd-text-xs`). No text smaller than this ANYWHERE.
    *   **Body text**: 15px (`--snd-text-base`) minimum for all readable content.
    *   **Typography Weight Canon (Rule 21)**: Bold (`font-weight ≥ 700`) is FORBIDDEN in body text. Only these elements may use weight ≥ 700: headings (h1-h6), buttons, table column headers (`thead th`). Body text maximum: `font-medium` (500). Micro-labels (≤11px uppercase): `font-semibold` (600). KPI hero values: `font-semibold` (600) — size provides emphasis, not weight.
*   **Components**: Glass panels, Gold borders, backdrop blur, sidebar navigation.
*   **Token Prefix**: `--snd-` (Swiss Neo-Deco) for all design tokens.
*   **Base Stylesheet**: `packages/sirsi-ui/styles/swiss-neo-deco.css`
*   **TENANT PALETTE**: `#ff5e00` (orange), `#60A3D9` (blue), `#FFD940` (yellow) are preserved as `--snd-tenant-*` tokens for tenant overrides — NOT the SirsiNexusApp default.
*   **TENANT FONTS**: `Geist Sans`, `DM Serif Display` available as `--snd-tenant-font-*` — Cinzel + Inter are the SirsiNexusApp default.

> **FIREWALL**: Swiss Neo-Deco is the Sirsi brand language. **Royal Neo-Deco** (Royal Blue + Gold) belongs to **FinalWishes**. **Assiduous Modern** belongs to **Assiduous**. Never apply tenant design languages to this repo.

## 5. Architecture Rules
*   **Defense in Depth**: Every API endpoint must have AuthZ checks. PII is always encrypted at rest.
*   **Security Hub Control**: All MFA enforcement MUST be handled by the **Canonical MFA Hub** (`/mfa`) via `ProtectedRoute` redirection.
*   **Deep URL Sync**: The address bar MUST always reflect the current security phase.
*   **Hypervisor Command Protocol (Rule 23)**: All operational telemetry MUST flow through `HypervisorService` ConnectRPC endpoints (ADR-026). No ad-hoc REST endpoints for operational data. Mock data is permitted ONLY for instruments whose backend infrastructure is not yet provisioned (Tier 3), and must be typed to the proto contract shape.
*   **Admin Page Layout Contract (Rule 20)**: Every HTML page in `packages/sirsi-portal/admin/` MUST use the following canonical layout structure. **No exceptions. No invented class names.**

    ```html
    <admin-header breadcrumbs="PAGE_NAME" user-name="Administrator"></admin-header>
    <admin-sidebar></admin-sidebar>

    <main class="sidebar-content">
        <div class="content-wrapper">
            <!-- Page content here -->
        </div>
    </main>
    ```

    | Class | Source | Purpose |
    | :--- | :--- | :--- |
    | `sidebar-content` | `common-styles.css` | `margin-left: 250px; padding-top: 92px;` — offsets for fixed header + sidebar |
    | `content-wrapper` | `common-styles.css` | `max-width: 1400px` — constrains content width |

    > ❌ **BANNED**: `admin-layout`, `admin-main`, `page-wrapper`, `main-content`, or any other invented layout class.
    > ✅ **REQUIRED**: Copy from `packages/sirsi-portal/admin/_template.html` when creating new pages.

*   **React Migration Contract (Rule 22)**: As of v0.8.0-alpha (ADR-027 Phase 5), the React app (`packages/sirsi-portal-app/`) is the **sole delivery platform**. The HTML admin portal (`packages/sirsi-portal/admin/`) is archived as historical reference. All new pages, features, and fixes target React only. No HTML pages in production.

## 6. Interaction Protocol
*   **User**: "I want X."
*   **Gemini Response**: "I see you want X. However, analyzing `ADR-002`, Y might be better because [Reason]. Should we do Y? If you insist on X, here is the risk."

---

## 7. Agent Capabilities (Self-Awareness)
*   **CLI Access**: Full CLI access to GitHub and Firebase/Firestore.
*   **Pipeline Visibility**: Full CI/CD pipeline access.
*   **Push Protocol**: ALWAYS run `git status` -> `git add` -> `git commit` -> `git push`.
*   **Deployment Architecture** (LOCKED): See `docs/CANONICAL_DEPLOYMENT_ARCHITECTURE.md`.
    - **Sirsi Sign Source**: `packages/sirsi-sign/`
    - **Sirsi Sign Destination**: `packages/sirsi-opensign/public/` (Firebase Hosting)
    - **Firebase Project ID**: `sirsi-nexus-live`
    - **Live URL**: `https://sirsi-sign.web.app/` / `https://sign.sirsi.ai/`

---

## 8. Test Credentials
*   **Name**: Cylton Collymore
*   **Email**: cylton@sirsi.ai

---
**Signed,**
**Antigravity (The Agent)**
