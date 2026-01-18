# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is the GitHub Pages repository for SirsiNexus, hosting the public documentation, investor portal, and marketing content. The repository auto-deploys to https://sirsimaster.github.io/ when changes are pushed to the main branch.

## Common Development Commands

### Local Development Server
```bash
# Using Python (recommended for static sites)
python3 -m http.server 8000

# Using Jekyll (if Jekyll features are needed)  
bundle exec jekyll serve --livereload

# Using Node.js development (in sirsinexusportal directory)
cd sirsinexusportal
npm install  # First time only
npm run dev  # Watches CSS and starts WebSocket server
```

### Building and Testing
```bash
# Build TailwindCSS (from sirsinexusportal directory)
cd sirsinexusportal
npm run build-css

# Validate site for merge conflicts and accessibility
./validate-site.sh

# Update version across all pages
cd sirsinexusportal
node update-version.js "0.8.0-beta" "production"
```

### Deployment Commands
```bash
# Standard deployment to GitHub Pages
git add .
git commit -m "Your descriptive message"
git push origin main

# Safe deployment with cooldown protection
./deploy-safeguard.sh

# Switch development context
./dev-context.sh pages  # For GitHub Pages work
./dev-context.sh app    # For application work
```

### Git Workflow
```bash
# Create feature branch for development
git checkout -b feature/new-feature

# Push feature branch and create PR
git push origin feature/new-feature

# View recent changes (use --no-pager to avoid pagination)
git --no-pager log --oneline -10
git --no-pager diff HEAD~1
```

## Architecture and Structure

### Directory Layout
```
/
├── sirsinexusportal/          # Main portal application
│   ├── admin/                 # Admin dashboard and tools
│   │   ├── dashboard/        # System monitoring pages
│   │   ├── security/         # Security management
│   │   └── users/            # User management
│   ├── investor-portal/       # Investor-specific content
│   │   ├── committee/        # Committee member access
│   │   └── data-room/        # Secure document repository
│   ├── assets/                # Static resources
│   │   ├── js/               # JavaScript files including security
│   │   ├── css/              # Stylesheets (TailwindCSS)
│   │   └── images/           # Images and icons
│   ├── components/            # Reusable UI components
│   └── docs/                  # Technical documentation
├── index.html                 # Root landing page
├── index-staging.html         # Staging version for testing
└── _config.yml               # Jekyll configuration
```

### Key Systems

#### Security Integration
The application includes a comprehensive security layer (`security-init.js`, `secure-auth.js`, `auth-integration.js`) that provides:
- Automatic authentication integration on all pages
- Session management with 24-hour timeout and inactivity warnings
- CSRF protection with automatic token injection
- XSS prevention and DOM monitoring
- Audit logging of all security events
- Optional 2FA support

Security is automatically loaded on pages containing login forms, admin panels, or protected content.

#### Dynamic Version System
Version information is centralized in `sirsinexusportal/version.json` and automatically loaded on all pages via `version-loader.js`. Updates are made using:
```bash
node sirsinexusportal/update-version.js "VERSION" "ENVIRONMENT"
```

#### State Management
The state management system (`state-management.js`) provides:
- Loading spinners and skeleton loaders
- Empty state illustrations
- Error boundaries with retry mechanisms
- Offline detection and graceful degradation
- API wrapper with automatic retry

### Authentication Flow
1. User data is encrypted using AES-256-GCM
2. Passwords are hashed with PBKDF2 (100,000 iterations)
3. Session tokens are stored securely with expiration
4. Failed login protection locks accounts after 5 attempts
5. Email verification required for new registrations
6. Optional TOTP-based 2FA available

## Important Configuration Files

- `sirsinexusportal/version.json` - Current version and feature flags
- `sirsinexusportal/package.json` - Node.js dependencies and scripts
- `_config.yml` - Jekyll/GitHub Pages configuration
- `.well-known/` - Apple Pay and domain verification files

## Security Considerations

- All authentication data is encrypted before storage using AES-256-GCM
- CSRF tokens are automatically added to all forms
- XSS protection monitors DOM mutations
- Session management includes automatic timeout and inactivity warnings
- Audit logs track all security events
- Content Security Policy (CSP) headers are enforced

## Testing and Validation

### Check Security Status
```javascript
// In browser console
window.securityInit.isAuthenticated()
window.securityInit.getConfig()
window.securityInit.getAuditLogs()
```

### Validate Site Health
```bash
./validate-site.sh
```

### Test Loading States
```javascript
// In browser console
window.SirsiState.showLoadingSpinner(document.body, 'spinner')
window.SirsiState.showInactivityWarning()
```

