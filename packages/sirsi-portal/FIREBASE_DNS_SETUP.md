# Firebase Hosting DNS Configuration for sirsi.ai

## Current Status
- **Firebase Project:** sirsi-nexus-live
- **Firebase Hosting URL:** https://sirsi-nexus-live.web.app
- **Custom Domain:** sirsi.ai
- **Migration:** GitHub Pages → Firebase Hosting

## DNS Records Required for Firebase Hosting

### For Root Domain (sirsi.ai)

**Remove these GitHub Pages records:**
- A record @ → 185.199.108.153
- A record @ → 185.199.109.153
- A record @ → 185.199.110.153
- A record @ → 185.199.111.153

**Add these Firebase records:**
```
Type: A
Name: @ (or blank)
Value: 151.101.1.195
TTL: 3600

Type: A
Name: @ (or blank)
Value: 151.101.65.195
TTL: 3600
```

### For www Subdomain (www.sirsi.ai)

**Option 1 - CNAME (Preferred):**
```
Type: CNAME
Name: www
Value: sirsi-nexus-live.web.app
TTL: 3600
```

**Option 2 - A Records (if CNAME doesn't work):**
```
Type: A
Name: www
Value: 151.101.1.195
TTL: 3600

Type: A
Name: www
Value: 151.101.65.195
TTL: 3600
```

### Email Records (Keep These!)

**Autodiscover (for Outlook/Office 365):**
```
Type: CNAME
Name: autodiscover
Value: autodiscover.outlook.com
TTL: 3600
```

**MX Records (Keep all existing MX records for email):**
- Do not modify any MX records
- These handle your email routing

**SPF Record (if using Office 365):**
```
Type: TXT
Name: @ (or blank)
Value: v=spf1 include:spf.protection.outlook.com -all
TTL: 3600
```

## Setup Steps

### Step 1: Add Domain in Firebase Console

1. Go to: https://console.firebase.google.com/project/sirsi-nexus-live/hosting/sites
2. Click "Add custom domain"
3. Enter `sirsi.ai`
4. Firebase will show:
   - Either verification TXT record (add this first)
   - Or direct A records to add

### Step 2: Update GoDaddy DNS

1. Log into GoDaddy DNS Management
2. **Delete** old GitHub Pages A records for @
3. **Add** new Firebase A records as provided by Firebase
4. **Keep** all email-related records (MX, autodiscover CNAME)
5. **Add** www CNAME pointing to `sirsi-nexus-live.web.app`

### Step 3: Verify in Firebase

1. Return to Firebase Console
2. Click "Verify" after DNS propagation (can take up to 48 hours)
3. Firebase will provision SSL certificate automatically

## Firebase Hosting IPs (Standard)

Firebase typically uses these IPs, but always verify in the Firebase Console:
- 151.101.1.195
- 151.101.65.195

## Verification

After DNS propagation:
```bash
# Check DNS records
dig sirsi.ai
dig www.sirsi.ai

# Check if site loads
curl -I https://sirsi.ai
curl -I https://www.sirsi.ai

# Verify Firebase hosting
firebase hosting:sites:list
```

## Important Notes

1. **DO NOT DELETE** email-related records (MX, autodiscover)
2. **DNS Propagation** can take 15 minutes to 48 hours
3. **SSL Certificate** is automatically provisioned by Firebase after verification
4. **Both domains** (sirsi.ai and www.sirsi.ai) should be added in Firebase

## Troubleshooting

If the domain doesn't verify:
1. Check TXT record was added correctly for verification
2. Wait for full DNS propagation (use https://dnschecker.org)
3. Ensure no conflicting A records exist
4. Try using Firebase CLI: `firebase hosting:sites:create`

## Firebase CLI Commands

```bash
# Deploy to hosting
firebase deploy --only hosting

# List hosting sites
firebase hosting:sites:list

# Check deployment status
firebase hosting:channel:list

# Open Firebase Console
firebase open hosting:site
```

## Migration Checklist

- [ ] Deploy site to Firebase Hosting
- [ ] Add sirsi.ai in Firebase Console
- [ ] Add verification TXT record in GoDaddy
- [ ] Verify domain ownership in Firebase
- [ ] Remove GitHub Pages A records from GoDaddy
- [ ] Add Firebase A records to GoDaddy
- [ ] Add www CNAME to GoDaddy
- [ ] Restore autodiscover CNAME for email
- [ ] Verify MX records intact
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate provisioned
- [ ] Test sirsi.ai loads from Firebase
- [ ] Test www.sirsi.ai redirects properly
- [ ] Verify email still works
