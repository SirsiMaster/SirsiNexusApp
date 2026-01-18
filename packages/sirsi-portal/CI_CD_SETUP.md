# 🚀 CI/CD Setup Guide for SirsiNexus

## Overview

This guide covers the complete setup for continuous integration and deployment of SirsiNexus using GitHub Actions and Firebase.

---

## ✅ Current Status

- **Firebase Project**: `sirsi-nexus-live` ✅
- **Live URL**: https://sirsi-ai.web.app ✅
- **GitHub Actions**: Configured ✅
- **Firebase Token**: Generated ✅

---

## 🔧 GitHub Actions Setup

### 1. Add Firebase Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secret:
   - **Name**: `FIREBASE_TOKEN`
   - **Value**: `[Token has been generated - check secure storage]`

### 2. Workflow Files

The following workflows are configured:

#### Main Deployment Workflow
**File**: `.github/workflows/firebase-deploy.yml`

**Triggers**:
- Push to main/master branch
- Pull requests
- Manual trigger

**Jobs**:
- **Test**: Runs linting and tests
- **Deploy**: Deploys to production (main branch only)
- **Preview**: Creates preview deployments for PRs

---

## 📋 Deployment Process

### Automatic Deployment

Every push to the `main` or `master` branch triggers:

1. **Testing Phase**
   - Linting checks
   - Unit tests
   - Build verification

2. **Deployment Phase**
   - Firebase Hosting deployment
   - Firestore rules update
   - Cloud Functions deployment
   - Deployment verification

3. **Notification**
   - Success/failure status
   - Live URLs
   - Console links

### Manual Deployment

To manually deploy from your local machine:

```bash
# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## 🔍 Preview Deployments

Pull requests automatically get preview deployments:

1. **Automatic Preview URL**
   - Created for each PR
   - Expires after 7 days
   - Commented on the PR

2. **Preview URL Format**
   ```
   https://sirsi-ai--pr-{number}-{hash}.web.app
   ```

---

## 📊 Monitoring Deployments

### GitHub Actions

Monitor deployments at:
```
https://github.com/[YOUR_USERNAME]/SirsiMaster.github.io/actions
```

### Firebase Console

View deployment history:
```
https://console.firebase.google.com/project/sirsi-nexus-live/hosting
```

### Cloud Functions Logs

Monitor function deployments:
```
https://console.firebase.google.com/project/sirsi-nexus-live/functions
```

---

## 🛠️ Configuration Files

### firebase.json
- Hosting configuration
- Security headers
- Cache policies
- URL rewrites

### .firebaserc
- Project aliases
- Default project

### GitHub Workflows
- `.github/workflows/firebase-deploy.yml` - Main CI/CD pipeline

---

## 🔐 Security Best Practices

1. **Token Security**
   - Never commit tokens to repository
   - Use GitHub Secrets for sensitive data
   - Rotate tokens periodically

2. **Branch Protection**
   - Enable branch protection on main/master
   - Require PR reviews
   - Require status checks

3. **Deployment Security**
   - Use service accounts for production
   - Limit deployment permissions
   - Enable audit logging

---

## 📈 Performance Optimization

### Caching Strategy

Current configuration:
- **Images**: 1 year cache
- **JS/CSS**: 1 year cache (immutable)
- **HTML**: 5 minutes cache
- **API responses**: No cache

### CDN Configuration

Firebase Hosting automatically provides:
- Global CDN
- SSL certificates
- HTTP/2 support
- Gzip compression

---

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check Firebase project
   firebase projects:list
   
   # Verify authentication
   firebase login
   ```

2. **Functions Not Deploying**
   ```bash
   # Check Node version
   node --version  # Should be v20
   
   # Rebuild functions
   cd functions && npm ci && npm run build
   ```

3. **Preview URL Not Working**
   ```bash
   # List hosting channels
   firebase hosting:channel:list
   ```

---

## 📝 Maintenance Tasks

### Weekly
- Review deployment logs
- Check error rates
- Monitor performance metrics

### Monthly
- Update dependencies
- Review security alerts
- Rotate tokens

### Quarterly
- Full security audit
- Performance review
- Cost optimization

---

## 🎯 Next Steps

1. **Enable Additional Services**
   - Firebase App Check
   - Firebase Remote Config
   - Firebase A/B Testing

2. **Enhanced Monitoring**
   - Set up Stackdriver alerts
   - Configure uptime monitoring
   - Create custom dashboards

3. **Advanced Features**
   - Blue-green deployments
   - Canary releases
   - Feature flags

---

## 📞 Support

### Firebase Support
- Documentation: https://firebase.google.com/docs
- Console: https://console.firebase.google.com
- Status: https://status.firebase.google.com

### GitHub Actions
- Documentation: https://docs.github.com/actions
- Status: https://www.githubstatus.com

---

## ✅ Checklist

- [x] Firebase project created
- [x] GitHub Actions workflow configured
- [x] Firebase token generated
- [ ] GitHub Secret added (FIREBASE_TOKEN)
- [ ] Branch protection enabled
- [ ] Monitoring alerts configured
- [ ] Custom domain configured
- [ ] SSL certificate verified

---

*Last Updated: December 11, 2024*
