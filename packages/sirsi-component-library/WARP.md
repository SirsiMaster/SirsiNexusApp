# SirsiMaster Component Library - WARP Rules

## 🎯 UNIVERSAL REPOSITORY PURPOSE

This is the **MASTER COMPONENT LIBRARY** for all SirsiMaster projects. Everything created here is designed to be reused across ALL repositories and projects. This is our single source of truth for:

- **UI Components**: Buttons, forms, cards, layouts
- **CI/CD Pipelines**: Universal deployment workflows
- **Development Tools**: Scripts, utilities, configurations
- **Design Systems**: Colors, typography, spacing
- **Documentation**: Best practices, templates, guides

## ⚠️ CRITICAL GOVERNANCE RULES (MUST FOLLOW)

### **RULE 1: UNIVERSAL FIRST PRINCIPLE**
**Everything in this repository MUST be:**
- Generic and reusable across multiple projects
- Well-documented with examples
- Tested and proven in at least one production project
- Version-controlled with semantic versioning
- **NEVER** project-specific - abstractions only

### **RULE 2: NO DUPLICATION POLICY**
**Before creating anything new:**
- Check if it already exists in this library
- Check if something similar can be extended
- If creating new, ensure it replaces all project-specific versions
- Update all projects to use the library version
- **NEVER** duplicate work across projects

### **RULE 3: DOCUMENTATION MANDATORY**
**Every component/tool MUST have:**
- README with usage examples
- API documentation
- Integration guide
- Migration path from old versions
- Live demo or playground when applicable

## 📦 Repository Structure

```
sirsimaster-component-library/
├── WARP.md                          # This file - Universal rules
├── README.md                        # Repository overview
│
├── ui-components/                   # Universal UI Components
│   ├── buttons/
│   │   ├── README.md
│   │   ├── button.css
│   │   ├── button.js
│   │   └── examples/
│   ├── forms/
│   ├── cards/
│   ├── layouts/
│   ├── navigation/
│   └── dist/
│       └── sirsimaster-ui.css      # Combined CSS bundle
│
├── cicd-pipelines/                  # Universal CI/CD Templates
│   ├── README.md
│   ├── github-actions/
│   │   ├── universal-deploy.yml
│   │   ├── pr-checks.yml
│   │   └── rollback.yml
│   ├── scripts/
│   │   ├── setup-pipeline.js
│   │   ├── deploy.js
│   │   └── rollback.js
│   └── examples/
│       └── implementations.md
│
├── development-tools/               # Reusable Scripts & Tools
│   ├── scripts/
│   │   ├── verify-completion.sh
│   │   ├── update-metrics.js
│   │   └── setup-project.js
│   ├── configs/
│   │   ├── eslint.config.js
│   │   ├── prettier.config.js
│   │   └── tsconfig.json
│   └── templates/
│       ├── project-template/
│       └── component-template/
│
├── design-system/                   # Universal Design Tokens
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   ├── shadows.css
│   └── tokens.json
│
├── documentation/                   # Guides and Best Practices
│   ├── getting-started.md
│   ├── integration-guide.md
│   ├── migration-guide.md
│   └── best-practices.md
│
└── playground/                      # Interactive Examples
    ├── index.html
    ├── ui-showcase.html
    └── examples/
```

## 🚀 Quick Start for Any Project

### Using UI Components
```html
<!-- Add to any HTML file -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.css">

<!-- Use components -->
<button class="sm-btn sm-btn-primary">Click Me</button>
```

### Using CI/CD Pipeline
```bash
# In any project directory
npx @sirsimaster/setup-pipeline

# Or manually
curl -sSL https://raw.githubusercontent.com/sirsimaster/component-library/main/cicd-pipelines/scripts/setup-pipeline.js | node
```

### Using Development Tools
```bash
# Setup new project with all tools
npx @sirsimaster/create-project my-app

# Or add to existing project
npx @sirsimaster/add-tools
```

## 📋 Component Categories

### UI Components Available
- **Buttons**: Primary, Secondary, Success, Danger, Ghost, Outline
- **Forms**: Inputs, Selects, Checkboxes, Radio, Toggles
- **Cards**: Basic, Elevated, Interactive, Expandable
- **Navigation**: Sidebar, Header, Breadcrumbs, Tabs
- **Feedback**: Alerts, Toasts, Modals, Tooltips
- **Data**: Tables, Lists, Grids, Pagination
- **Layout**: Container, Grid, Flex, Spacing utilities

