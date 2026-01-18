# SirsiNexus UI Components

A comprehensive UI component library built with Web Components for the SirsiNexus investor portal.

## Features

- 🎨 Themeable components with dark mode support
- 📱 Fully responsive design
- 🧹 Automatic resource cleanup
- 📊 Interactive charts with theme synchronization
- 🔄 System theme detection and synchronization
- 🎯 Zero-dependency core components
- 🛡️ Shadow DOM encapsulation

## Installation

Include the required scripts in your HTML:

```html
<link rel="stylesheet" href="/components/global-styles.css">
<script src="/components/cleanup.js"></script>
<script src="/components/ui-library.js"></script>
<script src="/components/chart.js"></script>
<script src="/components/initialize.js"></script>
```

## Components

### Header Component

```html
<sirsi-header 
    logo-path="/assets/images/logo-light.png"
    dark-logo-path="/assets/images/logo-dark.png">
    <div slot="nav-items">
        <!-- Navigation items here -->
    </div>
</sirsi-header>
```

### Metric Component

```html
<sirsi-metric
    value="2,500"
    label="Active Users">
</sirsi-metric>
```

### Chart Component

```html
<sirsi-chart
    type="line"
    data='{"labels":["Jan","Feb","Mar"],"datasets":[{"data":[10,20,30]}]}'
    options='{"plugins":{"legend":{"display":false}}}'>
</sirsi-chart>
```

Supported chart types:
- line
- bar
- pie
- doughnut
- radar
- polarArea

### Feature Component

```html
<sirsi-feature
    title="Analytics"
    description="Real-time investment tracking"
    icon="📊">
</sirsi-feature>
```

### Footer Component

```html
<sirsi-footer>
    <div slot="footer-content">
        © 2025 SirsiNexus
    </div>
</sirsi-footer>
```

## Theming

Components automatically sync with system dark mode preferences but can be manually controlled:

```javascript
// Set theme manually
document.documentElement.setAttribute('data-theme', 'dark');

// Store theme preference
localStorage.setItem('sirsi-theme-preference', 'dark');
```

CSS variables can be overridden for custom theming:

```css
:root {
    --sirsi-text-color: #374151;
    --sirsi-heading-color: #111827;
    --sirsi-border-color: #e5e7eb;
    /* ... other variables ... */
}

/* Dark theme overrides */
:root[data-theme="dark"] {
    --sirsi-text-color: #94a3b8;
    --sirsi-heading-color: #f1f5f9;
    --sirsi-border-color: #334155;
    /* ... other variables ... */
}
```

## Resource Cleanup

The library automatically handles cleanup of:
- MutationObservers
- Event listeners
- Chart.js instances
- Custom elements
- Theme-related storage

Manual cleanup can be triggered:

```javascript
// Cleanup specific element and its children
SirsiCleanup.cleanupElement(element);

// Cleanup everything
SirsiCleanup.cleanupAll();
```

## Event Handling

Register event listeners for proper cleanup:

```javascript
SirsiCleanup.registerEventListener(element, 'click', handler);
```

For charts:

```javascript
SirsiCleanup.registerChart(chartInstance);
```

For observers:

```javascript
SirsiCleanup.registerObserver(observer);
```

## Browser Support

- Chrome 67+
- Firefox 63+
- Safari 12.1+
- Edge 79+

## Development

### Building

The components are written in vanilla JavaScript and don't require a build step. However, for production:

1. Minify the JavaScript files
2. Optimize the CSS
3. Generate source maps

### Testing

Test in different themes:
1. Light theme
2. Dark theme
3. System theme synchronization
4. Manual theme switching

Test responsiveness:
1. Desktop (1200px+)
2. Tablet (768px - 1199px)
3. Mobile (< 768px)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE.md for details
