# SirsiNexus Portal (sirsi.ai)

This repository contains the live SirsiNexus portal served via Firebase Hosting at https://sirsi.ai. GitHub Pages is now deprecated and only used for history.

## Current Production Hosting
- Host: Firebase Hosting (project: `sirsi-nexus-live`, site: `sirsi-ai`)
- Live Root: https://sirsi.ai
- Legacy Redirects:
  - `/sirsinexusportal` -> `/` (301)
  - `/**` -> `/**` (301)

## Key Changes (September 2025)
- Firebase Hosting now serves from `sirsinexusportal/` directory at the site root
- Removed SPA catch-all rewrite so deep links resolve to actual static pages
- Investor/Admin demo accounts migrated to Firebase Auth and Firestore (seeded and locked)
- Username requirement added to registration (users must set a unique username after email signup)
- Temporary unlock function removed; seeding endpoint remains locked and key-protected

## Auth Model
- Registration: email + password (email verification required)
- Username: required and unique; set immediately after registration
  - Backend callable: `setUsername`
  - Firestore mapping: `usernames/{username}` -> `{ uid, reservedAt }`
- Investor ID flow remains supported (e.g., `INV001/DEMO2025`)

### Seeded Demo Accounts (Firebase Auth)
- Admin: `ADMIN / ADMIN2025`
- Investors: `INV001 / DEMO2025`, `INV002 / BETA2025`
- Guest: `GUEST / GUEST2025`

## Deployment
- Hosting: `firebase deploy --only hosting`
- Functions: `firebase deploy --only functions`

### firebase.json (hosting)
- `public: "sirsinexusportal"`
- Redirects from legacy `/sirsinexusportal` paths to root
- Headers for cache and security

## Local Development
- Optional local preview: `firebase emulators:start` or `python3 -m http.server 8000`

## Related Repositories
- Main Application: https://github.com/SirsiMaster/SirsiNexusPortal

## Notes
- GitHub Pages URL (legacy): https://sirsimaster.github.io/ (deprecated)
- Do not introduce new auth flows/pages without explicit approval (see WARP.md)
