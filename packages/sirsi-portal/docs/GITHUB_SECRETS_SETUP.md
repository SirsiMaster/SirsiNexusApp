# GitHub Secrets Configuration Guide

## Required Secrets for CI/CD

This guide walks you through setting up the necessary GitHub secrets for automated deployment and CI/CD workflows.

## Step 1: Generate Firebase Token

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate CI token
firebase login:ci
```

Copy the token that is displayed. This will be your `FIREBASE_TOKEN`.

## Step 2: Configure GitHub Secrets

1. Go to your repository on GitHub: https://github.com/SirsiMaster/SirsiMaster.github.io
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Required Secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `FIREBASE_TOKEN` | Your Firebase CI token | Generated in Step 1 |
| `FIREBASE_PROJECT_ID` | `sirsi-nexus-live` | Your Firebase project ID |
| `GITHUB_TOKEN` | (Auto-created) | GitHub automatically provides this |

### Optional Secrets (for enhanced features):

| Secret Name | Value | Description |
|------------|-------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | For payment processing |
| `STRIPE_WEBHOOK_SECRET` | Your webhook endpoint secret | For Stripe webhooks |
| `SENDGRID_API_KEY` | Your SendGrid API key | For email notifications |
| `SENTRY_DSN` | Your Sentry DSN | For error tracking |
| `GOOGLE_ANALYTICS_ID` | Your GA4 measurement ID | For analytics |

## Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        npm install -g firebase-tools
    
    - name: Build project
      run: npm run build
      env:
        FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Deploy to Firebase Hosting
      run: |
        firebase use ${{ secrets.FIREBASE_PROJECT_ID }}
        firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Deploy Firestore Rules
      run: firebase deploy --only firestore:rules --token ${{ secrets.FIREBASE_TOKEN }}
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Deploy Storage Rules
      run: firebase deploy --only storage:rules --token ${{ secrets.FIREBASE_TOKEN }}
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Deploy Cloud Functions
      run: firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
      if: github.ref == 'refs/heads/main'
```

## Step 4: Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
      continue-on-error: true
    
    - name: Run tests
      run: npm test
      continue-on-error: true
    
    - name: Check build
      run: npm run build
```

## Step 5: Environment-Specific Deployments

For staging/production separation, create `.github/workflows/staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Staging
      run: |
        firebase use staging
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Step 6: Protect Secrets in Code

Create `config/secrets.js`:

```javascript
// Never commit actual secrets to the repository
// Use environment variables or secret management services

const config = {
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'sirsi-nexus-live',
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
    secretKey: process.env.STRIPE_SECRET_KEY, // Only on server
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY, // Only on server
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || 'G-...',
  },
};

// Only expose non-sensitive config to client
if (typeof window !== 'undefined') {
  delete config.stripe.secretKey;
  delete config.sendgrid.apiKey;
}

export default config;
```

## Step 7: Verify Configuration

Run this script locally to verify your setup:

```bash
#!/bin/bash
# verify-secrets.sh

echo "Checking Firebase configuration..."
firebase projects:list

echo "Checking GitHub secrets (you'll see names only, not values)..."
gh secret list

echo "Testing Firebase deployment (dry run)..."
firebase deploy --only hosting --dry-run

echo "Configuration check complete!"
```

## Security Best Practices

1. **Never commit secrets to the repository**
2. **Use different secrets for staging/production**
3. **Rotate secrets regularly**
4. **Limit secret access to necessary workflows**
5. **Use GitHub Environments for additional protection**
6. **Enable secret scanning in repository settings**

## Troubleshooting

### Firebase Token Expired
```bash
firebase login:ci --force
```

### Permission Denied
Ensure your GitHub Actions have write permissions:
- Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

### Secret Not Found
- Check secret name spelling (case-sensitive)
- Ensure secret is in the correct repository
- Verify workflow has access to the secret

## Next Steps

1. Set up the required secrets in GitHub
2. Create the workflow files
3. Push to trigger the first deployment
4. Monitor Actions tab for build status
5. Set up branch protection rules

---

**Security Notice:** This guide contains instructions for handling sensitive information. Always follow security best practices and never expose secrets in logs, commits, or public repositories.
