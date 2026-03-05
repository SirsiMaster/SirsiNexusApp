# Deployment Guide — SirsiNexusApp

**Version:** 2.0.0  
**Date:** March 4, 2026  
**Authority:** Canonical deployment procedures for all SirsiNexusApp services.

---

## Deployment Architecture
See `CANONICAL_DEPLOYMENT_ARCHITECTURE.md` for the definitive source/destination mapping.

### Quick Reference
| Component | Source | Destination | URL | Method |
|-----------|--------|-------------|-----|--------|
| Sirsi Sign | `packages/sirsi-sign/` | `packages/sirsi-opensign/public/` | `sign.sirsi.ai` | Firebase Hosting |
| Sirsi Portal (HTML) | `packages/sirsi-portal/` | Firebase Hosting | `portal.sirsi.ai` | Firebase Hosting |
| Sirsi Portal (React) | `packages/sirsi-portal-app/` | Firebase Hosting | (migration target) | Vite Build + Firebase |
| **Sirsi Admin Service** | `packages/sirsi-admin-service/` | **Cloud Run** | `sirsi-admin-210890802638.us-central1.run.app` | **gcloud run deploy** |
| gRPC Services | `packages/sngp/` | Cloud Run | (various) | Cloud Functions / Cloud Run |
| Pitch Deck | `packages/sirsi-portal/pitchdeck.html` | Firebase Hosting | (same as portal) | Firebase Hosting |

### Infrastructure
- **Firebase Project ID**: `sirsi-nexus-live`
- **Cloud Run Region**: `us-central1`
- **Hosting**: Firebase Hosting (multi-site)
- **Functions**: Cloud Functions for Firebase

---

## 1. Sirsi Sign (Firebase Hosting)

### Build
```bash
cd packages/sirsi-sign && npm run build
```

### Sync to Hosting Directory
```bash
rsync -av --delete packages/sirsi-sign/dist/ packages/sirsi-opensign/public/
```

### Deploy
```bash
firebase deploy --only hosting:sirsi-sign --project sirsi-nexus-live
```

### Verify
- Check `https://sign.sirsi.ai/` loads correctly
- Verify DevTools shows zero errors
- Confirm CSP headers are intact

---

## 2. Sirsi Admin Service (Cloud Run — ConnectRPC)

The Go ConnectRPC backend serving the HypervisorService, AdminService, and TenantService.

### Deploy Script (RECOMMENDED)
```bash
cd packages/sirsi-admin-service && ./deploy.sh
```

The script automates the following:
1. **Local build** — Catches compile errors before uploading to Cloud Build
2. **Vendor dependencies** — Resolves `../../proto/gen/go` replace directive
3. **go.mod version guard** — Prevents Docker Hub version mismatch errors
4. **Cloud Run deploy** — Uses `yes |` to prevent "Aborted by user" errors
5. **Health check** — Verifies the endpoint responds after deploy

### Manual Deploy (if script is unavailable)
```bash
cd packages/sirsi-admin-service

# 1. Build locally first
go build -o sirsi-admin . && rm sirsi-admin

# 2. Vendor dependencies
GOWORK=off GOTOOLCHAIN=local go mod tidy
GOWORK=off GOTOOLCHAIN=local go mod vendor

# 3. Deploy with `yes |` (CRITICAL — prevents "Aborted by user")
yes | gcloud run deploy sirsi-admin \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### Verify
```bash
curl -s https://sirsi-admin-210890802638.us-central1.run.app/sirsi.admin.v2.HypervisorService/GetHypervisorOverview \
  -H 'Content-Type: application/json' -d '{}' | head -c 200
```

### ⚠️ Cloud Run Gotchas (LOCKED)

| Pitfall | Cause | Fix |
|:--------|:------|:----|
| `Aborted by user` | `gcloud run deploy --source` needs a persistent stdin during the multi-minute build. `--quiet`, `echo "Y" \|`, or any method that closes stdin will trigger this. | **Always use `yes \|`** to keep stdin alive |
| `go.mod requires go >= 1.25.5` | Local Go 1.26 auto-sets go.mod version; Docker Hub only has up to `golang:1.24-alpine` | Set `go 1.24.0` in both `go.mod` and `proto/gen/go/go.mod` |
| `replaced by ../../proto/gen/go: no such file` | `replace` directive in go.mod points to a parent directory that doesn't exist in the Docker build context | Run `GOWORK=off go mod vendor` to vendor locally |
| `No module named 'grpc'` | gcloud's Python interpreter is missing the grpcio package | Run `pip3 install grpcio` |
| `go mod tidy` resets version | `go mod tidy` auto-upgrades the go directive to match local toolchain | Use `GOTOOLCHAIN=local` with tidy, or re-set version after tidy |

---

## 3. Sirsi Portal — HTML (Firebase Hosting)

The legacy HTML admin portal.

```bash
firebase deploy --only hosting --project sirsi-nexus-live
```

---

## 4. Sirsi Portal — React (Vite + Firebase Hosting)

The React migration of the admin portal (migration target, not yet in production hosting).

### Local Development
```bash
cd packages/sirsi-portal-app && npm run dev
```

### Production Build
```bash
cd packages/sirsi-portal-app && npm run build
```

---

## CI/CD
GitHub Actions handles automated deployment on push to `main`. See `.github/workflows/` for pipeline definitions.

### Required Secrets
- `FIREBASE_SERVICE_ACCOUNT_SIRSI_NEXUS_LIVE` — Firebase Hosting deploys

---

## General Rules

1. **Always push after deploy**: `git add -A && git commit -m "deploy: ..." && git push`
2. **Verify before pushing**: Check DevTools, curl endpoints, run health checks
3. **Never skip the build step**: Always build locally before deploying
4. **Use deploy scripts**: `deploy.sh` for Cloud Run, `deploy-contracts.sh` for Sirsi Sign
