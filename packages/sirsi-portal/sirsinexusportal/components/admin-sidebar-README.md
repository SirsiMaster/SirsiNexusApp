# Admin Sidebar Navigation Component

A comprehensive, responsive sidebar navigation component for the SirsiNexus admin interface.

## Features

✅ **Multi-Section Navigation** - All 7 requested sections with appropriate icons  
✅ **Line Art SVG Icons** - Beautiful, consistent line art icons for all sections  
✅ **Active State Highlighting** - Visual feedback for current section  
✅ **Collapsible Design** - Can be collapsed to save screen space  
✅ **Mobile Responsive** - Overlay design for mobile devices  
✅ **Dark Mode Support** - Seamless theme switching  
✅ **Persistent State** - Remembers collapsed state between sessions  
✅ **Smooth Animations** - Fluid transitions and micro-interactions  
✅ **Accessibility** - ARIA labels and keyboard navigation support  

## Navigation Sections

1. **Dashboard** - Analytics icon (📊)
2. **User Management** - Users icon (👥)
3. **Data Room** - Folder icon (📁)
4. **Telemetry** - Chart icon (📈)
5. **Site Admin** - Cog icon (⚙️)
6. **Security** - Shield icon (🛡️)
7. **System Logs** - Document icon (📄)

## Usage

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include required styles -->
    <link rel="stylesheet" href="assets/css/shared.css">
    <link rel="stylesheet" href="assets/css/common-styles.css">
</head>
<body>
    <!-- Add the sidebar component -->
    <admin-sidebar></admin-sidebar>
    
    <!-- Main content with sidebar-aware styling -->
    <main class="sidebar-content">
        <!-- Your content here -->
    </main>
    
    <!-- Include the component script -->
    <script src="components/admin-sidebar.js"></script>
</body>
</html>
```

### JavaScript API

```javascript
// Get sidebar instance
const sidebar = document.querySelector('admin-sidebar');

// Set active section programmatically
sidebar.setActiveSection('dashboard');

// Open mobile sidebar
sidebar.openMobileSidebar();

// Toggle sidebar (programmatically)
sidebar.toggleSidebar();
```

### Events

The component dispatches several custom events:

```javascript
// Listen for sidebar toggle
document.addEventListener('sidebar-toggle', function(e) {
    console.log('Sidebar state:', e.detail);
    // { collapsed: boolean, mobile: boolean }
});

// Listen for navigation clicks
document.addEventListener('sidebar-navigation', function(e) {
    console.log('Navigation:', e.detail);
    // { sectionId: string, href: string }
});

// Listen for logout
document.addEventListener('admin-logout', function(e) {
    console.log('Logout requested');
    // Handle logout logic
});
```

## Styling

The component includes comprehensive CSS styling that automatically adapts to light/dark themes. Key CSS classes:

- `.admin-sidebar` - Main sidebar container
- `.admin-sidebar.collapsed` - Collapsed state
- `.admin-sidebar.mobile-open` - Mobile overlay state
- `.sidebar-content` - Content area with proper margins
- `.nav-item.active` - Active navigation item

### Mobile Responsiveness

On screens smaller than 768px:
- Sidebar transforms to overlay mode
- Hidden by default (translateX(-100%))
- Activated with `.mobile-open` class
- Includes backdrop overlay for dismissing

### Customization

You can customize the navigation sections by modifying the `navigationSections` array in the constructor:

```javascript
this.navigationSections = [
    {
        id: 'custom-section',
        title: 'Custom Section',
        href: '/custom-path.html',
        icon: this.getCustomIcon(),
        active: false
    }
    // ... more sections
];
```

## Integration Examples

### With Admin Dashboard

See `admin-dashboard.html` for a complete integration example.

### With Theme Toggle

```javascript
// The sidebar automatically respects dark mode classes
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}
```

### Mobile Menu Button

```html
<button class="mobile-menu-btn" onclick="toggleMobileSidebar()">
    <svg><!-- hamburger icon --></svg>
</button>

<script>
function toggleMobileSidebar() {
    const sidebar = document.querySelector('admin-sidebar');
    if (sidebar) {
        sidebar.toggleSidebar();
    }
}
</script>
```

## Browser Support

- Chrome 60+
- Firefox 63+
- Safari 12+
- Edge 79+

Requires support for:
- CSS Custom Properties
- CSS Grid
- Custom Elements (Web Components)
- ES6 Classes

## File Structure

```
components/
├── admin-sidebar.js          # Main component file
├── admin-sidebar-README.md   # This documentation
└── ...

assets/css/
├── shared.css               # Required base styles
├── common-styles.css        # Additional shared styles
└── ...
```

## Performance Notes

- Component styles are injected only once per page
- Icons are inline SVG for optimal performance
- Smooth CSS transitions with hardware acceleration
- Efficient event handling with delegation
- Local storage integration for state persistence

## Troubleshooting

### Common Issues

1. **Sidebar not showing**: Ensure the component script is loaded after the DOM
2. **Styling conflicts**: Check for CSS conflicts with existing styles
3. **Mobile overlay not working**: Verify viewport meta tag is present
4. **Icons not displaying**: Check that SVG content is properly formatted

### Debug Mode

Enable console logging for debugging:

```javascript
// In browser console
localStorage.setItem('admin-sidebar-debug', 'true');
```

This will log navigation events, state changes, and other debugging information.
