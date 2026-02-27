# Deployment Guide — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Deployment Architecture
See `CANONICAL_DEPLOYMENT_ARCHITECTURE.md` for the definitive source/destination mapping.

### Quick Reference
| Component | Source | Destination | URL |
|-----------|--------|-------------|-----|
| Sirsi Sign | `packages/sirsi-sign/` | `packages/sirsi-opensign/public/` | `sign.sirsi.ai` |
| Sirsi Portal | `packages/sirsi-portal/` | Firebase Hosting | `portal.sirsi.ai` |
| Pitch Deck | `packages/sirsi-portal/pitchdeck.html` | Firebase Hosting | (same as portal) |
| gRPC Services | `packages/sngp/` | Cloud Run | (internal) |

### Firebase Project
- **Project ID**: `sirsi-nexus-live`
- **Hosting**: Firebase Hosting (multi-site)
- **Functions**: Cloud Functions for Firebase

## Deployment Steps

### 1. Build
```bash
cd packages/sirsi-sign && npm run build
```

### 2. Sync to Hosting Directory
```bash
rsync -av --delete packages/sirsi-sign/dist/ packages/sirsi-opensign/public/
```

### 3. Deploy
```bash
firebase deploy --only hosting:sirsi-sign --project sirsi-nexus-live
```

### 4. Verify
- Check `https://sign.sirsi.ai/` loads correctly
- Verify DevTools shows zero errors
- Confirm CSP headers are intact

## CI/CD
GitHub Actions handles automated deployment on push to `main`. See `.github/workflows/` for pipeline definitions.
