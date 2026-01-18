# 🚨 CRITICAL: One-Night Repository Merge Operation Plan

## ⚠️ URGENT: SirsiMaster.github.io + SirsiNexusApp = Unified Platform

**OPERATION WINDOW: 8 HOURS MAXIMUM**  
**RISK LEVEL: CRITICAL**  
**DOWNTIME TOLERANCE: ZERO**

---

## Executive Summary

This document outlines the critical one-night operation to merge `SirsiMaster.github.io` (frontend/portal) with `SirsiNexusApp` (backend/core) into a single unified repository. This is a high-complexity operation that must be executed flawlessly in a single night to avoid service disruption.

## Pre-Operation Checklist (Complete BEFORE Night Of)

### 1. Backups (T-minus 24 hours)
```bash
# Full backup of both repositories
mkdir -p ~/sirsi-merge-backup-$(date +%Y%m%d)
cd ~/sirsi-merge-backup-$(date +%Y%m%d)

# Clone with full history
git clone --mirror git@github.com:SirsiMaster/SirsiMaster.github.io.git
git clone --mirror git@github.com:SirsiMaster/SirsiNexusApp.git

# Backup GitHub Pages settings
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/SirsiMaster/SirsiMaster.github.io/pages > pages-settings.json

# Backup all GitHub secrets
gh secret list --repo SirsiMaster/SirsiMaster.github.io > github-io-secrets.txt
gh secret list --repo SirsiMaster/SirsiNexusApp > nexus-app-secrets.txt
```

### 2. Dependencies Audit
- [ ] List all npm packages from both repos
- [ ] Identify version conflicts
- [ ] Prepare unified package.json
- [ ] Test dependency installation

### 3. DNS Preparation
- [ ] Document current DNS settings
- [ ] Prepare new DNS records
- [ ] Have GoDaddy credentials ready
- [ ] Cloudflare backup plan ready

## THE OPERATION: Hour-by-Hour Timeline

### HOUR 0-1: PREPARATION & LOCKDOWN
```bash
# 1. Set maintenance mode on sirsi.ai
echo "Maintenance in progress. Back shortly." > /tmp/maintenance.html
# Deploy maintenance page

# 2. Lock both repositories
gh repo edit SirsiMaster/SirsiMaster.github.io --enable-auto-merge=false
gh repo edit SirsiMaster/SirsiNexusApp --enable-auto-merge=false

# 3. Create new unified repository
gh repo create SirsiMaster/SirsiUnified --private --description "Unified Sirsi Platform"

# 4. Final backup
./backup-everything.sh
```

### HOUR 1-3: REPOSITORY MERGE
```bash
# 1. Initialize unified repo
mkdir SirsiUnified
cd SirsiUnified
git init

# 2. Add both repositories as remotes
git remote add github-io git@github.com:SirsiMaster/SirsiMaster.github.io.git
git remote add nexus-app git@github.com:SirsiMaster/SirsiNexusApp.git

# 3. Fetch all branches and tags
git fetch github-io --tags
git fetch nexus-app --tags

# 4. Merge frontend (github.io) first
git merge --allow-unrelated-histories github-io/main -m "Merge frontend from SirsiMaster.github.io"

# 5. Create frontend directory structure
mkdir -p frontend
git mv -k * frontend/ 2>/dev/null || true
git mv .* frontend/ 2>/dev/null || true
git commit -m "Restructure: Move frontend to frontend/"

# 6. Merge backend (SirsiNexusApp)
git merge --allow-unrelated-histories nexus-app/main -m "Merge backend from SirsiNexusApp"

# 7. Create backend directory structure  
mkdir -p backend
# Move all nexus-app files to backend/
git commit -m "Restructure: Move backend to backend/"
```

### HOUR 3-4: RESTRUCTURE TO MONOREPO
```
Target Structure:
SirsiUnified/
├── apps/
│   ├── web/              (frontend - from github.io)
│   │   ├── sirsinexusportal/
│   │   ├── index.html
│   │   └── ...
│   ├── api/              (backend - from SirsiNexusApp)
│   │   ├── src/
│   │   ├── server.js
│   │   └── ...
│   └── developer/        (new developer platform)
├── packages/
│   ├── sdk/              (Sirsi SDK)
│   ├── ui/               (Shared UI components)
│   ├── core/             (Core libraries)
│   └── config/           (Shared configs)
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── scripts/
├── docs/
├── .github/
│   ├── workflows/
│   └── actions/
├── package.json          (Root package.json for workspaces)
├── turbo.json           (Turborepo config)
├── CNAME                (For GitHub Pages)
└── README.md
```

```bash
# Restructure script
./scripts/restructure-to-monorepo.sh

# Update all import paths
./scripts/update-import-paths.sh

# Verify structure
tree -L 3 -I 'node_modules|.git'
```

### HOUR 4-5: CI/CD & DEPLOYMENT SETUP
```yaml
# .github/workflows/deploy.yml
name: Deploy Unified Platform
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        run: |
          cp -r apps/web/* ./docs/
          echo "sirsi.ai" > ./docs/CNAME
      
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy API
        run: |
          # Deploy to cloud provider
          
  deploy-developer:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Developer Platform
        run: |
          # Deploy developer portal
```

