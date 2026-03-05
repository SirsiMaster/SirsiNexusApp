# API Specification — SirsiNexusApp

**Version:** 2.0.0  
**Date:** March 4, 2026

---

## Overview
SirsiNexusApp exposes shared services via **gRPC + Protobuf** for backend-to-backend communication and **ConnectRPC (gRPC-Web)** for browser clients.

### Service Endpoints
| Service | URL | Transport |
|:--------|:----|:----------|
| **Sirsi Admin** (Hypervisor, Admin, Tenant) | `https://sirsi-admin-210890802638.us-central1.run.app` | ConnectRPC over HTTP |
| **Sirsi Sign** (Contracts, Envelopes, Payments) | Cloud Run (internal) | gRPC |
| **Auth** | Firebase Cloud Functions | REST |

### Proto Package
All admin service definitions live in `proto/sirsi/admin/v2/` and are compiled with `buf generate`.

## Sirsi Sign API (gRPC)

### ContractService
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `CreateContract` | `CreateContractRequest` | `Contract` | Create a new contract |
| `GetContract` | `GetContractRequest` | `Contract` | Retrieve by ID |
| `ListContracts` | `ListContractsRequest` | `ListContractsResponse` | Paginated list |
| `UpdateContractStatus` | `UpdateStatusRequest` | `Contract` | Status lifecycle transition |

### EnvelopeService (OpenSign Integration)
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `CreateEnvelope` | `CreateEnvelopeRequest` | `EnvelopeResponse` | Create signing envelope |
| `GetSigningURL` | `GetSigningURLRequest` | `SigningURLResponse` | Generate signer link |
| `GetEnvelopeStatus` | `GetStatusRequest` | `StatusResponse` | Check signing status |

### PaymentService (Stripe Integration)
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `CreatePaymentIntent` | `PaymentIntentRequest` | `PaymentIntentResponse` | Initiate payment |
| `GetPaymentStatus` | `GetPaymentStatusRequest` | `PaymentStatusResponse` | Check payment status |

## Sirsi Admin API (gRPC)

### HypervisorService (ADR-026 — Operational Telemetry)
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `GetOverview` | `OverviewRequest` | `OverviewResponse` | Executive summary: uptime, tenant health, deployments, cost MTD |
| `GetDevOpsMetrics` | `DevOpsRequest` | `DevOpsResponse` | DORA metrics, pipeline status, deployment frequency |
| `GetInfrastructure` | `InfraRequest` | `InfraResponse` | IaC state, drift detection, environment parity, Cloud Run |
| `GetSecurity` | `SecurityRequest` | `SecurityResponse` | MFA compliance, auth activity, vulnerability score, SSL certs |
| `GetDatabaseHealth` | `DatabaseRequest` | `DatabaseResponse` | Connection pools, slow queries, replication lag, backups |
| `GetFrontendMetrics` | `FrontendRequest` | `FrontendResponse` | Core Web Vitals, bundle size, page inventory, error tracking |
| `GetBackendMetrics` | `BackendRequest` | `BackendResponse` | API endpoints, service health, gRPC throughput, Go runtime |
| `GetIntegrations` | `IntegrationsRequest` | `IntegrationsResponse` | Stripe/Plaid/SendGrid/OpenSign health, webhooks, API keys |
| `GetCostAnalysis` | `CostRequest` | `CostResponse` | Monthly spend, budget vs actual, idle resources, forecast |
| `GetIncidents` | `IncidentsRequest` | `IncidentsResponse` | Open incidents, SLA compliance, runbook log, postmortems |

### AdminService
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `GetSystemOverview` | `GetSystemOverviewRequest` | `SystemOverview` | Aggregated system KPIs |
| `ListUsers` | `ListUsersRequest` | `ListUsersResponse` | Paginated user list |
| `ListAuditTrail` | `ListAuditTrailRequest` | `ListAuditTrailResponse` | Security audit log |
| `GetDevMetrics` | `GetDevMetricsRequest` | `DevMetrics` | Dev velocity and activity |
| `GetSettings` | `GetSettingsRequest` | `GetSettingsResponse` | System settings |
| `UpdateSettings` | `UpdateSettingsRequest` | `UpdateSettingsResponse` | Modify system settings |

### TenantService
| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `ListTenants` | `ListTenantsRequest` | `ListTenantsResponse` | List all tenants with status |
| `GetTenant` | `GetTenantRequest` | `Tenant` | Single tenant details |
| `CreateTenant` | `CreateTenantRequest` | `Tenant` | Provision new tenant |
| `UpdateTenant` | `UpdateTenantRequest` | `Tenant` | Update tenant config |
| `DeactivateTenant` | `DeactivateTenantRequest` | `DeactivateTenantResponse` | Deactivate tenant |

## REST Endpoints (Firebase Cloud Functions)

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/verify-mfa` | Verify TOTP code |
| `POST` | `/api/auth/enroll-mfa` | Enroll TOTP device |

### Webhooks
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhooks/stripe` | Stripe payment events |
| `POST` | `/api/webhooks/opensign` | OpenSign signing events |

## Authentication
All API calls require a valid Firebase Auth token passed as `Authorization: Bearer <token>`. Custom claims carry role and tenant information.
