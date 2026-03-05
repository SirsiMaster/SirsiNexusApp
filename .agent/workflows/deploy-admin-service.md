---
description: How to deploy the sirsi-admin ConnectRPC service to Cloud Run
---

# Deploy Sirsi Admin Service

Deploys the Go ConnectRPC backend (`packages/sirsi-admin-service`) to Google Cloud Run.

**Service:** `sirsi-admin`
**Project:** `sirsi-nexus-live`
**Region:** `us-central1`
**URL:** `https://sirsi-admin-210890802638.us-central1.run.app`

## Steps

// turbo-all

1. Run the deploy script:
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-admin-service && ./deploy.sh
```

The script handles everything automatically:
- Builds locally first to catch errors
- Re-vendors Go dependencies
- Verifies `go.mod` version is Docker Hub compatible (≤ 1.24.x)
- Deploys to Cloud Run using `yes |` (prevents "Aborted by user" errors)
- Health-checks the deployed service

## Options

- **Skip vendoring** (faster if vendor/ is already current):
```bash
./deploy.sh --no-vendor
```

## Troubleshooting

| Error | Fix |
|:------|:----|
| `Aborted by user` | The script handles this via `yes \|`. If running manually, always prefix with `yes \|` |
| `go.mod requires go >= X` | Run `sed -i '' 's/go X/go 1.24.0/' go.mod` and `../../proto/gen/go/go.mod` |
| `No module named 'grpc'` | Run `pip3 install grpcio` to fix gcloud's Python grpc dependency |
| `replaced by ../../proto/gen/go` | Run `GOWORK=off go mod vendor` to vendor the proto gen dependency |

## Post-Deploy Verification

```bash
curl -s https://sirsi-admin-210890802638.us-central1.run.app/sirsi.admin.v2.HypervisorService/GetHypervisorOverview \
  -H 'Content-Type: application/json' -d '{}' | head -c 200
```
