# ADR-017: CockroachDB Decommission

## Status
**Accepted** — Executed February 27, 2026

## Context
CockroachDB was originally adopted during early development as a distributed SQL database for the Sirsi Nexus platform. As the architecture evolved (documented in GEMINI.md §3), the stack was standardized to:

- **Cloud SQL (PostgreSQL)** for PII and Vault data
- **Firestore** for real-time NoSQL operations

CockroachDB was installed locally via Homebrew (`cockroachdb/tap/cockroach`) but was:
- Not running (service status: `none`)
- Not connected to any live processes
- Not referenced in any Go application code
- Only referenced in legacy scripts, health checks, and documentation

## Decision
Fully decommission CockroachDB from the Sirsi Nexus ecosystem:

1. **Remove all runtime dependencies** — health checks, startup scripts, integration tests
2. **Update all configuration** — DATABASE_URL references (port 26257 → 5432), docker-compose, k8s manifests
3. **Uninstall from local tooling** — `brew uninstall cockroachdb/tap/cockroach`
4. **Update documentation** — README, CONTRIBUTING, TECHNICAL_DESIGN, k8s README

## Files Modified

### Active Code (Runtime Impact)
| File | Change |
|---|---|
| `service_verification.js` | Removed CockroachDB health check |
| `scripts/start-platform.sh` | Removed startup check, updated DATABASE_URL |
| `test_sirsi_integration.sh` | Removed COCKROACH_PID start/stop logic |
| `load-testing/load-test.sh` | Removed port 26257 health check, updated DB test |

### Configuration
| File | Change |
|---|---|
| `k8s/core-engine-deployment.yaml` | DATABASE_URL → postgres-service:5432 |
| `k8s/analytics-deployment.yaml` | DATABASE_URL → postgres-service:5432 |
| `k8s/configmap.yaml` | Database URL + Prometheus target updated |
| `k8s/network-policies.yaml` | App labels → postgres |
| `k8s/storage.yaml` | PVC name → postgres-data |
| `k8s/deploy.sh` | Deployment references → postgres |
| `docs/TECHNICAL_DESIGN.md` | Docker-compose → PostgreSQL 15 |

### Documentation
| File | Change |
|---|---|
| `README.md` | Database → Cloud SQL + Firestore |
| `CONTRIBUTING.md` | docker-compose comment updated |
| `k8s/README.md` | All CockroachDB references → PostgreSQL |

### Local Tooling
- Uninstalled `cockroachdb/tap/cockroach` (322.7MB)
- Auto-removed 5 unused dependencies (2.1GB): llvm, z3, python@3.12, python@3.14, icu4c@77

## Remaining Legacy References
The following files in `docs-backup/`, `docs/core/VERSION.md`, and legacy markdown reports still contain historical CockroachDB mentions. These are archived records and intentionally preserved for audit trail purposes. They do not affect any runtime behavior.

## Consequences
- **Positive**: Cleaner stack, ~2.4GB disk reclaimed, no confusion between CockroachDB and actual Cloud SQL/Firestore stack
- **Positive**: Health checks and startup scripts now reflect the real architecture
- **Negative**: None — CockroachDB had zero active usage
- **Rollback**: `brew install cockroachdb/tap/cockroach` + `git revert` the two commits
