# SirsiNexus Warp Development Guide

## Overview
This guide explains how to use Warp workflows and rules for consistent development across the team.

## Using Warp Workflows

### For GitHub Pages Development:
```bash
# Open Warp workflow
warp workflow pages_workflow

# Follow the interactive prompts
```

### For Application Development:
```bash
# Open Warp workflow
warp workflow app_workflow

# Follow the interactive prompts
```

## Development Rules
All development must follow the rules defined in `.warp_rules`:

1. **Context Awareness**
   - Always use correct context
   - Respect cooldown periods
   - Follow directory structure

2. **Commit Guidelines**
   - Use conventional commit messages
   - Include issue numbers
   - Respect file limits

3. **Branch Management**
   - Use feature branches
   - Follow naming conventions
   - Keep branches up to date

4. **Deployment Safety**
   - Use deployment safeguards
   - Verify all changes
   - Respect cooldown periods

## Best Practices
1. Always start with the correct workflow
2. Follow all prompts completely
3. Verify changes before deployment
4. Keep documentation updated

## Common Issues
1. **Context Switching**: Wait for cooldown
2. **Failed Deployments**: Check logs
3. **Workflow Errors**: Verify current context

## Getting Help
- Review this guide
- Check workflow documentation
- Consult team lead for exceptions

