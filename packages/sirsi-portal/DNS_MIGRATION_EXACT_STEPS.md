# EXACT DNS MIGRATION STEPS - Firebase Hosting Setup

## PART 1: Firebase Console Setup (5 minutes)

### Step 1: Open Firebase Hosting
1. Open browser
2. Go to: `https://console.firebase.google.com/project/sirsi-nexus-live/hosting/sites`
3. Sign in if needed

### Step 2: Add Custom Domain
1. Click the **"Add custom domain"** button
2. In the text field, type: `sirsi.ai`
3. Click **"Continue"**

### Step 3: Copy Verification Record
Firebase will show you a TXT record. It will look like:
```
Type: TXT
Host: @
Value: google-site-verification=XXXXXXXXXXXX
```
**COPY THIS VALUE** - you'll need it for GoDaddy

### Step 4: Keep Firebase Tab Open
Don't close this tab - you'll come back to click "Verify" after DNS setup

---

## PART 2: GoDaddy DNS Setup (10 minutes)

### Step 1: Login to GoDaddy
1. Go to: `https://godaddy.com`
2. Click **"Sign In"**
3. Enter credentials and login

### Step 2: Navigate to DNS Management
1. Click **"My Products"**
2. Find **"sirsi.ai"** domain
3. Click **"DNS"** button next to it

### Step 3: Add Firebase Verification TXT Record
1. Click **"ADD"** button
2. Fill in exactly:
   - **Type:** Select `TXT`
   - **Name:** Type `@`
   - **Value:** Paste the `google-site-verification=XXXXXXXXXXXX` value from Firebase
   - **TTL:** Select `1 hour`
3. Click **"Save"**

### Step 4: Wait 5 Minutes
DNS needs time to propagate

### Step 5: Go Back to Firebase
1. Return to Firebase tab
2. Click **"Verify"** button
3. Firebase will verify and show you the A records to add

---

## PART 3: Add Firebase A Records in GoDaddy

### Step 1: Firebase Will Show You Records
After verification, Firebase shows:
```
Add these A records:
Name: @
Value: 151.101.1.195

Name: @  
Value: 151.101.65.195
```

### Step 2: Delete Old GitHub Pages Records in GoDaddy
Find and DELETE these records (if they exist):
1. Find A record `@` → `185.199.108.153` → Click trash icon
2. Find A record `@` → `185.199.109.153` → Click trash icon
3. Find A record `@` → `185.199.110.153` → Click trash icon
4. Find A record `@` → `185.199.111.153` → Click trash icon

### Step 3: Add First Firebase A Record
1. Click **"ADD"**
2. Fill in exactly:
   - **Type:** Select `A`
   - **Name:** Type `@`
   - **Value:** Type `151.101.1.195`
   - **TTL:** Select `1 hour`
3. Click **"Save"**

### Step 4: Add Second Firebase A Record
1. Click **"ADD"**
2. Fill in exactly:
   - **Type:** Select `A`
   - **Name:** Type `@`
   - **Value:** Type `151.101.65.195`
   - **TTL:** Select `1 hour`
3. Click **"Save"**

### Step 5: Add WWW CNAME Record
1. Click **"ADD"**
2. Fill in exactly:
   - **Type:** Select `CNAME`
   - **Name:** Type `www`
   - **Value:** Type `sirsi-nexus-live.web.app`
   - **TTL:** Select `1 hour`
3. Click **"Save"**

### Step 6: Restore Email Autodiscover
1. Click **"ADD"**
2. Fill in exactly:
   - **Type:** Select `CNAME`
   - **Name:** Type `autodiscover`
   - **Value:** Type `autodiscover.outlook.com`
   - **TTL:** Select `1 hour`
3. Click **"Save"**

---

## PART 4: Complete Firebase Setup

### Step 1: Return to Firebase Console
1. Go back to Firebase tab
2. Click **"Continue"** or **"Finish Setup"**

### Step 2: Add WWW Domain Too
1. Click **"Add custom domain"** again
2. Type: `www.sirsi.ai`
3. Follow same verification process if needed

---

## PART 5: Verification Commands (Run These)

After 15-30 minutes, run these commands to verify:

```bash
# Check if DNS has propagated
dig sirsi.ai

# Should show:
# sirsi.ai.    3600    IN    A    151.101.1.195
# sirsi.ai.    3600    IN    A    151.101.65.195

# Check www subdomain
dig www.sirsi.ai

# Should show:
# www.sirsi.ai.    3600    IN    CNAME    sirsi-nexus-live.web.app.

# Test the site
curl -I https://sirsi.ai

# Should return: HTTP/2 200
```

---

## FINAL CHECKLIST

### In GoDaddy DNS, you should have:

✅ **Two A Records:**
- `@` → `151.101.1.195`
- `@` → `151.101.65.195`

✅ **Two CNAME Records:**
- `www` → `sirsi-nexus-live.web.app`
- `autodiscover` → `autodiscover.outlook.com`

✅ **One TXT Record:**
- `@` → `google-site-verification=XXXXXXXXXXXX`

✅ **Keep These (Don't Delete):**
- All MX records (for email)
- Any other TXT records for email (SPF, DKIM, DMARC)

❌ **Should NOT have:**
- Any A records pointing to `185.199.x.x` (GitHub Pages)
- Any CNAME for `www` pointing to `sirsimaster.github.io`

---

## TROUBLESHOOTING

### If sirsi.ai doesn't work after 1 hour:

1. **Check DNS Propagation:**
   - Go to: `https://dnschecker.org`
   - Enter: `sirsi.ai`
   - Should show `151.101.1.195` and `151.101.65.195`

2. **In Firebase Console:**
   - Status should show "Connected" with green checkmark
   - If still "Needs setup", click it and re-verify

3. **Common Issues:**
   - Typo in DNS records (double-check the IPs)
   - Old records not deleted (check for GitHub Pages IPs)
   - Browser cache (try incognito/private mode)

---

## IMPORTANT NOTES

⚠️ **DO NOT DELETE:**
- MX records (break email)
- SPF/DKIM/DMARC TXT records (break email security)
- Any record you didn't create or aren't sure about

✅ **ONLY MODIFY:**
- A records for `@` (root domain)
- CNAME for `www`
- Add the verification TXT record
- Add the autodiscover CNAME

🕐 **TIMING:**
- Verification TXT: Works in 5-15 minutes
- A records: Can take up to 48 hours (usually 30 minutes)
- SSL Certificate: Firebase provisions automatically after domain verified
