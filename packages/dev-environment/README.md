# Development Workspace

Welcome to your unified development environment. This workspace contains all your active projects organized for efficient development.

## 📁 Project Directory Structure

```
~/Development/
├── SirsiNexusApp/        # Main AI-powered infrastructure platform
├── SirsiMaster.github.io/ # Public website and investor portal
├── sirsi-opensign/       # Secure Document Vault & gRPC Services
│   ├── functions/        # Firebase Cloud Functions
│   ├── public/           # Web assets (admin portal, sign portal)
│   │   └── admin/        # Admin tools (contracts-manager, etc.)
│   └── services/         # Cloud Run microservices
│       └── contracts-grpc/ # Contracts gRPC service
├── assiduous/            # Assiduous project
├── sirsi-pitch-deck/     # Investor pitch deck and presentations
└── dev-tools/            # Development utilities and scripts
```

## 🚀 Quick Start Commands

After setup, you can use these commands from anywhere:

### Navigation Shortcuts
- `cddev` - Go to Development directory
- `cdapp` - Go to SirsiNexusApp
- `cdportal` - Go to SirsiMaster.github.io (portal)
- `cdassiduous` - Go to Assiduous project
- `cddeck` - Go to sirsi-pitch-deck

### Project Management
- `dev status` - Show status of all projects
- `dev start [project]` - Start a specific project
- `dev stop [project]` - Stop a specific project
- `dev update` - Pull latest changes for all git repos
- `dev clean` - Clean build artifacts and temp files

## 📋 Project Overview

### 1. SirsiNexusApp
**Purpose:** Core AI-powered infrastructure management platform  
**Tech Stack:** Node.js, React, Python (AI components)  
**Key Features:**
- Agent-embedded infrastructure
- Autonomous decision making
- Predictive optimization

### 2. SirsiMaster.github.io
**Purpose:** Public-facing website and investor portal  
**Tech Stack:** Jekyll, HTML/CSS/JS  
**URL:** https://sirsimaster.github.io  
**Key Features:**
- Product information
- Investor portal
- Documentation

### 3. Assiduous
**Purpose:** AI-powered real estate platform for property transactions  
**Tech Stack:** HTML5, CSS3, JavaScript ES6+, AI/ML ready  
**Key Features:**
- AI property matching and recommendations
- Automated market analysis and valuations
- Intelligent lead generation system
- Multi-language support (EN/ES)
- 24/7 AI assistant for real estate inquiries

### 4. sirsi-opensign (Secure Document Vault)
**Purpose:** Centralized signing, contracts, and payment processing for all Sirsi projects  
**Tech Stack:** Node.js, Firebase, Cloud Run, gRPC  
**URL:** https://sign.sirsi.ai  
**Key Features:**
- E-signature workflow with DocuSeal
- HMAC-signed secure redirects (ADR-003)
- Dynamic contract generation with theming
- Stripe payment integration
- gRPC Contracts Service: `https://contracts-grpc-210890802638.us-central1.run.app`

### 5. sirsi-pitch-deck
**Purpose:** Investor presentations and pitch materials  
**Tech Stack:** HTML presentations, PowerPoint exports  
**Key Features:**
- Interactive HTML presentations
- PDF and PPTX exports
- Investor deck materials

## 🛠️ Development Workflow

### Daily Workflow
1. Open terminal and run `dev status` to check all projects
2. Navigate to specific project using shortcuts (e.g., `cdapp`)
3. Use VS Code workspace for multi-project editing: `code ~/Development/workspace.code-workspace`
4. Commit changes regularly using git

### IDE Setup
- **VS Code:** Use the workspace file for multi-root editing
- **Terminal:** Use iTerm2 or Terminal with configured aliases
- **Git:** Each project has its own git repository

## 🔧 Environment Setup

### Required Tools
- Node.js (v18+)
- Python (3.9+)
- Git
- VS Code (recommended)

### First Time Setup
Run the setup script:
```bash
~/Development/setup-dev-env.sh
```

This will:
1. Install navigation aliases
2. Set up VS Code workspace
3. Configure git settings
4. Install project dependencies

## 📝 Common Tasks

### Starting Development Server
```bash
# For SirsiNexusApp
cdapp && npm start

# For SirsiMaster.github.io
cdportal && bundle exec jekyll serve

# For sirsi-pitch-deck
cddeck && python serve.py
```

### Checking Git Status Across All Projects
```bash
dev status
```

### Updating All Projects
```bash
dev update
```

## 🔗 Useful Links

- [SirsiNexus Documentation](./SirsiNexusApp/README.md)
- [Portal Documentation](./SirsiMaster.github.io/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Environment Setup](./ENVIRONMENT_SETUP_DOCUMENTATION.md)

## 💡 Tips

1. Use `dev status` frequently to stay aware of uncommitted changes
2. The VS Code workspace saves your open files across all projects
3. Use terminal splits to work on multiple projects simultaneously
4. Keep this README updated as projects evolve

---
*Last Updated: August 2024*
