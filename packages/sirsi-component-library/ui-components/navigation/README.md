# Navigation Components

## 🎯 Overview
Universal navigation components for consistent layout across all SirsiMaster projects. Includes admin headers, sidebars, and layout utilities.

## 📦 Components Included

### 1. Admin Header (`admin-header`)
A fully-featured admin header with search, notifications, and user menu.

**Files:**
- `admin-header.html` - Header template
- `admin-header.js` - Dynamic loader script
- `admin-layout.css` - Styling

**Usage:**
```html
<!-- Add to your page -->
<header id="admin-header-root" 
        data-title="Page Title" 
        data-subtitle="Page description"
        data-search-placeholder="Search..."
        data-actions='[{"label":"Action","icon":"<svg>...</svg>","onclick":"handler()"}]'>
</header>

<!-- Load the component -->
<script src="path/to/admin-header.js"></script>
```

**Features:**
- Dynamic title and subtitle
- Integrated search bar
- Custom action buttons
- User menu dropdown
- Notification badge
- Mobile responsive

### 2. Sidebar Navigation (`sidebar`)
A collapsible sidebar with multi-level navigation support.

**Files:**
- `sidebar.html` - Sidebar template
- `sidebar.js` - Dynamic loader and interactions

**Usage:**
```html
<!-- Add to your page -->
<aside id="sidebar-root" data-active="dashboard"></aside>

<!-- Load the component -->
<script src="path/to/sidebar.js"></script>
```

**Features:**
- Auto-highlight active page
- Collapsible sections
- Icon support
- Mobile hamburger menu
- Smooth animations
- Path resolution for any depth

### 3. Universal Header (`universal-header`)
A more generic header component for non-admin pages.

**Files:**
- `universal-header.html` - Template
- `universal-header.js` - Loader script

**Usage:**
```html
<header id="universal-header-root" 
        data-brand="App Name"
        data-nav-items='[{"label":"Home","href":"/"},{"label":"About","href":"/about"}]'>
</header>
```

## 🎨 Layout CSS (`admin-layout.css`)

Complete layout system including:
- CSS Grid layout structure
- Responsive breakpoints
- Color variables
- Typography scales
- Spacing utilities
- Animation classes

## 💡 Implementation Examples

### Complete Admin Layout
```html
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/navigation/admin-layout.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/dist/sirsimaster-ui.css">
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar -->
        <aside id="sidebar-root" data-active="dashboard"></aside>
        
        <!-- Main Content Area -->
        <main class="main-content">
            <!-- Header -->
            <header id="admin-header-root" 
                    data-title="Dashboard" 
                    data-subtitle="Welcome back!"
                    data-search-placeholder="Search...">
            </header>
            
            <!-- Page Content -->
            <div class="page-content">
                <!-- Your content here -->
            </div>
        </main>
    </div>
    
    <!-- Load Components -->
    <script src="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/navigation/sidebar.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/sirsimaster/component-library@latest/ui-components/navigation/admin-header.js"></script>
</body>
</html>
```

### Sidebar Navigation Items
The sidebar automatically includes these sections:
- **Main**: Dashboard, Properties, Clients, Agents, Transactions, Market Analysis
- **Reports**: Analytics, Reports, Insights
- **Management**: Knowledge Base, Contracts, Settings
- **Development** (optional): Dashboard, Costs, Analytics, Reports, Docs

### Customizing the Sidebar
```javascript
// After sidebar loads, you can customize it
document.addEventListener('DOMContentLoaded', () => {
    // Add custom menu item
    const sidebar = document.querySelector('.sidebar-nav');
    const customItem = document.createElement('a');
    customItem.href = '/custom';
    customItem.className = 'nav-item';
    customItem.innerHTML = '<svg>...</svg> Custom Page';
    sidebar.appendChild(customItem);
});
```

### Header Actions
```html
<!-- Add custom action buttons -->
<header id="admin-header-root" 
        data-title="Dashboard"
        data-actions='[
            {
                "label": "Export",
                "icon": "<svg>...</svg>",
                "onclick": "exportData()"
            },
            {
                "label": "Settings",
                "icon": "<svg>...</svg>",
                "onclick": "openSettings()"
            }
        ]'>
</header>
```

## 🎯 Path Resolution
Both components use intelligent path resolution using the `[[BASE]]` token:
- Automatically resolves to the correct root path
- Works at any directory depth
- No need for hardcoded paths

## 📱 Mobile Responsive
- Sidebar collapses to hamburger menu on mobile
- Header adjusts layout for small screens
- Touch-friendly interactions
- Optimized for all device sizes

## 🎨 Theming
Components use CSS variables for easy theming:
```css
:root {
    --nav-bg: #1a1f2e;
    --nav-text: #ffffff;
    --nav-hover: #2a3f5f;
    --nav-active: #3b82f6;
    --header-bg: #ffffff;
    --header-border: #e5e7eb;
}
```

## 🔄 Auto-Updates
Components automatically:
- Highlight the current page in sidebar
- Update breadcrumbs based on location
- Resolve all paths correctly
- Handle deep nesting

## 📊 Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance
- Lazy loading of components
- Minimal CSS (< 10KB)
- Vanilla JavaScript (no dependencies)
- Single network request per component

## 📝 Best Practices
1. Load CSS in `<head>` for no FOUC
2. Load JS at end of `<body>` or use `defer`
3. Use data attributes for configuration
4. Keep custom styles in separate file
5. Test on mobile devices

---

*Part of the SirsiMaster Component Library*
