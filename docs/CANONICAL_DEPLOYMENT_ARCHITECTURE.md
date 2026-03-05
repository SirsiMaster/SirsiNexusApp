# 🔒 CANONICAL DEPLOYMENT ARCHITECTURE
**Status:** LOCKED - DO NOT DEVIATE  
**Last Updated:** March 4, 2026  
**Authority:** This document supersedes all other deployment documentation.

---

## 🎯 THE GOLDEN RULE

> **There is ONE source, ONE destination, and ONE project ID. No exceptions.**

---

## 📦 SOURCE OF TRUTH

### Sirsi Sign (Firebase Hosting)
| Category | Canonical Value |
|----------|-----------------|
| **Source Package** | `packages/sirsi-sign/` |
| **Build Output** | `packages/sirsi-sign/dist/` |
| **React Components (Legal)** | `packages/sirsi-sign/src/components/tabs/` |
| **Static Legal HTML** | `packages/sirsi-sign/public/finalwishes/contracts/` |

### Sirsi Admin Service (Cloud Run — ConnectRPC)
| Category | Canonical Value |
|----------|-----------------|
| **Source Package** | `packages/sirsi-admin-service/` |
| **Go Module** | `github.com/sirsimaster/sirsi-admin-service` |
| **Proto Definitions** | `proto/sirsi/admin/v2/` |
| **Generated Go Stubs** | `proto/gen/go/sirsi/admin/v2/` |
| **Generated TS Stubs** | `proto/gen/ts/sirsi/admin/v2/` → copied to `packages/sirsi-portal-app/src/gen/` |
| **Deploy Script** | `packages/sirsi-admin-service/deploy.sh` |
| **Dockerfile** | `packages/sirsi-admin-service/Dockerfile` |
| **Service URL** | `https://sirsi-admin-210890802638.us-central1.run.app` |
| **Cloud Run Service** | `sirsi-admin` (us-central1) |
| **Services Hosted** | `AdminService`, `TenantService`, `HypervisorService` |

### Legal Document Files (MUST STAY IN SYNC)

| File | Purpose | Location |
|------|---------|----------|
| **MasterAgreement.tsx** | Interactive MSA in React | `src/components/tabs/MasterAgreement.tsx` |
| **printable-msa.html** | Print-optimized MSA | `public/finalwishes/contracts/printable-msa.html` |
| **printable-msa.html** (root) | Alternate print MSA | `public/printable-msa.html` |

⚠️ **WARNING**: Any change to legal text MUST be applied to ALL THREE files to maintain parity.

---

## 🚀 DEPLOYMENT DESTINATION

| Category | Canonical Value |
|----------|-----------------|
| **Hosting Package** | `packages/sirsi-opensign/` |
| **Public Directory** | `packages/sirsi-opensign/public/` |
| **Firebase Config** | `packages/sirsi-opensign/firebase.json` |

---

## 🔥 FIREBASE PROJECT

| Category | Canonical Value |
|----------|-----------------|
| **Project ID** | `sirsi-nexus-live` |
| **Hosting Site Name** | `sirsi-sign` |
| **Live URL (Root)** | `https://sign.sirsi.ai/` |
| **Live URL (Contracts)** | `https://sign.sirsi.ai/contracts/finalwishes` |
| **Live URL (Vault)** | `https://sign.sirsi.ai/vault/$userId` |

⚠️ **CRITICAL**: The project ID is **`sirsi-nexus-live`**, NOT `sirsi-opensign`. The name `sirsi-opensign` is only the package folder name.

---

