# SirsiNexus Dynamic Version System

This document describes the dynamic version management system implemented for SirsiNexus investor portal.

## Overview

The dynamic version system centralizes version information in a single JSON file and automatically updates all pages that display version information. This eliminates the need to manually update version numbers across multiple HTML files.

## Files

### Core Files
- `version.json` - Central version configuration file
- `assets/js/version-loader.js` - JavaScript utility for loading and displaying version
- `update-version.js` - Node.js script for updating version information

### Updated Pages
- `investor-portal/kpi-unit-metrics.html`
- `investor-portal/committee/sales-strategy.html`
- (More pages can be updated to use the system)

## Usage

### Updating Version
```bash
# Update version with default environment (production)
node update-version.js "0.8.0-beta"

# Update version with specific environment
node update-version.js "0.8.0-beta" "staging"

# Update to production release
node update-version.js "1.0.0" "production"

# View help
node update-version.js --help
```

### Version File Structure
```json
{
  "version": "0.7.9-alpha",
  "build": "20250717",
  "status": "Live",
  "release_date": "2025-07-17",
  "release_notes": "Enhanced investor portal with dynamic version system",
  "environment": "production",
  "commit_hash": "latest",
  "features": {
    "investor_portal": true,
    "committee_access": true,
    "kpi_metrics": true,
    "sales_strategy": true,
    "product_roadmap": true,
    "market_analysis": true
  },
  "metadata": {
    "last_updated": "2025-07-17T02:03:00Z",
    "auto_update": true,
    "cache_duration": 300
  }
}
```

## Implementation

### HTML Changes
Pages using the dynamic version system need:

1. **Load the version loader script:**
   ```html
   <script src="../assets/js/version-loader.js"></script>
   ```

2. **Add CSS classes to version elements:**
   ```html
   <span class="version-badge">v0.7.9-alpha</span>
   <span class="status-indicator">Live</span>
   ```

### JavaScript Integration
The version loader automatically:
- Loads version data from `version.json`
- Updates elements with class `version-badge`
- Updates elements with class `status-indicator`
- Provides global access via `window.SirsiNexusVersion`
- Dispatches `versionLoaded` event when complete

### Environment-Based Status
| Environment | Status | Color |
|-------------|---------|--------|
| production  | Live   | Green  |
| staging     | Staging| Yellow |
| development | Development | Blue |

## Benefits

1. **Single Source of Truth**: All version information comes from one file
2. **Automatic Updates**: Version changes propagate to all pages automatically
3. **Environment Awareness**: Different environments can show different statuses
4. **Easy Deployment**: Simple script to update versions
5. **Caching**: Built-in caching to reduce server requests
6. **Extensible**: Easy to add new version-related features

## Adding New Pages

To add the dynamic version system to a new page:

1. Include the version loader script
2. Add appropriate CSS classes to version elements
3. Test that version information loads correctly

## Future Enhancements

- **Git Integration**: Automatically get commit hash from git
- **Build Automation**: Integrate with CI/CD pipeline
- **Version History**: Track version changes over time
- **Feature Flags**: Enable/disable features based on version
- **A/B Testing**: Support for different versions simultaneously

## Troubleshooting

### Version Not Loading
1. Check that `version.json` is accessible
2. Verify script path is correct for page location
3. Check browser console for errors

### Caching Issues
1. Clear browser cache
2. Check cache duration in `version.json`
3. Verify cache-control headers

### Update Script Issues
1. Ensure Node.js is installed
2. Run script from project root directory
3. Check file permissions for `version.json`