### CI/CD Pipelines Available
- **Providers**: Firebase, AWS, Azure, Vercel, Netlify
- **Frameworks**: React, Vue, Angular, Next.js, Vanilla
- **Features**: Testing, Caching, Security, Metrics, Rollback
- **Environments**: Development, Staging, Production

### Development Tools Available
- **Scripts**: Project setup, Component generation, Testing
- **Configs**: Linting, Formatting, TypeScript, Build
- **Templates**: Project starters, Component boilerplate
- **Utilities**: Verification, Metrics, Documentation

## 🔧 WARP AI Assistant Rules

When WARP AI is invoked in ANY project:

1. **ALWAYS CHECK THIS LIBRARY FIRST**
   - Before creating any UI component
   - Before setting up CI/CD
   - Before writing utility scripts

2. **USE LIBRARY COMPONENTS**
   ```javascript
   // GOOD - Use from library
   import { Button } from '@sirsimaster/component-library';
   
   // BAD - Creating locally
   const MyButton = () => {...}
   ```

3. **CONTRIBUTE BACK**
   - If something useful is created in a project
   - Abstract it and add to this library
   - Update the project to use library version

4. **VERSION EVERYTHING**
   - Use semantic versioning
   - Tag releases properly
   - Maintain changelog

## 📊 Usage Tracking

Track which projects use which components:

```yaml
# usage-registry.yml
projects:
  assiduous:
    ui-components: ["buttons", "cards", "navigation"]
    cicd: "firebase"
    version: "1.2.0"
  
  project-2:
    ui-components: ["buttons", "forms"]
    cicd: "aws"
    version: "1.2.0"
```

## 🔄 Update Protocol

When updating any component:

1. **Update in library first**
2. **Test in playground**
3. **Version and tag**
4. **Update all projects**:
   ```bash
   # Automated update script
   ./scripts/update-all-projects.sh
   ```

## 🎯 Integration Commands

### For New Projects
```bash
# Initialize with everything
npx @sirsimaster/init

# This will:
# 1. Add UI components
# 2. Setup CI/CD pipeline
# 3. Configure development tools
# 4. Create project structure
```

### For Existing Projects
```bash
# Add specific components
npx @sirsimaster/add ui-buttons
npx @sirsimaster/add cicd-firebase
npx @sirsimaster/add dev-tools
```

## 📝 Contribution Rules

1. **Generic Only**: No project-specific code
2. **Document Everything**: README, examples, API docs
3. **Test First**: Must work in playground
4. **Version Properly**: Follow semver
5. **Update Registry**: Track usage

## 🚨 WARP Commands

When in ANY project, WARP should recognize these commands:

```bash
# Check for updates
warp check-components

# Add component
warp add-component button

# Setup CI/CD
warp setup-pipeline firebase

# Update everything
warp update-library
```

## 📊 Success Metrics

- **Zero Duplication**: No component exists in multiple places
- **100% Reuse**: Every project uses library components
- **Quick Setup**: New project setup < 5 minutes
- **Consistent UI**: All projects look cohesive
- **Reliable Deployments**: Same CI/CD everywhere

## 🔗 CDN URLs

### Production (Latest)
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.js"></script>
```

### Specific Version
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@1.2.0/ui-components/dist/sirsimaster-ui.css">
```

## 🎓 Learning Resources

- **Documentation**: `/documentation/`
- **Examples**: `/playground/`
- **Video Tutorials**: [YouTube Channel]
- **Discord**: [Community Support]

## ⚡ Performance Guidelines

- **Bundle Size**: < 50KB for CSS, < 100KB for JS
- **Load Time**: < 100ms from CDN
- **Browser Support**: Last 2 versions
- **Mobile First**: All components responsive

## 🔐 Security Rules

- **No Secrets**: Never include API keys or tokens
- **No PII**: No personally identifiable information
- **Sanitize Inputs**: All components must sanitize
- **HTTPS Only**: Always use secure connections

---

## THE PRIME DIRECTIVE

**This library exists to ensure we NEVER write the same code twice.**

Every button, every deployment pipeline, every utility script should be written once, tested thoroughly, and reused everywhere. This is the way.

---

*Last Updated: 2025-09-09*
*Version: 1.0.0*
*Maintainer: SirsiMaster Development Team*
