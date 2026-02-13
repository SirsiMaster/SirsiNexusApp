# TASK: Fix sirsi.ai Landing Page and Login Flow

## 1. Problem Analysis
- **Disconnected Deployment**: The `sirsi-ai` site serves from `packages/sirsi-portal`, but the latest landing pages (`index.html`, `investor-login.html`, etc.) are in the repository root.
- **Missing index.html**: `packages/sirsi-portal` is missing its `index.html`, causing 404s for the root URL.
- **Broken Links**: `index-staging.html` (the newer staging page) links to `/investor-portal/index.html`, which does not exist in the portal package.
- **Resource 404s**: Critical scripts like `security-init.js` and `telemetry.js` are either missing or have incorrect paths.

## 2. Proposed Changes
- **Synchronize Canonical Files**: Copy the latest landing pages from the root to `packages/sirsi-portal`.
- **Align URLs**: Update links to use the correct static HTML file names (e.g., `investor-login.html` instead of `/investor-portal/index.html`).
- **Fix Asset Paths**: Ensure `assets/js/` contains all required security and telemetry scripts.
- **Enable Clean URLs**: Ensure Firebase Hosting is configured to handle `.html` extension removal if desired (already in `firebase-hosting-headers.json`).

## 3. Implementation Steps
1. **Prepare packages/sirsi-portal**:
   - Copy `index.html`, `investor-login.html`, `investor-portal.html`, `signup.html`, `documentation.html`, `pitch-deck.html` to `packages/sirsi-portal/`.
   - Copy root `assets/` recursively to `packages/sirsi-portal/assets/`.
2. **Update index.html (Portal)**:
   - Ensure it is the latest version.
   - Fix any broken internal links.
3. **Verify security-init.js**:
   - Ensure it is present in `packages/sirsi-portal/assets/js/`.
4. **Deploy**:
   - Run `firebase deploy --only hosting:sirsi-ai --project sirsi-nexus-live`.

## 4. Verification
- Use browser-subagent to visit `sirsi.ai`.
- Verify the landing page loads (no 404).
- Verify the "Investor Portal" link works.
- Verify the login form accepts demo credentials (`demo` / `investor2025`).