### HOUR 5-6: GITHUB PAGES MIGRATION
```bash
# 1. Configure GitHub Pages for new repo
gh api repos/SirsiMaster/SirsiUnified/pages \
  --method POST \
  --field source='{"branch":"main","path":"/docs"}' \
  --field cname="sirsi.ai"

# 2. Update DNS to point to new repo
# In GoDaddy:
# CNAME www -> sirsimaster.github.io
# A @ -> GitHub Pages IPs

# 3. Verify HTTPS certificate
curl -I https://sirsi.ai

# 4. Test all routes
./scripts/test-all-routes.sh
```

### HOUR 6-7: TESTING & VALIDATION
```bash
# 1. Run comprehensive tests
npm run test:all

# 2. Check all endpoints
./scripts/health-check-all.sh

# 3. Verify Firebase connections
firebase projects:list
firebase deploy --only hosting

# 4. Test authentication flows
npm run test:auth

# 5. Verify developer platform
npm run test:developer-platform

# 6. Load testing
artillery run load-test.yml
```

### HOUR 7-8: CUTOVER & CLEANUP
```bash
# 1. Update all external references
./scripts/update-external-refs.sh

# 2. Archive old repositories
gh repo archive SirsiMaster/SirsiMaster.github.io
gh repo archive SirsiMaster/SirsiNexusApp

# 3. Make unified repo public
gh repo edit SirsiMaster/SirsiUnified --visibility public

# 4. Update documentation
./scripts/update-all-docs.sh

# 5. Remove maintenance mode
rm /tmp/maintenance.html

# 6. Announce completion
echo "✅ Migration Complete!"
```

## Rollback Plan (If Things Go Wrong)

### Immediate Rollback (< 5 minutes)
```bash
# 1. Revert DNS
# Point back to original github.io

# 2. Unarchive repositories  
gh repo unarchive SirsiMaster/SirsiMaster.github.io
gh repo unarchive SirsiMaster/SirsiNexusApp

# 3. Restore from backup
./scripts/emergency-restore.sh
```

## Critical Scripts Required

### 1. backup-everything.sh
```bash
#!/bin/bash
# Complete backup of all repos, configs, secrets
```

### 2. restructure-to-monorepo.sh
```bash
#!/bin/bash
# Automated restructuring to monorepo format
```

### 3. update-import-paths.sh
```bash
#!/bin/bash
# Update all import paths for new structure
```

### 4. test-all-routes.sh
```bash
#!/bin/bash
# Test every single route in the application
```

### 5. emergency-restore.sh
```bash
#!/bin/bash
# Emergency restoration from backup
```

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Git history loss | Low | Critical | Full backup before operation |
| DNS propagation delay | Medium | High | Pre-stage DNS changes |
| GitHub Pages downtime | Medium | Critical | Parallel deployment ready |
| Import path errors | High | Medium | Automated path updater |
| CI/CD failure | Medium | High | Manual deployment ready |
| Firebase disconnect | Low | Critical | Keep existing project |

## Success Criteria

- [ ] Zero downtime for sirsi.ai
- [ ] All Git history preserved
- [ ] All features functional
- [ ] Developer platform operational
- [ ] CI/CD pipelines working
- [ ] Authentication working
- [ ] Firebase connected
- [ ] DNS resolved correctly
- [ ] HTTPS certificate valid
- [ ] All tests passing

## Emergency Contacts

- GitHub Support: [Priority Support Line]
- GoDaddy DNS: [24/7 Support]
- Firebase/Google Cloud: [Support Ticket]
- Cloudflare (Backup CDN): [Emergency Line]

## Post-Migration Checklist

- [ ] Monitor error logs for 24 hours
- [ ] Check all analytics
- [ ] Verify all webhooks
- [ ] Update all documentation
- [ ] Notify all stakeholders
- [ ] Create post-mortem document
- [ ] Update disaster recovery plan

---

**⚠️ REMEMBER: This is a ONE-SHOT operation. There is NO room for error.**

**Required Team:**
- Lead Developer (You)
- DevOps Engineer (Backup)
- Someone monitoring sirsi.ai continuously

**Start Time:** [PLANNED DATE] 10:00 PM PST  
**End Time:** [PLANNED DATE] 6:00 AM PST  
**Point of No Return:** Hour 4 (After monorepo restructure)

---

## Final Command Sequence (Copy-Paste Ready)
```bash
# THE NIGHT OF - FINAL EXECUTION
./pre-flight-check.sh && \
./backup-everything.sh && \
./merge-repositories.sh && \
./restructure-to-monorepo.sh && \
./update-all-paths.sh && \
./deploy-unified.sh && \
./test-everything.sh && \
./cutover.sh && \
echo "🎉 MIGRATION COMPLETE - sirsi.ai is LIVE on unified platform!"
```

**Document Version:** 1.0.0  
**Last Updated:** September 10, 2025  
**Status:** READY FOR EXECUTION  
**Approved By:** [REQUIRES APPROVAL]
