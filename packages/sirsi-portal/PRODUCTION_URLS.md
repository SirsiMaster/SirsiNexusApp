# 🌐 SirsiNexus Production URLs

## ✅ Primary Domain: **sirsi.ai**

The SirsiNexus platform is live and accessible at the custom domain:

### 🔗 **https://sirsi.ai**

---

## 📍 All Production Endpoints

### Main Application
- **Primary**: https://sirsi.ai ✅
- **Firebase Default**: https://sirsi-ai.web.app ✅
- **Status**: Both URLs work and redirect to the same application

### API Endpoints
- **Health Check**: https://healthcheck-6kdf4or4qq-uc.a.run.app ✅
- **API Gateway**: https://api-6kdf4or4qq-uc.a.run.app ✅  
- **Payment Webhook**: https://handlepaymentwebhook-6kdf4or4qq-uc.a.run.app ✅

### Management Consoles
- **Firebase Console**: https://console.firebase.google.com/project/sirsi-nexus-live
- **Google Cloud Console**: https://console.cloud.google.com/home/dashboard?project=sirsi-nexus-live

---

## 🔒 Domain Configuration

### DNS Settings
- **Type**: A Record
- **Host**: @
- **Points to**: Firebase Hosting IP (199.36.158.100)
- **SSL**: Auto-provisioned by Firebase
- **HTTPS**: Enforced with HSTS

### Domain Verification
```bash
# Check domain status
curl -I https://sirsi.ai

# Verify DNS
nslookup sirsi.ai

# Test SSL
openssl s_client -connect sirsi.ai:443 -servername sirsi.ai
```

---

## 📱 Application Routes

### Public Pages
- https://sirsi.ai/ - Home
- https://sirsi.ai/about.html - About
- https://sirsi.ai/pricing.html - Pricing
- https://sirsi.ai/careers.html - Careers
- https://sirsi.ai/blog.html - Blog
- https://sirsi.ai/business-case.html - Business Case

### Portal Access
- https://sirsi.ai/investor-portal/ - Investor Portal
- https://sirsi.ai/admin/monitoring.html - Admin Dashboard

### Developer Resources
- https://sirsi.ai/documentation.html - Documentation
- https://sirsi.ai/developer-portal.html - Developer Portal

---

## 🚀 Why sirsi.ai?

1. **Professional Branding**: Clean, memorable domain that represents the brand
2. **SEO Benefits**: Better search engine ranking with custom domain
3. **Trust**: Custom domains build more user trust than subdomain URLs
4. **Email Integration**: Enables @sirsi.ai email addresses
5. **Marketing**: Easier to share and promote

---

## 📊 Domain Performance

| Metric | Value |
|--------|-------|
| **DNS Lookup** | < 20ms |
| **SSL Handshake** | < 50ms |
| **Time to First Byte** | < 100ms |
| **Full Page Load** | < 500ms |
| **Global CDN** | 200+ edge locations |

---

## 🔧 Maintenance

### Domain Renewal
- **Registrar**: [Check your registrar]
- **Expiration**: [Check domain expiry]
- **Auto-renewal**: Recommended

### SSL Certificate
- **Provider**: Firebase (Let's Encrypt)
- **Auto-renewal**: Yes
- **Expiry**: Auto-managed

---

## 📝 Notes

- The Firebase default URL (sirsi-ai.web.app) remains active as a fallback
- Both URLs serve the same content from Firebase Hosting
- The custom domain (sirsi.ai) should be used for all marketing and communications
- API endpoints remain on Cloud Run URLs for now (can be customized later)

---

*Last Updated: December 11, 2024*
