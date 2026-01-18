# Professional Admin Header Component

A comprehensive, enterprise-grade header component for SirsiNexus admin console with all requested features.

## Features

### ✅ Company Logo and "Admin Console" Title
- Stylized "SN" logo with gradient background
- Professional "Admin Console" title with subtitle
- Consistent branding across all admin pages

### ✅ Live Status Indicator
- Animated green dot showing system operational status
- Dynamic status updates (operational/warning/error states)
- Color-coded status messages

### ✅ Real-time Clock Display
- Live updating time display (24-hour format)
- Current date with professional formatting
- Automatic updates every second

### ✅ Professional Breadcrumb Navigation
- Dynamic breadcrumb trail
- Interactive navigation links
- Current page highlighting
- Programmatically updateable

### ✅ Theme Toggle Button
- Beautiful light/dark mode switcher
- Line art sun/moon icons
- Smooth animations and transitions
- Persistent theme preference

### ✅ Admin User Dropdown Menu
- User avatar with initials
- Professional dropdown with icons
- Profile settings access
- Help & support links
- Secure logout functionality

### ✅ Responsive Mobile Menu Toggle
- Hamburger menu for mobile devices
- Responsive design breakpoints
- Touch-friendly interaction

## Usage

### Basic Implementation
```html
<admin-header 
    breadcrumbs="Dashboard"
    user-name="Administrator"
    user-email="admin@sirsinexus.com">
</admin-header>
```

### Required Scripts
```html
<!-- Theme Toggle Script -->
<script src="assets/js/fresh-theme-toggle.js"></script>

<!-- Admin Header Component -->
<script src="components/admin-header.js"></script>
```

### Attributes
- `breadcrumbs` - Initial breadcrumb text
- `user-name` - Display name for user
- `user-email` - User email address

## API Methods

### Update Breadcrumbs
```javascript
const header = document.querySelector('admin-header');
header.updateBreadcrumbs([
    { text: 'Home', href: 'index.html' },
    { text: 'Admin', href: '#' },
    { text: 'Dashboard' }
]);
```

### Update System Status
```javascript
const header = document.querySelector('admin-header');
header.updateSystemStatus('operational', 'System Operational');
// Statuses: 'operational', 'warning', 'error'
```

## Events

### Admin Actions
```javascript
document.addEventListener('admin-action', function(e) {
    console.log('Action:', e.detail.action);
    // Actions: 'profile', 'preferences', 'help', 'logout'
});
```

### Logout Event
```javascript
document.addEventListener('logout', function(e) {
    // Handle user logout
    window.location.href = 'login.html';
});
```

### Mobile Menu Toggle
```javascript
document.addEventListener('mobile-menu-toggle', function(e) {
    // Handle mobile menu toggle
    toggleMobileMenu();
});
```

## Styling

The component uses Shadow DOM for style encapsulation and includes:
- Professional Inter font family
- Gradient backgrounds and subtle shadows
- Smooth hover animations
- Full responsive design
- Dark mode support
- Investment-ready aesthetics

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Files

- `components/admin-header.js` - Main component
- `admin-dashboard.html` - Implementation example
- `admin-header-demo.html` - Interactive demo
- `assets/js/fresh-theme-toggle.js` - Theme functionality

## Demo

Visit `admin-header-demo.html` for a complete interactive demonstration of all features.
