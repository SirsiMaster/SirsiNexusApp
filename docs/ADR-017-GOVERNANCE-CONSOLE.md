# ADR-017: Sirsi Governance Console & Dynamic Configuration

## Status
Proposed

## Context
The Sirsi Nexus ecosystem requires a centralized mechanism to manage contract archetypes (bases), the product catalog (addons), and multi-tenant environment variables. Currently, these definitions are stored in static TypeScript files (`catalog.ts`, `projectTemplates.ts`), necessitating code deployments for any business logic changes. 

The USER requires a "Studio Admin" capability where members with `tenant_admin` or `sirsi_admin` roles can:
1. View a repository of existing and draft contracts.
2. Modify the terms and content of base contract templates.
3. Dynamically manage the catalog of offerings (addons), including pricing and labor estimates.
4. Define new contracts, clients, and service packages.

## Decision
We will implement the **Sirsi Governance Console**, a unified administrative layer within the Nexus Portal.

### 1. Unified Management Interface
We will add a "Governance & Catalog" section to the `AdminPortal`. This section will provide a high-fidelity interface for manipulating the configuration state usually locked in `data/catalog.ts` and `data/projectTemplates.ts`.

### 2. Configurable Environment Registry
We will introduce a `useGovernanceStore` (Zustand) that acts as the runtime source of truth.
- **Initialization**: On app boot, the store will read from the static TS files (cold start) or fetch from the `sirsi-admin` gRPC `GetSettings` endpoint (dynamic start).
- **Runtime Overrides**: Changes made in the Governance UI will be persisted to Firestore (via gRPC) and reflected immediately in the `Configurator` and `ContractWorkflow` components.

### 3. Role-Based Governance (Policy Engine)
- **sirsi_admin**: Global visibility across all tenants. Can modify "Market Rates" and "Global Templates".
- **tenant_admin**: Visibility restricted to their specific `tenantId`. Can modify their own "Client Proposals" and "Local Template Overrides".

### 4. Components
- `GovernancePortal.tsx`: Main parent in `src/components/admin/governance`.
- `CatalogManager.tsx`: Specialized UI for product CRUD.
- `TemplateArchitect.tsx`: Specialized UI for modifying MSA/SOW legalese and objectives.

## Consequences
- **Positive**: Business users can now update pricing and legal terms without developer intervention.
- **Complexity**: Requires careful synchronization between local state and backend persistence.
- **Risk**: Dynamic modification of legal terms must include versioning to ensure active contracts are not retroactively changed. (Future Phase: Versioning/Immutable Snapshots).

## Rules Alignment
- **Rule 12 (Dynamic Financial Integrity)**: This ADR enforces Rule 12 by ensuring the catalog remains the single source of truth, even when modified at runtime.
- **Rule 13 (Standardized Valuations)**: Valuation rules will be enforced via the `GovernancePortal` validation logic.
