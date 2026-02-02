# ⚠️ DEPRECATED - DO NOT USE
**This document is deprecated as of February 2, 2026.**

## 👉 Use the Canonical Document Instead:
**`docs/CANONICAL_DEPLOYMENT_ARCHITECTURE.md`**

That document is the **single source of truth** for all deployment operations.

---

# (OLD) Deployment Continuation Prompt
**Date:** February 2, 2026  
**Status:** ⚠️ DEPRECATED - SEE ABOVE  
**Priority:** CRITICAL

---

## 🎯 THE MISSION

Deploy the **`finalwishes-contracts`** React application to the live Firebase Hosting site at:
- **Primary URL:** `https://sirsi-sign.web.app/partnership/finalwishes`
- **Root URL:** `https://sirsi-sign.web.app/`

---

## 🚨 ISSUE #1: STUCK TERMINAL PROCESS (MUST FIX FIRST)

### The Problem
There is a **stuck gcloud secrets command** that has been running for **115+ hours**:

```
STRIPE_KEY=$(gcloud secrets versions access latest --secret=STRIPE_SECRET_KEY...
Location: /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-opensign/services/contracts-grpc
Duration: 115+ hours (since ~Jan 28)
```

### Why This Matters
This stuck process is likely:
1. **Blocking terminal I/O** - Commands return empty stdout
2. **Holding resources** - May be causing shell environment issues
3. **Preventing file operations** - Copy commands fail silently

### The Fix
After IDE reboot, the stuck process should be killed. If it persists:

```bash
# Find and kill the stuck gcloud process
ps aux | grep "gcloud secrets" | grep -v grep
# Kill by PID
kill -9 <PID>
```

Or use Activity Monitor to find and terminate any stuck `gcloud` or `zsh` processes.

---

## 🚨 ISSUE #2: DEPLOYMENT SYNC NOT WORKING

### Root Cause
The **sync step is failing** - newly built assets from `finalwishes-contracts/dist/` are NOT being copied to `sirsi-opensign/public/` before Firebase deployment.

### Symptoms
1. ✅ React app builds successfully with new hash filenames (e.g., `index-BY-MypvW.js`)
2. ❌ Live site still references OLD hash filenames (e.g., `index-DfLhx1hY.js`)
3. ❌ The `sirsi-opensign/public/assets/` folder has stale files
4. ❌ Copy commands execute but files don't appear (due to Issue #1)

### Expected File Flow
```
1. Build: finalwishes-contracts/dist/  (npm run build)
         ↓
2. Sync:  Copy dist/assets/* → sirsi-opensign/public/assets/
          Copy dist/index.html → sirsi-opensign/public/partnership/finalwishes/index.html
         ↓
3. Deploy: firebase deploy --only hosting --project sirsi-nexus-live
         ↓
4. Live:  https://sirsi-sign.web.app/
```

---

## 🏗️ ARCHITECTURE OVERVIEW

```
SirsiNexusApp/
├── packages/
│   ├── finalwishes-contracts/     # 🔵 React App (Vite) - THE SOURCE
│   │   ├── src/                   # React components
│   │   ├── dist/                  # Build output (after npm run build)
│   │   │   ├── index.html
│   │   │   └── assets/
│   │   │       ├── index-BY-MypvW.js      # Current JS bundle
│   │   │       └── index-ChrPwQpC.css     # Current CSS bundle
│   │   └── package.json
│   │
│   └── sirsi-opensign/            # 🟢 Firebase Hosting Target - THE DESTINATION
│       ├── public/                # What gets deployed to Firebase
│       │   ├── index.html         # Root page
│       │   ├── assets/            # Must receive synced JS/CSS
│       │   └── partnership/
│       │       └── finalwishes/
│       │           └── index.html # SPA entry point
│       ├── services/
│       │   └── contracts-grpc/    # ⚠️ Location of stuck terminal
│       └── firebase.json          # Hosting configuration
│
├── deploy-contracts.sh            # Manual deployment script
└── .github/workflows/
    └── deploy-contracts.yml       # GitHub Actions (needs secrets)
```

---

## ✅ STEP-BY-STEP RECOVERY PROCEDURE

### Prerequisites (After IDE Reboot)
1. Verify terminal is responsive: `echo "Hello"` should print "Hello"
2. Verify no stuck processes: `ps aux | grep gcloud | grep -v grep`

