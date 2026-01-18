# Core Application Pages to Test

## 🎯 Priority 1: Essential Pages (Test These First)

### 1. Main Entry Points
```
http://localhost:8000/index.html
http://localhost:8000/about.html
http://localhost:8000/business-case.html
```

### 2. Authentication Flow
```
http://localhost:8000/auth/login.html
http://localhost:8000/auth/register.html
http://localhost:8000/dashboard/index.html
```

### 3. Admin Dashboard
```
http://localhost:8000/admin/index.html
http://localhost:8000/admin/analytics-dashboard.html
http://localhost:8000/admin/revenue-dashboard.html
```

### 4. Documentation
```
http://localhost:8000/docs/api-documentation.html
http://localhost:8000/developer-portal.html
```

## 🔍 Priority 2: Business Features

### 5. Investor Portal
```
http://localhost:8000/investor-portal/index.html
http://localhost:8000/investor-portal/data-room.html
http://localhost:8000/investor-portal/committee/index.html
```

### 6. Payment & Pricing
```
http://localhost:8000/pricing.html
http://localhost:8000/payments.html
```

### 7. Contact & Legal
```
http://localhost:8000/contact.html
http://localhost:8000/legal/privacy-policy.html
http://localhost:8000/legal/terms-of-service.html
```

## 🧪 Testing Steps for Each Page

### Step 1: Visual Check
- [ ] Page loads completely
- [ ] Layout is correct
- [ ] Images load
- [ ] Fonts render properly
- [ ] Colors match design

### Step 2: Console Check
Open browser console (F12) and verify:
- [ ] No red errors
- [ ] Services initialized (check for "[ServiceName] initialized" messages)
- [ ] No 404 errors for resources

### Step 3: Functionality Check
Test page-specific features:
- **Login**: Can you sign in?
- **Register**: Can you create account?
- **Dashboard**: Does data load?
- **Admin**: Are charts rendering?

### Step 4: Service Verification
Run in console:
```javascript
// Quick service check
const checkServices = () => {
  const services = {
    'Firebase': typeof firebase !== 'undefined',
    'Performance': !!window.performanceMonitor,
    'Errors': !!window.errorTracker,
    'Email': !!window.emailService,
    'Notifications': !!window.notificationService,
    'Backup': !!window.backupService,
    'Security': !!window.securityHeaders,
    'Onboarding': !!window.onboardingService
  };
  
  console.table(services);
  
  // Count loaded services
  const loaded = Object.values(services).filter(v => v).length;
  console.log(`✅ ${loaded}/8 services loaded`);
  
  return services;
};

checkServices();
```

## 📱 Mobile Testing
Test these pages on mobile viewport:
1. Homepage (index.html)
2. Login page
3. Dashboard
4. Documentation

## 🚀 Quick Test Command
Copy and run in console on any page:
```javascript
// Complete health check
(() => {
  console.log('=== SIRSINEXUS HEALTH CHECK ===');
  
  // Check Firebase
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase loaded');
    console.log('   Auth:', !!firebase.auth());
    console.log('   Firestore:', !!firebase.firestore());
    console.log('   User:', firebase.auth().currentUser?.email || 'Not logged in');
  } else {
    console.log('❌ Firebase not loaded');
  }
  
  // Check services
  const services = ['performanceMonitor', 'errorTracker', 'emailService', 
                   'notificationService', 'backupService', 'securityHeaders', 
                   'onboardingService'];
  
  services.forEach(service => {
    console.log(window[service] ? `✅ ${service}` : `❌ ${service}`);
  });
  
  // Performance check
  if (window.performanceMonitor) {
    const score = window.performanceMonitor.getScore();
    console.log(`📊 Performance Score: ${score}/100`);
  }
  
  // Show notification if service exists
  if (window.notificationService) {
    window.notificationService.showNotification({
      title: '✅ Health Check Complete',
      body: 'All systems operational!',
      type: 'success',
      duration: 3000
    });
  }
})();
```

## 📝 Issues Log
Document any issues found during testing:

| Page | Issue | Severity | Status |
|------|-------|----------|--------|
| Example | Description | High/Medium/Low | Open/Fixed |
|  |  |  |  |

## ✅ Sign-off Checklist
- [ ] All Priority 1 pages tested
- [ ] Authentication flow works
- [ ] Admin dashboard functional
- [ ] No critical JavaScript errors
- [ ] Services loading correctly
- [ ] Mobile responsive
- [ ] Ready for Phase 2 (SirsiNexusApp hygiene)
