# ADR-029: Cloud Run Deployment Architecture — sirsi-admin Service

**Status:** Accepted  
**Date:** March 4, 2026  
**Authors:** Antigravity Agent, Cylton Collymore  
**Supersedes:** None  
**Related:** ADR-026 (Hypervisor Command Protocol), ADR-028 (Proto Versioning)

---

## Context

The Sirsi admin backend (`packages/sirsi-admin-service/`) hosts the ConnectRPC services for the React admin portal: `HypervisorService` (10 RPCs), `AdminService` (6 RPCs), and `TenantService` (5 RPCs). These services were developed locally and needed a production deployment target.

### Requirements
1. **Serverless scale-to-zero** — cost-efficient for a startup that doesn't need 24/7 compute
2. **Container-based** — Go binary with vendored dependencies
3. **ConnectRPC compatible** — HTTP/1.1 JSON transport (gRPC-Web from browser)
4. **No infrastructure management** — no VMs, no k8s, no GKE
5. **Same project** — deploy within `sirsi-nexus-live` for unified IAM

### Alternatives Considered
| Option | Pros | Cons | Decision |
|:-------|:-----|:-----|:---------|
| **Cloud Run (source)** | Zero infra, scale-to-zero, auto-TLS, source deploy | Cold starts (~2s) | ✅ **Selected** |
| **GKE Autopilot** | Full k8s, persistent pods | Over-engineered, cost at idle | ❌ Rejected |
| **Cloud Functions (Go)** | Simpler deploy | No streaming, limited runtime | ❌ Rejected |
| **Compute Engine** | Full control | Manual scaling, always-on cost | ❌ Rejected |

## Decision

Deploy `sirsi-admin` to **Google Cloud Run** using source-based deployment with a multi-stage Dockerfile.

### Architecture

```
┌──────────────────┐     ConnectRPC (JSON)     ┌──────────────────────────┐
│  React Portal    │ ──────────────────────────▶│  Cloud Run: sirsi-admin  │
│  (Firebase Host) │                            │  Go 1.24 + Alpine 3.19   │
│  sirsi.ai        │                            │  us-central1             │
└──────────────────┘                            └──────────────────────────┘
                                                  │
                                                  ▼
                                                Services:
                                                • HypervisorService (10 RPCs)
                                                • AdminService (6 RPCs)
                                                • TenantService (5 RPCs)
```

### Configuration
| Parameter | Value |
|:----------|:------|
| **Service name** | `sirsi-admin` |
| **Region** | `us-central1` |
| **Project** | `sirsi-nexus-live` |
| **Port** | `8080` |
| **Memory** | `256Mi` |
| **CPU** | `1` |
| **Min instances** | `0` (scale to zero) |
| **Max instances** | `10` |
| **Auth** | `--allow-unauthenticated` (Firebase Auth at app layer) |
| **URL** | `https://sirsi-admin-210890802638.us-central1.run.app` |

### Build Pipeline
1. `go build` locally to verify
2. `go mod vendor` to resolve `replace` directives
3. `gcloud run deploy --source .` triggers Cloud Build
4. Multi-stage Dockerfile: `golang:1.24-alpine` → `alpine:3.19`

### Critical Operational Notes

1. **`yes |` required** — `gcloud run deploy --source` needs persistent stdin during the multi-minute build. Without it, gcloud aborts with "Aborted by user."
2. **go.mod ≤ 1.24.0** — Docker Hub only has `golang:1.24-alpine`. Both `go.mod` files must stay at `go 1.24.0`.
3. **Vendored dependencies** — The `replace` directive (`../../proto/gen/go`) can't resolve in Docker context. `go mod vendor` solves this.
4. **Deploy script** — `packages/sirsi-admin-service/deploy.sh` automates all of the above.

## Consequences

### Positive
- Zero infrastructure management
- Scale-to-zero reduces cost to ~$0/month at low traffic
- Automatic TLS, load balancing, and health checks
- Source deploy = no local Docker required
- Same project as Firebase Hosting = unified billing and IAM

### Negative
- Cold starts (~2s) on first request after scale-to-zero
- Source deploys take 3-5 minutes (Cloud Build)
- `--allow-unauthenticated` means auth enforcement is at the app layer, not the infrastructure layer

### Risks
- If `go mod tidy` runs locally with a newer Go toolchain, it auto-upgrades `go.mod` past 1.24.0, breaking Cloud Build. Mitigated by deploy script's version guard.

---

**Signed:** Antigravity Agent, March 4, 2026
