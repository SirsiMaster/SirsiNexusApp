# Application Test URLs

## 🌐 Production URLs (sirsi.ai)
Open these in your browser to test the live production site:

### Main Application
- https://sirsi.ai
- https://sirsi.ai/
- https://sirsi.ai/index.html

### Authentication Pages
- https://sirsi.ai/auth/login.html
- https://sirsi.ai/auth/register.html

### User Dashboard
- https://sirsi.ai/dashboard/
- https://sirsi.ai/dashboard/index.html

### Admin Pages
- https://sirsi.ai/admin/analytics-dashboard.html
- https://sirsi.ai/admin/
- https://sirsi.ai/admin/seed-content.html

### Documentation
- https://sirsi.ai/docs/api-documentation.html

### Business Pages
- https://sirsi.ai/about.html
- https://sirsi.ai/contact.html
- https://sirsi.ai/business-case.html

---

## 💻 Local Development URLs (localhost:8000)
Open these to test your local development version:

### Main Application
- http://localhost:8000/
- http://localhost:8000/index.html

### Authentication Pages
- http://localhost:8000/auth/login.html
- http://localhost:8000/auth/register.html

### User Dashboard
- http://localhost:8000/dashboard/
- http://localhost:8000/dashboard/index.html

### Admin Pages
- http://localhost:8000/admin/analytics-dashboard.html
- http://localhost:8000/admin/
- http://localhost:8000/admin/seed-content.html

### Documentation
- http://localhost:8000/docs/api-documentation.html

### Business Pages
- http://localhost:8000/about.html
- http://localhost:8000/contact.html
- http://localhost:8000/business-case.html

---

## 🧪 Testing Instructions

### 1. Basic Page Load Test
Open each URL and verify:
- [ ] Page loads without errors
- [ ] No JavaScript errors in console
- [ ] All CSS styles applied correctly
- [ ] Images and assets load

### 2. Authentication Flow Test
1. Go to login page
2. Try to log in with test credentials
3. Verify redirect to dashboard
4. Check user session persists

### 3. Service Verification
Open browser console (F12) on any page and run:

```javascript
// Check if all services are loaded
console.log('Services Check:');
console.log('Performance Monitor:', !!window.performanceMonitor);
console.log('Error Tracker:', !!window.errorTracker);
console.log('Email Service:', !!window.emailService);
console.log('Notification Service:', !!window.notificationService);
console.log('Backup Service:', !!window.backupService);
console.log('Security Headers:', !!window.securityHeaders);
console.log('Onboarding Service:', !!window.onboardingService);

// Test notification
if (window.notificationService) {
  window.notificationService.showNotification({
    title: 'Test Notification',
    body: 'Services are working!',
    type: 'success'
  });
}
```

### 4. Firebase Connection Test
```javascript
// Check Firebase initialization
if (typeof firebase !== 'undefined') {
  console.log('Firebase initialized:', !!firebase.apps.length);
  console.log('Auth:', !!firebase.auth);
  console.log('Firestore:', !!firebase.firestore);
  console.log('Current user:', firebase.auth().currentUser);
}
```

### 5. Mobile Responsiveness Test
- Open Chrome DevTools (F12)
- Click device toggle (or press Ctrl+Shift+M)
- Test each page on mobile viewport

---

## 📋 Quick Checklist

### Core Pages Working:
- [ ] Homepage loads
- [ ] Login page functional
- [ ] Registration works
- [ ] Dashboard accessible
- [ ] Admin panel loads

### Services Active:
- [ ] All JavaScript services initialized
- [ ] Firebase connected
- [ ] No console errors
- [ ] Notifications appear

### Authentication:
- [ ] Can create account
- [ ] Can log in
- [ ] Session persists
- [ ] Can log out

### Performance:
- [ ] Pages load quickly (< 3s)
- [ ] No visual glitches
- [ ] Smooth interactions
- [ ] Mobile responsive
