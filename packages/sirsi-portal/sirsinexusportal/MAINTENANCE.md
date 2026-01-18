# SirsiMaster.github.io Maintenance Guide

## Repository Setup Information

### Active Directory Path
- **Local Repository**: `/Users/thekryptodragon/SirsiMaster.github.io`
- **Remote Repository**: `https://github.com/SirsiMaster/SirsiMaster.github.io.git`
- **Current Branch**: `main`
- **GitHub Pages URL**: `https://sirsimaster.github.io/`

### Backup Location
- **Single Backup Directory**: `/Users/thekryptodragon/SirsiMaster.github.io-backup-20250718_004847`
- **Created**: July 18, 2025 at 00:48:47
- **Purpose**: Complete backup of repository state before major changes

## Repository Purpose
This repository contains the GitHub Pages content for SirsiNexus platform:
- Public documentation
- Investor portal
- Marketing content
- User guides

## Adding New Content and Pushing Changes

### Step 1: Navigate to Repository
```bash
cd /Users/thekryptodragon/SirsiMaster.github.io
```

### Step 2: Create New Content
1. Add your new files or edit existing ones
2. For new pages, ensure they follow the existing structure
3. Update navigation menus if needed

### Step 3: Test Changes Locally (Recommended)
```bash
# If using Jekyll (GitHub Pages default)
bundle exec jekyll serve --livereload

# Or serve static files
python3 -m http.server 8000
```

### Step 4: Stage and Commit Changes
```bash
# Check status
git status

# Add specific files
git add filename.html filename.md

# Or add all changes
git add .

# Commit with descriptive message
git commit -m "Add new content: brief description of changes"
```

### Step 5: Push Changes
```bash
# Push to main branch (auto-deploys to GitHub Pages)
git push origin main
```

### Step 6: Verify Deployment
1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Check the live site: https://sirsimaster.github.io/
3. Verify your changes are visible and working correctly

## Best Practices for Content Management

### Branch Strategy
- **Main Branch**: Production-ready content that auto-deploys
- **Feature Branches**: For development and testing
  ```bash
  git checkout -b feature/new-page
  # Make changes
  git push origin feature/new-page
  # Create PR to merge into main
  ```

### File Organization
- Keep consistent file naming (lowercase, hyphens)
- Organize content in logical directories
- Update any internal links when moving files

### Safety Measures
- Always test changes locally before pushing
- Keep commit messages descriptive
- Use feature branches for major changes
- Regularly check the live site after deployments

## Troubleshooting

### If GitHub Pages Fails to Deploy
1. Check repository settings → Pages section
2. Verify source branch is set to `main`
3. Check for build errors in Actions tab
4. Ensure no syntax errors in HTML/Markdown files

### If Changes Don't Appear
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Check if GitHub Pages is still building (Actions tab)
3. Verify files were actually committed and pushed
4. Check GitHub Pages cache (can take up to 10 minutes)

### Emergency Restoration
If major issues occur, restore from backup:
```bash
# Navigate to backup
cd /Users/thekryptodragon/SirsiMaster.github.io-backup-20250718_004847

# Copy contents to active directory
cp -r * /Users/thekryptodragon/SirsiMaster.github.io/

# Commit and push restoration
cd /Users/thekryptodragon/SirsiMaster.github.io
git add .
git commit -m "Restore from backup: emergency recovery"
git push origin main
```

## Key Files and Directories
- `README.md` - Repository overview and basic info
- `index.html` - Main landing page
- `_config.yml` - Jekyll configuration (if using Jekyll)
- `assets/` - CSS, JS, images, and other static files
- `docs/` - Documentation files (if organized this way)

## Maintenance Schedule
- **Monthly**: Review and update content
- **Quarterly**: Check for broken links
- **Bi-annually**: Review and update dependencies
- **Annually**: Create new backup and archive old ones

## Contact Information
For questions about this setup or repository maintenance, refer to the repository owners or maintainers listed in the GitHub repository settings.

---
*Last Updated: $(date +"%Y-%m-%d %H:%M:%S")*
*Backup Created: July 18, 2025 at 00:48:47*