## Deployment Notes

- Main branch auto-deploys to GitHub Pages (1-2 minute delay)
- Use feature branches for development to avoid accidental deployment
- Deploy safeguard script enforces 5-minute cooldown between deployments
- Always verify changes on live site after deployment: https://sirsimaster.github.io/

## Emergency Procedures

### Restore from Backup
```bash
# Backup exists at specified location
cp -r /Users/thekryptodragon/SirsiMaster.github.io-backup-20250718_004847/* .
git add .
git commit -m "Emergency restore from backup"
git push origin main
```

### Force Clear Security Data
```javascript
// In browser console for emergency logout
window.securityInit.forceLogout()
window.securityInit.clearAllData()
```

## 🚨 CRITICAL: Repository Merge Plan - ONE NIGHT OPERATION

**⚠️ URGENT ARCHITECTURE CHANGE:**
This repository (SirsiMaster.github.io) will be merging with the main application repository (**SirsiNexusApp**) to create a single unified frontend and backend solution. 

**THIS IS A COMPLEX OPERATION THAT MUST BE COMPLETED IN ONE NIGHT.**

### What This Involves:
- Merging SirsiMaster.github.io (Frontend/Portal) with SirsiNexusApp (Backend/Core)
- Consolidating all code into one repository
- Preserving Git history from both repositories
- Maintaining all GitHub Pages functionality
- Ensuring zero downtime for sirsi.ai
- Updating all CI/CD pipelines
- Redirecting all references and links

### Migration Timeline
- **Current State**: Two separate repositories
  - `SirsiMaster.github.io` - Frontend, Portal, Documentation
  - `SirsiNexusApp` - Backend, API, Core Services
- **Target State**: Single unified repository with modular architecture
- **Execution Window**: ONE NIGHT (8-hour window)
- **Migration Plan**: See `/docs/CRITICAL_MIGRATION_PLAN.md`

## IMPORTANT DEVELOPMENT GUIDELINES

### ⚠️ CRITICAL: Check Existing Workflows First
**DO NOT CREATE NEW INDEPENDENT WORKFLOWS** without first:
1. Checking all existing documentation and workflows
2. Reviewing the workflow assessment report
3. Examining existing admin panels, dashboards, and systems
4. Verifying no duplicate functionality exists

**Existing Major Systems:**
- Admin Dashboard: `/admin/`
- User Dashboard: `/dashboard/`
- Developer Portal: `/developer-portal.html`
- Investor Portal: `/investor-portal/`
- Security Management: `/admin/security/`
- Revenue Dashboard: `/admin/revenue-dashboard.html`
- System Monitoring: `/admin/monitoring.html`
- User Management: `/admin/users/`

## Developer Platform Innovation

### New GitHub-Integrated Development Platform
A comprehensive developer platform has been created that allows external developers to build on Sirsi using their GitHub accounts, mirroring our internal development environment.

#### Key Features:
1. **GitHub OAuth Integration**
   - Full repository management capabilities
   - Automatic project-to-repo synchronization
   - CI/CD pipeline integration

2. **Sirsi SDK**
   - Location: `/sdk/sirsi-sdk.js`
   - Modules: Infrastructure, AI, Deployment, Monitoring, Collaboration
   - Real-time WebSocket support
   - Full TypeScript definitions

3. **Developer Portal**
   - Location: `/developer-portal.html`
   - Project management dashboard
   - API key generation and management
   - Usage analytics and monitoring

4. **Firebase Integration**
   - Developer profiles in Firestore
   - Project metadata synchronization
   - Real-time collaboration features

### Developer Workflow:
```javascript
// Example SDK Usage
import SirsiSDK from '@sirsi/sdk';

const sirsi = new SirsiSDK({
    apiKey: 'developer-api-key',
    githubToken: 'github-pat'
});

// Create project with auto GitHub repo
await sirsi.createProject({
    name: 'my-app',
    createRepo: true
});

// Deploy from GitHub
await sirsi.deployment.deploy(projectId);

// Monitor in real-time
await sirsi.monitoring.getMetrics(resourceId);
```

## Related Resources

- Main Application Repository: https://github.com/SirsiMaster/SirsiNexusPortal
- Live Site: https://sirsimaster.github.io/
- Developer Portal: `/developer-portal.html`
- Sirsi SDK: `/sdk/sirsi-sdk.js`
- Admin Security Dashboard: `/admin/security/index.html`
- System Logs: `/admin/dashboard/system-logs.html`
