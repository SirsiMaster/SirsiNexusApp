# 🔒 CANONICAL DEPLOYMENT ARCHITECTURE
**Status:** LOCKED - DO NOT DEVIATE  
**Last Updated:** February 2, 2026  
**Authority:** This document supersedes all other deployment documentation.

---

## 🎯 THE GOLDEN RULE

> **There is ONE source, ONE destination, and ONE project ID. No exceptions.**

---

## 📦 SOURCE OF TRUTH

| Category | Canonical Value |
|----------|-----------------|
| **Source Package** | `packages/finalwishes-contracts/` |
| **Build Output** | `packages/finalwishes-contracts/dist/` |
| **React Components (Legal)** | `packages/finalwishes-contracts/src/components/tabs/` |
| **Static Legal HTML** | `packages/finalwishes-contracts/public/finalwishes/contracts/` |

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
| **Live URL (Root)** | `https://sirsi-sign.web.app/` |
| **Live URL (Contracts)** | `https://sirsi-sign.web.app/partnership/finalwishes` |

⚠️ **CRITICAL**: The project ID is **`sirsi-nexus-live`**, NOT `sirsi-opensign`. The name `sirsi-opensign` is only the package folder name.

---

## 🔄 DEPLOYMENT PIPELINE

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: BUILD                                                  │
│  Location: packages/finalwishes-contracts/                      │
│  Command:  npm run build                                        │
│  Output:   dist/index.html, dist/assets/index-*.js|css          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: SYNC                                                   │
│  From: packages/finalwishes-contracts/dist/                     │
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
cd packages/finalwishes-contracts && npm run build

# 2. Deploy (sync happens automatically via sirsi-opensign config)
cd ../sirsi-opensign
firebase deploy --only hosting --project sirsi-nexus-live

# 3. Commit & Push
cd ../..
git add -A && git commit -m "deploy: update contracts" && git push
```

### Option 3: GitHub Actions
Automatically triggers on push to `main` when files change in:
- `packages/finalwishes-contracts/**`
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
❌ Deploying sirsi-opensign without first building finalwishes-contracts  
✅ Always `npm run build` first, then deploy

### 4. Skipping Git Push
❌ Deploying to Firebase but not pushing to GitHub  
✅ Always push changes after successful deployment

---

## 🧪 VERIFICATION CHECKLIST

After every deployment:
- [ ] Visit https://sirsi-sign.web.app/partnership/finalwishes
- [ ] Open DevTools → Network tab → Verify no 404 errors
- [ ] Check that legal content matches what was edited
- [ ] Run `git status` to confirm clean working tree
- [ ] Verify push succeeded: `git log origin/main -1`

---

## 📁 FILE STRUCTURE (LOCKED)

```
SirsiNexusApp/
├── packages/
│   ├── finalwishes-contracts/    ← 🔵 REACT SOURCE
│   │   ├── src/
│   │   │   └── components/
│   │   │       └── tabs/
│   │   │           └── MasterAgreement.tsx  ← LEGAL CONTENT
│   │   ├── public/
│   │   │   ├── finalwishes/contracts/
│   │   │   │   └── printable-msa.html       ← LEGAL PRINT VERSION
│   │   │   └── printable-msa.html           ← LEGAL PRINT VERSION (alt)
│   │   ├── dist/                            ← BUILD OUTPUT
│   │   └── package.json
│   │
│   └── sirsi-opensign/           ← 🟢 FIREBASE HOSTING (DESTINATION)
│       ├── public/               ← DEPLOYED TO FIREBASE
│       └── firebase.json
│
├── deploy-contracts.sh           ← DEPLOYMENT SCRIPT
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

---

**🔒 THIS ARCHITECTURE IS LOCKED. ALL FUTURE DEPLOYMENTS MUST FOLLOW THIS DOCUMENT.**

*Signed: Antigravity Agent, February 2, 2026*
