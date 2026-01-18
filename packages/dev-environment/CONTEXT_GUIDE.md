# Development Context Guide

## Overview
This repository supports two distinct development contexts:
1. GitHub Pages (Documentation & Public Content)
2. Core Application Development

## Using the Context Toggle

```bash
# Switch to GitHub Pages development
./dev-context.sh pages

# Switch to Application development
./dev-context.sh app

# Check current context
./dev-context.sh
```

## Context Details

### GitHub Pages Context
- Directory: SirsiNexus-Pages
- Purpose: Documentation, investor portal, public content
- URL: https://sirsimaster.github.io/SirsiNexus/
- Branch: gh-pages

### Application Context
- Directory: SirsiNexus-Core
- Purpose: Core application development
- Environment: Development/Testing
- Branch: main

## Best Practices
1. Always verify your context before making changes
2. Use appropriate deployment procedures for each context
3. Keep commits separate between contexts
4. Follow context-specific documentation

