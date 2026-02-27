# GEMINI.md
**Operational Directive for Gemini Agent (SirsiNexusApp)**
**Version:** 6.0.0 (Application Firewall)
**Date:** February 27, 2026

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
| `packages/sirsi-portal/` | Sirsi Admin Portal | Internal use |
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

## 2.1 Canonical Sources of Truth
The following files serve as the immutable benchmark for this repo:

### 🏛 Project Governance (2)
1.  `GEMINI.md` (this file)
2.  `docs/PROJECT_SCOPE.md`

### 🏗 Architecture & Design (4)
3.  `docs/ARCHITECTURE_DESIGN.md`
4.  `docs/TECHNICAL_DESIGN.md`
5.  `docs/DATA_MODEL.md`
6.  `docs/API_SPECIFICATION.md`

### ⚖️ Compliance & Security (3)
7.  `docs/SECURITY_COMPLIANCE.md`
8.  `docs/RISK_MANAGEMENT.md`
9.  `docs/QA_PLAN.md`

### 📜 Security & Privacy Policies (5)
10. `docs/policies/INFORMATION_SECURITY_POLICY.md`
11. `docs/policies/PRIVACY_POLICY.md`
12. `docs/policies/AUTHORIZATION_POLICY.md`
13. `docs/policies/SECURITY_AUDIT_REPORT.md`
14. `docs/policies/CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md`

### 🚀 Operations & Deployment (4)
15. `docs/DEPLOYMENT_GUIDE.md`
16. `docs/MAINTENANCE_SUPPORT.md`
17. `docs/CHANGE_MANAGEMENT.md`
18. `docs/TEST_PLAN.md`

### 🧠 Knowledge & Decisions (4)
19. `docs/ADR-INDEX.md`
20. `docs/ADR-TEMPLATE.md`
21. `docs/ADR-016-CANONICAL-MFA-ROUTING-HUB.md`
22. `docs/ADR-017-COCKROACHDB-DECOMMISSION.md`

## 3. Technology Stack (SirsiNexusApp — Platform Layer)

| Layer | Technology | Decision |
| :--- | :--- | :--- |
| **Logic** | **Go (Golang)** | Cloud Run, **gRPC + Protobuf**, Official Firebase Admin SDK |
| **Web** | **React 18 + Vite** | **gRPC-Web**, TailwindCSS, Zustand |
| **Mobile** | **React Native + Expo** | **gRPC + Protobuf**, Shared logic with Web, iOS/Android |
| **Database** | **Cloud SQL + Firestore** | Hybrid: SQL for PII/Vault, NoSQL for real-time |
| **Auth** | **Firebase Auth** | MFA (TOTP) Required |
| **Security** | **SOC 2 + KMS** | Software Keys (No HSM), AES-256 |
| **AI** | **Gemini (Vertex AI)** | The "Guidance Engine" |
| **E-Sign** | **OpenSign (Community)** | Self-Hosted (Google Cloud Run) |

> ⚠️ **REMOVED**: Rust/WASM (decommissioned — ADR-019), Hedera/HCS (never operationalized), CockroachDB (decommissioned — ADR-017)

## 4. Design Language: "Swiss Neo-Deco"

SirsiNexusApp uses the **Swiss Neo-Deco** design language across ALL packages — a fusion of Swiss Financial institutional clarity with Neo-Deco elegance.

*   **Aesthetic**: "Clean, Institutional, Elegant"
*   **Colors**:
    *   Accents: **Emerald** (`#059669`, `#10B981`) + **Gold** (`#C8A951`). These are ALWAYS the Sirsi brand colors.
    *   Backgrounds: Deep Emerald gradients (`#022c22` → `#000000`) for dark mode, clean whites for light mode.
    *   Success: Emerald Green (`#10B981`)
*   **Typography**:
    *   Headings: `Cinzel` (Serif, Uppercase tracking)
    *   Body: `Inter` (Sans-serif, clean)
*   **Components**: Glass panels, Gold borders, backdrop blur, sidebar navigation.
*   **Base Stylesheet**: `packages/sirsi-ui/styles/swiss-neo-deco.css`

> **FIREWALL**: Swiss Neo-Deco is the Sirsi brand language. **Royal Neo-Deco** (Royal Blue + Gold) belongs to **FinalWishes**. **Assiduous Modern** belongs to **Assiduous**. Never apply tenant design languages to this repo.

## 5. Architecture Rules
*   **Defense in Depth**: Every API endpoint must have AuthZ checks. PII is always encrypted at rest.
*   **Security Hub Control**: All MFA enforcement MUST be handled by the **Canonical MFA Hub** (`/mfa`) via `ProtectedRoute` redirection.
*   **Deep URL Sync**: The address bar MUST always reflect the current security phase.

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
