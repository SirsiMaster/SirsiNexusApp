# SirsiNexus Portal (sirsi.ai)

This directory contains the production portal content served at https://sirsi.ai via Firebase Hosting.

## Live URLs
- Root: https://sirsi.ai/
- Investor Login: https://sirsi.ai/investor-login.html
- Investor Portal: https://sirsi.ai/investor-portal/
- Admin Dashboard: https://sirsi.ai/admin/

## Hosting
- Firebase project: `sirsi-nexus-live`
- Site: `sirsi-ai`
- public: this `sirsinexusportal/` directory
- Redirects:
  - `/sirsinexusportal` -> `/` (301)
  - `/**` -> `/**` (301)

## Authentication
- Registration requires email + password; email verification sent
- Users must set a unique username immediately after registration
  - Backend callable: `setUsername`
  - Username rules: 3-30 chars, letters, numbers, `_` or `-`
- Investor ID flow remains supported for demo/testing

### Seeded Demo Accounts
- ADMIN / ADMIN2025 (admin)
- INV001 / DEMO2025 (investor)
- INV002 / BETA2025 (investor)
- GUEST / GUEST2025 (guest)

## Deploy
- Hosting: `firebase deploy --only hosting`
- Functions: `firebase deploy --only functions`

## Notes
- GitHub Pages is deprecated. Use https://sirsi.ai
