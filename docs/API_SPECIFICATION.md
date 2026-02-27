# API Specification — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Overview
SirsiNexusApp exposes shared services via **gRPC + Protobuf** for backend-to-backend communication and **gRPC-Web** for browser clients.

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
