# Security Integration Quick Reference

## 🚀 Quick Start

### 1. Add Security to Your Page

```html
<!-- Add this line to enable security -->
<script src="/assets/js/security-init.js"></script>
```

That's it! Security features are now active.

## 🔍 Testing in Browser Console

```javascript
// Check if security is loaded
window.securityInit

// Is user authenticated?
window.securityInit.isAuthenticated()

// View security configuration
window.securityInit.getConfig()

// Check audit logs
window.securityInit.getAuditLogs()

// Test session warning
window.securityInit.showInactivityWarning()

// Manually trigger logout
window.securityInit.logout()
```

## 📍 Key Locations

| Feature | URL |
|---------|-----|
| Admin Security Dashboard | `/admin/security/index.html` |
| System Logs | `/admin/dashboard/system-logs.html` |
| User Management | `/admin/users/` |
| Documentation | `/admin/documentation.html` |

## 🛡️ Security Features Status

Check in console:
```javascript
// See what's enabled
const config = window.securityInit.getConfig();
console.table({
    'Authentication': config.enableAuth,
    'CSRF Protection': config.enableCSP,
    'Audit Logging': config.enableAudit,
    '2FA Support': config.enable2FA,
    'Session Timeout': config.sessionTimeout / 1000 / 60 + ' minutes'
});
```

## 🔐 Common Security Operations

### Check Session Status
```javascript
// Get session info
const session = window.securityInit.checkSession();
console.log('Session valid:', session.isValid);
console.log('Time remaining:', session.timeRemaining);
```

### View Recent Security Events
```javascript
// Last 5 security events
window.securityInit.getAuditLogs().slice(-5).forEach(log => {
    console.log(`[${log.timestamp}] ${log.eventType}: ${log.description}`);
});
```

### Test CSRF Protection
```javascript
// Generate a CSRF token
const token = window.securityInit.generateCSRFToken();
console.log('CSRF Token:', token);
```

### Monitor XSS Attempts
```javascript
// Subscribe to XSS detection
window.securityInit.on('security:xss-detected', (event) => {
    console.warn('XSS Attempt:', event);
});
```

## 🔧 Configuration Options

### Session Timeouts
```javascript
// Default: 24 hours
sessionTimeout: 24 * 60 * 60 * 1000

// Default: 15 minutes
inactivityWarning: 15 * 60 * 1000
```

### Security Features
```javascript
enableAuth: true           // Authentication system
enableCSP: true           // Content Security Policy
enableAudit: true         // Audit logging
enable2FA: true           // Two-factor auth
enableEncryption: true    // Data encryption
```

## 📊 Browser Storage

Check these in DevTools > Application > Storage:

**Session Storage:**
- `authToken` - Current session token
- `csrfToken` - CSRF protection token
- `sessionStart` - Session timestamp
- `securityEvents` - Recent security events

**Local Storage:**
- `authenticated` - Authentication state
- `userRole` - Current user role
- `securityConfig` - Custom settings

## 🚨 Emergency Commands

```javascript
// Force logout all sessions
window.securityInit.forceLogout();

// Clear all security data
window.securityInit.clearAllData();

// Enable debug mode
window.securityInit.enableDebug = true;

// Disable security (testing only!)
window.securityInit.disable();
```

## 📈 Performance Monitoring

```javascript
// Check security overhead
console.time('SecurityCheck');
window.securityInit.performSecurityCheck();
console.timeEnd('SecurityCheck');

// Memory usage
const usage = window.securityInit.getMemoryUsage();
console.log('Security memory:', usage);
```

## 🐛 Debug Mode

Enable detailed logging:
```javascript
// Turn on debug mode
window.securityInit.enableDebug = true;

// Now all security operations will log details
window.securityInit.authenticate({
    email: 'test@example.com',
    password: 'test123'
});
// Will show detailed auth flow in console
```

## 📝 Event Listeners

```javascript
// Listen for security events
window.securityInit.on('auth:success', (user) => {
    console.log('Login successful:', user.email);
});

window.securityInit.on('auth:failed', (error) => {
    console.error('Login failed:', error);
});

window.securityInit.on('session:expired', () => {
    console.warn('Session has expired');
});

window.securityInit.on('security:threat', (threat) => {
    console.error('Security threat detected:', threat);
});
```

## 🔗 Integration Examples

### Custom Login Form
```javascript
// Manual authentication
async function customLogin(email, password) {
    try {
        const result = await window.securityInit.authenticate({
            email: email,
            password: password
        });
        
        if (result.success) {
            console.log('Login successful!');
            window.location.href = '/dashboard';
        } else {
            console.error('Login failed:', result.error);
        }
    } catch (error) {
        console.error('Authentication error:', error);
    }
}
```

### Protected API Call
```javascript
// Add security headers to API requests
async function secureAPICall(endpoint, data) {
    const token = sessionStorage.getItem('authToken');
    const csrfToken = window.securityInit.generateCSRFToken();
    
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
```

## 💡 Tips

1. **Always check authentication** before sensitive operations
2. **Monitor audit logs** regularly for suspicious activity
3. **Test security features** in development before production
4. **Keep security scripts updated** with latest versions
5. **Use HTTPS** in production environments

## 🆘 Need Help?

- Check main documentation: `/docs/SECURITY_INTEGRATION_GUIDE.md`
- Admin security dashboard: `/admin/security/`
- Email support: security@sirsinexus.com
