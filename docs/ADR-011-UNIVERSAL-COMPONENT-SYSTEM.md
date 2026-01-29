# ADR-011: Universal Component System (UCS) Architecture

**Status:** Approved  
**Date:** January 29, 2026  
**Context:** The Sirsi Portfolio consists of multiple independent tenant applications (e.g., FinalWishes, Assiduous, SirsiNexus). Historically, these projects often build redundant infrastructure integrations (Stripe, Plaid, Sendgrid, etc.), leading to "project silos," duplicate security risks, and inconsistent implementation of the Sirsi standard.

## 1. Decision
We will implement the **Universal Component System (UCS)** as the canonical infrastructure layer for all Sirsi-affiliated projects. The UCS is a centralized library of "premium assets" and "infrastructure utilities" that provide standardized, high-fidelity interfaces to external services.

## 2. Infrastructure Utilities (The "Big Four")
The following core services are formally designated as UCS Infrastructure Layer components:

*   **🌐 Stripe (Financial Engine)**: Managed via `sirsi-opensign` and central gRPC services.
*   **🏦 Plaid (Financial Data & KYC)**: Integrated via shared hooks in `sirsi-ui`.
*   **✉️ Sendgrid (Communications)**: Centralized engine for all portfolio notifications.
*   **🏛️ Chase (Treasury)**: High-performance settlement bridge for corporate operations.

## 3. Core Principles: "Integrated Independence"
1.  **Centralized Management**: All API keys, secrets, and configurations are managed in the **Sirsi Vault** (Firestore/KMS).
2.  **Standardized Interfaces**: Projects do not call external APIs directly. They use UCS hooks (React) or internal gRPC services (Go/Rust).
3.  **Independence**: Each tenant (Project) maintains its own data logic but uses the unified UCS utility for execution.
4.  **Security-First**: Every UCS utility requires **MFA** and logs to the central audit stream.

## 4. Implementation Strategy
*   **UI Layer**: Shared hooks in `packages/sirsi-ui` for components like Plaid Link and Stripe Elements.
*   **Logic Layer**: Centralized Cloud Functions/gRPC services in `packages/sirsi-portal` or `packages/sirsi-opensign`.
*   **Policy Layer**: Enforced by the `AUTHORIZATION_POLICY.md` and `requireMFA` middleware.

## 5. Consequences
*   **Pros**: 
    *   Eliminates architectural overlap and code duplication.
    *   Ensures consistent security posture across all portfolio products.
    *   Simplifies maintenance (one fix updates all tenants).
    *   Professional, unified branding for all user-facing utility flows.
*   **Cons**:
    *   Requires strict adherence to the UCS protocol by all developers.
    *   Increases dependency on the core monorepo for tenant-specific builds.

---
**Approved by:** CISO & CTO  
**Reference:** ARCHITECTURE_DESIGN.md Section 1.6
