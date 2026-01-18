# SirsiNexus Deployment Guide

## Preventing Commit-Push Storms

To prevent rapid, uncontrolled deployments, we've implemented several safeguards:

1. **Cooldown Period**: 5 minutes between deployments
2. **Branch Protection**: Only deploy from main or gh-pages
3. **Change Verification**: No uncommitted changes allowed
4. **Deployment Logging**: All deployments are logged

## Deployment Process

1. **Prepare Changes**:
   ```bash
   git add .
   git commit -m "Clear, descriptive message"
   ```

2. **Use Deployment Script**:
   ```bash
   ./deploy-safeguard.sh
   ```

3. **Verify Deployment**:
   - Check GitHub Pages site
   - Review deployment log
   - Wait for cooldown before next deployment

## Common Issues

1. **Too Many Rapid Deployments**:
   - Wait for cooldown period
   - Combine changes into single deployments

2. **Failed Deployments**:
   - Check error messages
   - Verify branch status
   - Review uncommitted changes

## Best Practices

1. Group related changes together
2. Use clear commit messages
3. Test locally before deployment
4. Follow cooldown periods
5. Keep deployment log clean

