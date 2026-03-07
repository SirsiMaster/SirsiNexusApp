# Data Model — SirsiNexusApp

**Version:** 2.0.0  
**Date:** March 7, 2026

---

## Overview
SirsiNexusApp uses a **hybrid database architecture**: AlloyDB AI (PostgreSQL-compatible with in-database AI) for structured/PII/KG data and Firestore for real-time state.

> **Migration Note (Epoch 3):** Cloud SQL → AlloyDB AI. Zero code change required (same pgx driver). AlloyDB adds `google_ml_integration` extension for in-database AI capabilities — see `docs/SIRSI_MASTER_BLUEPRINT.md` Sprint 7.

## AlloyDB AI (Structured Data + Knowledge Graph)

### Users
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `email` | VARCHAR(255) | Unique, indexed |
| `firebase_uid` | VARCHAR(128) | Firebase Auth UID |
| `full_name` | VARCHAR(255) | |
| `role` | ENUM | `admin`, `provider`, `client`, `investor` |
| `mfa_enabled` | BOOLEAN | Default `false` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Contracts
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `tenant_id` | VARCHAR(64) | `finalwishes`, `assiduous` |
| `status` | ENUM | See ADR-023 lifecycle |
| `signer_email` | VARCHAR(255) | |
| `provider_email` | VARCHAR(255) | |
| `envelope_id` | VARCHAR(128) | OpenSign reference |
| `stripe_payment_id` | VARCHAR(128) | Stripe reference |
| `funding_status` | ENUM | `unfunded`, `partial`, `funded` |
| `sha256_hash` | VARCHAR(64) | Evidence chain |
| `signed_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |

### Tenants *(Sprint 1)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `slug` | VARCHAR(64) | Unique, URL-safe identifier |
| `company_name` | VARCHAR(256) | |
| `plan_id` | VARCHAR(32) | `free`, `solo`, `business` |
| `status` | ENUM | `provisioning`, `active`, `suspended`, `archived` |
| `stripe_customer_id` | VARCHAR(128) | Stripe customer reference |
| `stripe_subscription_id` | VARCHAR(128) | Stripe subscription reference |
| `admin_email` | VARCHAR(255) | |
| `github_repo` | VARCHAR(256) | Auto-provisioned repo URL |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Knowledge Graph Schema *(PLANNED — Epoch 3, Sprint 7)*

> These tables power the NebuLang Protocol (P-001) and KG Query Engine (P-003).

### knowledge_nodes
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `node_type` | VARCHAR(64) | `service`, `agent`, `hardware`, `config`, `policy`, `incident` |
| `name` | VARCHAR(256) | |
| `description` | TEXT | Content for auto-embedding |
| `properties` | JSONB | Flexible metadata |
| `embedding` | REAL[768] | Auto-populated by AlloyDB AI |
| `anchor_hash` | BYTEA | SHA-256 of node state, anchored on DLT |
| `anchor_ts` | TIMESTAMPTZ | DLT consensus timestamp |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### knowledge_edges
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `source_id` | UUID | FK → knowledge_nodes |
| `target_id` | UUID | FK → knowledge_nodes |
| `edge_type` | VARCHAR(64) | `depends_on`, `routes_to`, `manages`, `runs_on`, `generated_by` |
| `weight` | FLOAT | Default 1.0 |
| `properties` | JSONB | |
| `created_at` | TIMESTAMPTZ | |

### kg_anchors *(Cryptographic Proofs)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `state_hash` | BYTEA | SHA-256 of full KG state |
| `node_count` | INTEGER | |
| `edge_count` | INTEGER | |
| `ledger_topic_id` | VARCHAR(32) | DLT topic reference |
| `ledger_sequence` | BIGINT | DLT sequence number |
| `consensus_timestamp` | TIMESTAMPTZ | DLT consensus timestamp |
| `created_at` | TIMESTAMPTZ | |

### infrastructure_state *(Neural-Fractal Verification)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `component_type` | VARCHAR(64) | `cloud_run_service`, `alloydb_instance`, `firestore_db`, `cisco_switch`, `nvidia_gpu` |
| `component_id` | VARCHAR(256) | Unique component identifier |
| `desired_state` | JSONB | Expected configuration |
| `actual_state` | JSONB | Current verified state |
| `drift_detected` | BOOLEAN | Default `false` |
| `last_verified_at` | TIMESTAMPTZ | |
| `verification_proof_id` | UUID | FK → kg_anchors |

---

## Firestore (Real-Time State)

### Collections
| Collection | Purpose | Consumed By |
|-----------|---------|-------------|
| `sessions` | Active user sessions, MFA state | sirsi-auth |
| `notifications` | Real-time alerts | sirsi-portal |
| `audit_log` | Security event stream | sirsi-portal |
| `catalog` | Product/feature catalog for Sirsi Sign | sirsi-sign |
| `mail` | Outbound email queue (Firebase Trigger Email Extension) | sirsi-auth, sirsi-sign |
| `deployments` | Deployment history per tenant/env | sirsi-admin-service (Hypervisor) |
| `security_events` | Real-time auth and security events | sirsi-admin-service (Hypervisor) |
| `telemetry_snapshots` | Periodic metric snapshots for sparklines | sirsi-admin-service (Hypervisor) |
| `incidents` | Incident tracking and SLA records | sirsi-admin-service (Hypervisor) |

## PII Encryption
All PII fields are encrypted at rest using AES-256 via Cloud KMS. See `SECURITY_COMPLIANCE.md` for key management details.

## Indexes *(PLANNED — Epoch 3)*
```sql
CREATE INDEX idx_nodes_type ON knowledge_nodes(node_type);
CREATE INDEX idx_nodes_embedding ON knowledge_nodes USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_edges_target ON knowledge_edges(target_id);
CREATE INDEX idx_edges_type ON knowledge_edges(edge_type);
CREATE INDEX idx_infra_drift ON infrastructure_state(drift_detected) WHERE drift_detected = TRUE;
```