## 🔄 DEPLOYMENT PIPELINE

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: BUILD                                                  │
│  Location: packages/sirsi-sign/                      │
│  Command:  npm run build                                        │
│  Output:   dist/index.html, dist/assets/index-*.js|css          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: SYNC                                                   │
│  From: packages/sirsi-sign/dist/                     │
│  To:   packages/sirsi-opensign/public/                          │
│                                                                 │
│  Files copied:                                                  │
│    dist/assets/*.js    → public/assets/                         │
│    dist/assets/*.css   → public/assets/                         │
│    dist/index.html     → public/partnership/finalwishes/        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: DEPLOY                                                 │
│  Location: packages/sirsi-opensign/                             │
│  Command:  firebase deploy --only hosting --project sirsi-nexus-live
│  Target:   https://sirsi-sign.web.app                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: GIT PUSH                                               │
│  Commands: git add -A && git commit -m "..." && git push        │
└─────────────────────────────────────────────────────────────────┘
```

### Cloud Run — sirsi-admin (ConnectRPC Backend)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: PROTO COMPILE (if .proto changed)                      │
│  Location: proto/                                               │
│  Command:  npx buf generate                                     │
│  Output:   proto/gen/go/ + proto/gen/ts/                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: COPY TS STUBS                                          │
│  From: proto/gen/ts/sirsi/admin/v2/                             │
│  To:   packages/sirsi-portal-app/src/gen/sirsi/admin/v2/        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: DEPLOY                                                 │
│  Location: packages/sirsi-admin-service/                        │
│  Command:  ./deploy.sh                                          │
│  ⚠️  Uses `yes |` to prevent gcloud stdin abort                 │
│  Target:   https://sirsi-admin-210890802638.us-central1.run.app │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: GIT PUSH                                               │
│  Commands: git add -A && git commit -m "..." && git push        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📜 DEPLOYMENT METHODS

### Option 1: Manual Script (RECOMMENDED)
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp
bash deploy-contracts.sh
```

### Option 2: Step-by-Step Manual
```bash
# 1. Build
cd packages/sirsi-sign && npm run build

# 2. Deploy (sync happens automatically via sirsi-opensign config)
cd ../sirsi-opensign
firebase deploy --only hosting --project sirsi-nexus-live

# 3. Commit & Push
cd ../..
git add -A && git commit -m "deploy: update contracts" && git push
```

### Option 3: GitHub Actions
Automatically triggers on push to `main` when files change in:
- `packages/sirsi-sign/**`
- `packages/sirsi-opensign/**`

**Required Secret:** `FIREBASE_SERVICE_ACCOUNT_SIRSI_NEXUS_LIVE`

---

## ⚠️ COMMON PITFALLS (DO NOT REPEAT)

### 1. Wrong Project ID
❌ `firebase deploy --project sirsi-opensign`  
✅ `firebase deploy --project sirsi-nexus-live`

### 2. Editing Wrong File
❌ Editing only one MSA file and leaving others stale  
✅ Edit ALL legal document files in sync (MasterAgreement.tsx + both printable-msa.html files)

### 3. Skipping the Sync Step
❌ Deploying sirsi-opensign without first building sirsi-sign  
✅ Always `npm run build` first, then deploy

### 4. Skipping Git Push
❌ Deploying to Firebase but not pushing to GitHub  
✅ Always push changes after successful deployment

---

## 🧪 VERIFICATION CHECKLIST

After every deployment:
- [ ] Visit https://sign.sirsi.ai/contracts/finalwishes
- [ ] Open DevTools → Network tab → Verify no 404 errors
- [ ] Check that legal content matches what was edited
- [ ] Run `git status` to confirm clean working tree
- [ ] Verify push succeeded: `git log origin/main -1`

---

## 📁 FILE STRUCTURE (LOCKED)

```
SirsiNexusApp/
├── packages/
│   ├── sirsi-sign/              ← 🔵 REACT SOURCE (Sirsi Sign)
│   │   ├── src/components/tabs/
│   │   │   └── MasterAgreement.tsx          ← LEGAL CONTENT
│   │   ├── public/finalwishes/contracts/
│   │   │   └── printable-msa.html           ← LEGAL PRINT VERSION
│   │   ├── dist/                            ← BUILD OUTPUT
│   │   └── package.json
│   │
│   ├── sirsi-opensign/           ← 🟢 FIREBASE HOSTING (Sirsi Sign dest)
│   │   ├── public/               ← DEPLOYED TO FIREBASE
│   │   └── firebase.json
│   │
│   ├── sirsi-admin-service/      ← 🟠 CLOUD RUN (ConnectRPC backend)
│   │   ├── main.go               ← Go handlers (Admin/Tenant/Hypervisor)
│   │   ├── Dockerfile            ← Multi-stage: Go 1.24 → Alpine 3.19
│   │   ├── deploy.sh             ← CANONICAL DEPLOY SCRIPT
│   │   ├── vendor/               ← Vendored Go dependencies
│   │   ├── go.mod                ← ⚠️ Must stay ≤ go 1.24.0
│   │   └── settings.json         ← Runtime config
│   │
│   └── sirsi-portal-app/         ← 🔵 REACT ADMIN PORTAL
│       └── src/gen/              ← Generated TS stubs (from proto)
│
├── proto/                        ← 🟣 PROTOBUF DEFINITIONS
│   ├── sirsi/admin/v2/           ← .proto service definitions
│   ├── gen/go/                   ← Generated Go stubs
│   └── gen/ts/                   ← Generated TS stubs
│
├── deploy-contracts.sh           ← Sirsi Sign deploy script
├── .github/workflows/
│   └── deploy-contracts.yml      ← CI/CD WORKFLOW
│
└── docs/
    └── CANONICAL_DEPLOYMENT_ARCHITECTURE.md  ← THIS FILE (LOCKED)
```

---

## 🆘 TROUBLESHOOTING

### "Failed to get Firebase project"
```bash
firebase projects:list
# Verify sirsi-nexus-live is listed
firebase login --reauth
```

### "Permission denied" on script
```bash
bash deploy-contracts.sh   # Use bash instead of ./
```

### "Stale content on live site"
```bash
# Clear browser cache or use incognito mode
# Verify with curl:
curl -s https://sirsi-sign.web.app/partnership/finalwishes | head -30
```

### Cloud Run: "Aborted by user"
`gcloud run deploy --source` requires persistent stdin during the multi-minute build.
```bash
# ❌ These all abort mid-build:
gcloud run deploy sirsi-admin --source . --quiet
echo "Y" | gcloud run deploy sirsi-admin --source .

# ✅ Use the deploy script (handles this automatically):
cd packages/sirsi-admin-service && ./deploy.sh

# ✅ Or manually with `yes |`:
yes | gcloud run deploy sirsi-admin --source . --region us-central1 ...
```

### Cloud Run: "go.mod requires go >= 1.25.5"
Docker Hub only has `golang:1.24-alpine`. Both `go.mod` files must be ≤ 1.24.0:
```
packages/sirsi-admin-service/go.mod   → go 1.24.0
proto/gen/go/go.mod                   → go 1.24.0
```

### Cloud Run: "replaced by ../../proto/gen/go: no such file"
The `replace` directive in go.mod references a parent directory outside the Docker build context.
```bash
cd packages/sirsi-admin-service
GOWORK=off GOTOOLCHAIN=local go mod tidy
GOWORK=off GOTOOLCHAIN=local go mod vendor
```

### Cloud Run: "No module named 'grpc'"
gcloud's Python interpreter is missing the grpcio package.
```bash
pip3 install grpcio
```

---

**🔒 THIS ARCHITECTURE IS LOCKED. ALL FUTURE DEPLOYMENTS MUST FOLLOW THIS DOCUMENT.**

*Signed: Antigravity Agent, March 4, 2026*

