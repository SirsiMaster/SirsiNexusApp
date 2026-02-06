# ADR-013: Sirsi Sign Unified Vault & Multi-Tenant Architecture

## Status
Proposed

## Context
The Sirsi Sign platform currently uses a flat routing structure and lacks clear multi-tenant grouping. To support a portfolio of entities (FinalWishes, Assiduous, etc.), the vault must become a hierarchical portal that handles authentication, MFA, and document grouping by entity.

## Decision
1. **Hierarchical Routing**: Implement the following route structure:
   - `sign.sirsi.ai/` -> Landing/Entry Portal
   - `sign.sirsi.ai/vault/:user` -> User personal vault root
   - `sign.sirsi.ai/vault/:user/:type/:entity/:docId` -> Deep link to specific documents/payments
2. **Integrated Onboarding**: Combine signup/MFA setup into the entry flow for unauthenticated users arriving via deep links.
3. **Multi-Tenant Grouping**: Group documents in the UI by originating entity (Tenant).
4. **Role-Based Visibility**: 
   - **User**: Sees own documents grouped by sender.
   - **Entity Admin**: Sees documents/users for their specific entity.
   - **Sirsi Admin**: Global cross-tenant visibility.

## Consequences
- Routing becomes more complex and requires better breadcrumb/navigation handling.
- Auth state must be synchronized with project-specific settings.
- URL parameters must be validated to prevent IDOR or unauthorized access.
