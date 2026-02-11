# ADR-013: Sirsi Sign Hierarchical Routing & Multi-Tenant Differentiation

## Status
Accepted

## Context
The Sirsi Sign platform required a hierarchical routing structure to support multi-tenant document access (e.g., FinalWishes, Assiduous) while maintaining a clean, professional user experience on the `sign.sirsi.ai` domain. Additionally, a distinction was needed between administrative views (App Dashboard) and client signing views (Document Vault).

## Decision
1. **Hierarchical Routing**: Implemented via TanStack Router:
   - `sign.sirsi.ai/contracts/$projectId` -> Deep link to project-specific contracts.
   - `sign.sirsi.ai/vault/$userId` -> User personal vault root.
   - `sign.sirsi.ai/vault/$userId/$category/$entityId/$docId` -> Granular document access.
2. **SPA Routing Integrity**: Configured Firebase Hosting to support client-side routing:
   - Added `rewrites` to catch all paths (`**`) and serve `index.html`.
   - Enabled `cleanUrls: true` and `trailingSlash: false` for consistent path resolution.
3. **Context-Aware Sidebar**: Differentiated views in `AgreementWorkflow.tsx`:
   - **Admin Context**: Sidebar and header preserved only on `/admin/*` paths within the main portal.
   - **User/Sign Context**: Sidebar and admin headers are strictly suppressed on the `sign.sirsi.ai` domain to provide an immersive document execution experience.

## Implementation Details
- **Router Config**: Dynamically handles `$projectId` and `$userId` parameters.
- **Hosting Config**: Standardized across `sirsi-ai` and `sirsi-sign` sites in `firebase.json`.
- **Visibility Logic**: Uses `window.location.hostname` and `window.location.pathname` to suppress legacy UI artifacts.

## Consequences
- Deep links (e.g., `https://sign.sirsi.ai/contracts/finalwishes`) are now fully functional and bookmarkable.
- The user experience on the signing domain is streamlined and free of administrative clutter.
- Navigation between admin and user contexts is logically separated and secure.
