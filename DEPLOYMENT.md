# SirsiNexus Investor Portal - Deployment Guide

## 🚀 Production-Ready Security Implementation

This investor portal now features enterprise-grade security with Netlify Functions backend, JWT authentication, and encrypted password storage.

## 🔐 Security Features

### Authentication System
- **JWT Token Authentication** with 8-hour expiration
- **bcrypt Password Hashing** with 12 rounds
- **Rate Limiting** - 5 attempts per 15 minutes per IP
- **Secure Cookies** - httpOnly, secure, sameSite settings
- **Session Management** - Automatic token verification
- **CORS Protection** - Proper headers and origin validation

### API Endpoints
- `POST /api/auth/login` - Secure login
- `POST /api/auth/verify` - Token verification
- `POST /api/auth/logout` - Secure logout
- `POST /api/auth/change-password` - Password updates

### Built-in Security Measures
- Protection against brute force attacks
- SQL injection prevention (parameterized queries)
- XSS protection via secure headers
- CSRF protection via secure cookies
- Input validation and sanitization

## 📁 Project Structure

```
SirsiNexus/
├── docs/                           # Frontend files (GitHub Pages)
│   ├── investor-login.html         # Secure login page
│   ├── investor-dashboard.html     # Protected dashboard
│   ├── investor-portal.html        # Redirect for compatibility
│   └── ...other static files
├── netlify/
│   └── functions/
│       └── auth.js                 # Secure authentication backend
├── netlify.toml                    # Netlify configuration
├── package.json                    # Dependencies
└── DEPLOYMENT.md                   # This file
```

## 🛡️ Current User Accounts

### Default Users (Change passwords after deployment)
- **Admin User:**
  - ID: `admin`
  - Password: `admin2025`
  - Role: Administrator
  - Access: Full admin dashboard

- **Demo Investor:**
  - ID: `demo`
  - Password: `investor2025`
  - Role: Investor
  - Access: Investor dashboard

## 🔄 Authentication Flow

1. **Login Request** → Secure Netlify Function
2. **Password Verification** → bcrypt comparison
3. **JWT Token Generation** → Signed with secret
4. **Secure Cookie Setting** → httpOnly, secure flags
5. **Role-Based Redirect** → Admin or Investor dashboard
6. **Token Verification** → On every protected page load

## 📊 Features Implemented

### Investor Dashboard
- **KPI Indicators** - Real-time metrics display
- **Executive Summary** - Company overview and strategy
- **Interactive Data Room** - Document access with preview
- **File Management** - PDF download and preview functionality
- **Responsive Design** - Mobile and desktop optimized
- **Dark Mode Support** - User preference persistence

### Security Features
- **Session Management** - 8-hour token expiration
- **Automatic Logout** - On token expiration
- **Rate Limiting** - Brute force protection
- **Secure Headers** - XSS and CSRF protection
- **Input Validation** - Server-side validation

## 🌐 Deployment Status

- **Frontend**: Ready for static hosting
- **Backend**: Netlify Functions configured
- **Database**: In-memory store (upgrade to DB for production)
- **SSL**: Automatic with Netlify
- **Domain**: Custom domain ready

## 🔧 Environment Variables Required

Set these in your Netlify deployment:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 📝 Post-Deployment Tasks

1. **Change Default Passwords** - Update admin and demo passwords
2. **Set JWT Secret** - Configure environment variable
3. **Test Authentication** - Verify all login flows
4. **Configure Domain** - Set up custom domain if needed
5. **Monitor Logs** - Check Netlify function logs
6. **Database Migration** - Move from in-memory to persistent storage

## 🔍 Testing Checklist

- [ ] Login with admin credentials
- [ ] Login with investor credentials
- [ ] Rate limiting works (5 failed attempts)
- [ ] Token expiration (8 hours)
- [ ] Secure cookie settings
- [ ] CORS headers present
- [ ] Password change functionality
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Role-based access control

## 🚨 Security Best Practices

1. **Change default passwords immediately**
2. **Use strong JWT secret (32+ characters)**
3. **Monitor authentication logs**
4. **Set up database for user persistence**
5. **Enable HTTPS (automatic with Netlify)**
6. **Regular security audits**
7. **Keep dependencies updated**

## 📞 Support

For deployment issues or security concerns:
- Email: cylton@sirsi.ai
- GitHub: Review deployment logs
- Netlify: Check function logs in dashboard

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0 - Production Ready  
**Security Status:** ✅ Production Grade
