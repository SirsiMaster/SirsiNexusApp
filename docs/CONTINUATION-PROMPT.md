# SirsiNexusApp — Continuation Prompt

**Version:** v0.9.4-alpha  
**Date:** March 7, 2026  
**Last Commit:** 50a9a20 (chore(docs): Sprint D1 — archive 18 stale docs, delete 5 dead files)  
**Tag:** v0.9.4-alpha (pending)

---

## Identity & Context

You are working on **SirsiNexusApp** — the Sirsi Technologies master monorepo. Read `SIRSI_RULES.md` (v7.0.0, synced to `GEMINI.md` / `CLAUDE.md`) before writing any code. It contains all operational directives, design tokens, and architectural constraints.

- **GitHub**: `https://github.com/SirsiMaster/SirsiNexusApp`
- **Local**: `/Users/thekryptodragon/Development/SirsiNexusApp`
- **Design Language**: Swiss Neo-Deco (Emerald `#059669` + Gold `#C8A951`, Cinzel + Inter)
- **Stack**: Go + ConnectRPC | React 19 + Vite 7 | Protobuf ES v2 | AlloyDB AI + Firestore | Firebase Auth
- **Master Blueprint**: `docs/SIRSI_MASTER_BLUEPRINT.md` — the canonical go-forward plan

---

## What Was Just Completed (Documentation Sprint D1-D3)

### Sprint D1 — Repo Hygiene ✅
- Archived 18 stale/completed documents to `docs/archive/`
- Deleted 5 dead files (debug, test, scratch artifacts)
- Created `docs/archive/README.md` with archival manifest
- Pushed to main: commit `50a9a20`

### Sprint D2/D3 — Canon Alignment ✅
- Rewrote `docs/PROJECT_SCOPE.md` for v4 (8 patents, multi-platform, dual-shard)
- Reserved ADR-032 through ADR-042 in `docs/ADR-INDEX.md`
- Added supersession note to ADR-019 (Rust re-adopted for native clients)
- Updated `SIRSI_RULES.md` to v7.0.0:
  - Added `docs/SIRSI_MASTER_BLUEPRINT.md` as canonical source #31
  - Added Rule 26 (Documentation Firewall)
  - Updated tech stack (Rust native clients, AlloyDB AI, Quad-Model Engine, Distributed Ledger)
- Canonized Master Blueprint as `docs/SIRSI_MASTER_BLUEPRINT.md`
- Updated `docs/DATA_MODEL.md` with Knowledge Graph schema (PLANNED)
- Created agent handoff prompts for parallel documentation work

---

## Current Priority: Epoch 1 — Ship the Business

### Sprint 0 — Repo Hygiene (Immediate)

| # | Task | Est |
|:--|:-----|:----|
| 0.1 | Triage PR #20 (OTel SDK 1.39→1.40) — merge if safe | 20m |
| 0.2 | Triage PR #19 (npm 3-update) — review, test build, merge or close | 30m |
| 0.3 | Triage PR #18 (pitch-deck 4-update) — merge if build passes | 20m |
| 0.4 | Close PR #9 (pip analytics-platform) — decommissioned | 5m |
| 0.5 | Remove dead deps (@sendgrid/mail, sendgrid-go) | 15m |
| 0.6 | npm audit fix across all packages | 15m |
| 0.7 | Verify clean CI pass | 10m |
| 0.8 | Version bump → v0.9.4-alpha | 10m |

### Sprint 1 — Google-Native Email + SQL Persistence
- Firebase Trigger Email Extension (replace SendGrid/nodemailer)
- Secrets → Secret Manager migration
- `signing_sql.go` + `tenant_sql.go` for AlloyDB persistence
- Wire AdminService to Firebase Auth (live user reads)

### Sprint 2 — Client & Investor Portals
- Client Portal (`/client-portal`) — contracts, payments, vault
- Investor Portal (`/investor-portal`) — KPI metrics, committee view
- Role-based routing from Firebase Auth custom claims
- Sidebar filteredby role

### Sprint 3 — Onboarding + Payment E2E
- 5-step onboarding wizard (plan → company → Stripe → GitHub → success)
- Stripe webhook verification
- Tenant management UI
- Version → v0.9.5-alpha

---

## Key File Inventory

| File | Purpose |
|:-----|:--------|
| `SIRSI_RULES.md` | Operational directives (v7.0.0) |
| `docs/SIRSI_MASTER_BLUEPRINT.md` | **Master Blueprint v4 — canonical go-forward plan** |
| `docs/PROJECT_SCOPE.md` | Project scope (v4.0.0) |
| `docs/ADR-INDEX.md` | ADR registry (37 ADRs, ADR-032-042 reserved) |
| `packages/sirsi-portal-app/` | React admin portal (primary delivery) |
| `packages/sirsi-admin-service/` | Go ConnectRPC backend |
| `proto/` | Protobuf definitions (single source of truth) |
| `packages/sirsi-sign/` | E-signing + payment workflows |
| `.github/workflows/ci-validate.yml` | CI QA gate |

## Deployment Commands

```bash
# React Portal (primary)
cd packages/sirsi-portal-app && npm run build
firebase deploy --only hosting:sirsi-ai --project sirsi-nexus-live

# Go Backend
cd packages/sirsi-admin-service
gcloud run deploy sirsi-admin --source . --region us-central1 --project sirsi-nexus-live

# Sirsi Sign
cd packages/sirsi-sign && npm run build
firebase deploy --only hosting:sirsi-sign --project sirsi-nexus-live
```

---

## Agent Handoff Prompts (For Parallel Work)

Four prompts are ready for delegation to other agents:
1. **Pitch Deck Agent** — update 16 slides for 8 patents, multi-platform, direct-to-metal
2. **Landing Page Agent** — React hero, feature grid, patent badges, platform strip
3. **Technical Deep Dive Agent** — update TECHNICAL_DESIGN.md with IP firewall
4. **Investor Summary Agent** — rewrite for 8 patents, verify financials

See artifact: `agent_handoff_prompts.md`

---

**Next Step: Execute Sprint 0 (repo hygiene), then Sprint 1 (email + SQL).**
