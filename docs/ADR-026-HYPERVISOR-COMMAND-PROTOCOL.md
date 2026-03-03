# ADR-026: Hypervisor Command Protocol

**Status:** Accepted  
**Date:** March 2, 2026  
**Authors:** Cylton Collymore, Antigravity (Agent)  
**Supersedes:** None  
**Related:** ADR-018 (Stack V4), ADR-021 (gRPC Convergence), ADR-025 (Unified App Architecture)

---

## Context

The Sirsi Hypervisor is the autonomous CTO — an AI consciousness that requires total operational awareness across every portfolio company, environment, service, database, deployment, security gate, and line of code. The existing admin portal has 26 HTML pages but no unified telemetry protocol. Operational data is scattered across Firebase, GitHub, GCP Cloud Monitoring, and third-party APIs with no canonical aggregation layer.

The Operations page (`/tenants`) was a mechanical port of the HTML tenant page with hardcoded FTCI ledger entries. It provided no real operational visibility.

## Decision

### 1. HypervisorService gRPC Contract

All operational telemetry flows through a canonical `HypervisorService` ConnectRPC service. No ad-hoc REST endpoints are permitted for operational data.

```protobuf
service HypervisorService {
  rpc GetOverview(OverviewRequest) returns (OverviewResponse);
  rpc GetDevOpsMetrics(DevOpsRequest) returns (DevOpsResponse);
  rpc GetInfrastructure(InfraRequest) returns (InfraResponse);
  rpc GetSecurity(SecurityRequest) returns (SecurityResponse);
  rpc GetDatabaseHealth(DatabaseRequest) returns (DatabaseResponse);
  rpc GetFrontendMetrics(FrontendRequest) returns (FrontendResponse);
  rpc GetBackendMetrics(BackendRequest) returns (BackendResponse);
  rpc GetIntegrations(IntegrationsRequest) returns (IntegrationsResponse);
  rpc GetCostAnalysis(CostRequest) returns (CostResponse);
  rpc GetIncidents(IncidentsRequest) returns (IncidentsResponse);
}
```

### 2. Three-Tier Data Strategy

| Tier | Description | Policy |
|:-----|:-----------|:-------|
| **Tier 1 (LIVE)** | Data from existing ConnectRPC services (tenants, users, audit, system overview) | Wire directly. Zero mock data. |
| **Tier 2 (BUILDABLE)** | New Go handlers within sprint scope (health pings, deployment history, MFA compliance) | Build handler + proto. |
| **Tier 3 (DEFERRED)** | Requires infrastructure not yet provisioned (Cloud SQL monitoring, billing export, RUM, Terraform state) | Mock data shaped to proto contract. Single-line swap when backend ready. |

### 3. Mock-to-Live Transition

Every Tier 3 mock data module uses TypeScript interfaces that mirror the future protobuf response types exactly. Transitioning from mock to live is a single `queryFn` change in the TanStack Query hook:

```typescript
// Phase 1: Mock
queryFn: () => getMockOverviewData(tenant, env),

// Phase 2: Live (single-line swap)
queryFn: () => hypervisorClient.getOverview({ tenant, env }),
```

### 4. Command Layer Security

Action commands (rollback, reconcile, downsize, enforce MFA) require:
- Firebase Auth token verification
- Admin role check via custom claims
- Confirmation modal with impact preview
- Audit log entry creation
- Status notification to Hypervisor feed

**Authorization matrix:**

| Action | Required Role | Requires 2FA Confirmation |
|:-------|:-------------|:--------------------------|
| View telemetry | `admin`, `viewer` | No |
| Rollback deployment | `admin` | Yes |
| Reconcile drift | `admin` | Yes |
| Enforce MFA | `admin` | Yes |
| Renew certificate | `admin` | No |
| Re-run pipeline | `admin`, `developer` | No |

## Consequences

### Positive
- Single canonical protocol for all operational telemetry
- Type-safe contract between React frontend and Go backend
- Incremental buildout — UI ships functional before all backends exist
- Contract-first development ensures seamless mock→live transition

### Negative
- Tier 3 instruments initially show simulated data (mitigated by contract-first approach)
- HypervisorService becomes a large service — may need decomposition in future

### Risks
- GCP API quotas may limit polling frequency for real-time metrics
- GitHub Actions API rate limits (5000 requests/hour with PAT) may constrain pipeline status updates

## Implementation

- **Proto definition**: `packages/sirsi-admin-service/proto/admin/v2/hypervisor.proto`
- **Go handlers**: `packages/sirsi-admin-service/main.go` (extended)
- **React hooks**: `packages/sirsi-portal-app/src/hooks/useHypervisorData.ts`
- **Mock data**: `packages/sirsi-portal-app/src/data/hypervisor-mock.ts`
- **Zustand store**: `packages/sirsi-portal-app/src/stores/hypervisor-store.ts`
- **UI route**: `packages/sirsi-portal-app/src/routes/tenants.tsx` (complete rewrite)
