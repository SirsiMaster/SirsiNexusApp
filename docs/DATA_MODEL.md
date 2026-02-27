# Data Model — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Overview
SirsiNexusApp uses a **hybrid database architecture**: Cloud SQL for structured/PII data and Firestore for real-time state.

## Cloud SQL (Structured Data)

### Users
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `email` | VARCHAR(255) | Unique, indexed |
| `firebase_uid` | VARCHAR(128) | Firebase Auth UID |
| `full_name` | VARCHAR(255) | |
| `role` | ENUM | `admin`, `provider`, `client` |
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

## Firestore (Real-Time State)

### Collections
| Collection | Purpose | Consumed By |
|-----------|---------|-------------|
| `sessions` | Active user sessions, MFA state | sirsi-auth |
| `notifications` | Real-time alerts | sirsi-portal |
| `audit_log` | Security event stream | sirsi-portal |
| `catalog` | Product/feature catalog for Sirsi Sign | sirsi-sign |

## PII Encryption
All PII fields are encrypted at rest using AES-256 via Cloud KMS. See `SECURITY_COMPLIANCE.md` for key management details.