### Step 1: Build the React App
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/packages/finalwishes-contracts
npm run build
ls -la dist/assets/
```
**Expected:** See `index-BY-MypvW.js` and `index-ChrPwQpC.css` (or new hashes)

### Step 2: Sync Files to Hosting Directory
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-opensign

# Clear old hashed assets
rm -f public/assets/index-*.js public/assets/index-*.css

# Copy new assets (use explicit filenames from Step 1)
cp ../finalwishes-contracts/dist/assets/index-*.js public/assets/
cp ../finalwishes-contracts/dist/assets/index-*.css public/assets/

# Create partnership route and copy SPA entry point
mkdir -p public/partnership/finalwishes
cp ../finalwishes-contracts/dist/index.html public/partnership/finalwishes/index.html

# Verify the sync worked
ls -la public/assets/index-*
cat public/partnership/finalwishes/index.html | head -20
```

### Step 3: Deploy to Firebase
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-opensign
firebase deploy --only hosting --project sirsi-nexus-live
```

### Step 4: Verify Deployment
- Open: https://sirsi-sign.web.app/partnership/finalwishes
- Check DevTools Network tab:
  - All JS/CSS should load with 200 status
  - No 404 errors for asset files
  - File hashes should match what was built

### Step 5: Git Push
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp
git add -A
git status
git commit -m "chore: sync React build artifacts to hosting directory"
git push origin main
```

---

## � DEPLOYMENT SCRIPT (Alternative)

**File:** `/Users/thekryptodragon/Development/SirsiNexusApp/deploy-contracts.sh`

```bash
#!/bin/bash
set -e

echo "=== Sirsi Nexus App - Contract Deployment Script ==="
cd "$(dirname "$0")"

# Step 1: Build
echo "Step 1: Building finalwishes-contracts..."
cd packages/finalwishes-contracts
npm run build
echo "✓ Build complete"

# Step 2: Sync
echo "Step 2: Syncing build artifacts to sirsi-opensign..."
cd ../sirsi-opensign
rm -f public/assets/index-*.js public/assets/index-*.css
cp ../finalwishes-contracts/dist/assets/index-*.js public/assets/
cp ../finalwishes-contracts/dist/assets/index-*.css public/assets/
mkdir -p public/partnership/finalwishes
cp ../finalwishes-contracts/dist/index.html public/partnership/finalwishes/index.html
echo "✓ Sync complete"

# Step 3: Deploy
echo "Step 3: Deploying to Firebase Hosting..."
firebase deploy --only hosting --project sirsi-nexus-live

echo ""
echo "=== Deployment Complete ==="
echo "Live at: https://sirsi-sign.web.app/partnership/finalwishes"
```

Run with: `./deploy-contracts.sh`

---

## 🔑 FIREBASE CONFIGURATION

| Key | Value |
|-----|-------|
| **Project ID** | `sirsi-nexus-live` |
| **Hosting Site** | `sirsi-sign.web.app` |
| **Config Location** | `packages/sirsi-opensign/firebase.json` |

---

## 📋 GEMINI.md RULES TO REMEMBER

- **Rule 0**: Minimal Code - If layering fixes on hacks, DELETE AND REWRITE
- **Rule 2**: Implement, Don't Instruct - Build working code end-to-end
- **Rule 3**: Test in Browser - Verify zero errors in DevTools
- **Rule 5**: Always Push & Verify - Push changes to production via git
- **Stack**: React 18 + Vite, Firebase Hosting
- **Test Credentials**: `cylton@sirsi.ai` / `Cylton Collymore`

---

## 🆘 TROUBLESHOOTING

### Terminal Not Responding
```bash
# Kill any stuck processes
pkill -f "gcloud secrets"
# Or find specific PIDs
ps aux | grep -E "gcloud|stripe" | grep -v grep
```

### Firebase Permission Error
```bash
firebase login --reauth
```

### NPM Build Fails
```bash
cd packages/finalwishes-contracts
rm -rf node_modules
npm install
npm run build
```

### Can't Find Firebase Project
```bash
firebase projects:list
# Look for sirsi-opensign
```

### GitHub Actions Failing
The GitHub Actions workflow needs `FIREBASE_SERVICE_ACCOUNT_SIRSI_NEXUS` secret.
For now, use manual deployment via `deploy-contracts.sh`.

---

## 📊 DIAGNOSTIC COMMANDS

```bash
# Check what's currently deployed vs what should be
echo "=== Source (should deploy) ===" 
ls -la packages/finalwishes-contracts/dist/assets/index-*

echo "=== Destination (staging) ==="
ls -la packages/sirsi-opensign/public/assets/index-*

echo "=== Check for stuck processes ==="
ps aux | grep -E "gcloud|npm|node" | head -10
```

---

**END OF CONTINUATION PROMPT**

*Reboot IDE, then paste this to a new Gemini conversation to resume.*
