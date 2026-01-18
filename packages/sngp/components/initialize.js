// SirsiNexus Component Initialization

class SirsiInitializer {
    constructor() {
        this.componentRegistry = new Map();
        this.themeObserver = null;
        this.setupThemeHandling();
    }

    // Initialize all Sirsi components
    initializeComponents() {
        // Load required styles
        this.loadStyles();

        // Initialize header component
        this.initializeHeader();

        // Initialize charts
        this.initializeCharts();

        // Setup theme synchronization
        this.setupThemeSyncing();

        console.log('SirsiNexus components initialized successfully');
    }

    // Load required styles
    loadStyles() {
        if (!document.querySelector('link[href*="global-styles.css"]')) {
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = '/components/global-styles.css';
            document.head.appendChild(styleLink);
        }
    }

    // Initialize header component
    initializeHeader() {
        const headers = document.querySelectorAll('sirsi-header');
        headers.forEach(header => {
            // Set default logo paths if not provided
            if (!header.hasAttribute('logo-path')) {
                header.setAttribute('logo-path', '/assets/images/logo-light.png');
            }
            if (!header.hasAttribute('dark-logo-path')) {
                header.setAttribute('dark-logo-path', '/assets/images/logo-dark.png');
            }

            // Register for cleanup
            if (typeof header.cleanup === 'function') {
                SirsiCleanup.registerEventListener(header, 'disconnected', () => header.cleanup());
            }
        });
    }

    // Initialize charts with theme support
    initializeCharts() {
        const charts = document.querySelectorAll('sirsi-chart');
        charts.forEach(chart => {
            if (chart.chart) {
                SirsiCleanup.registerChart(chart.chart);
            }
            
            // Setup theme change handler
            const updateTheme = () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (chart.chart) {
                    chart.chart.options.theme = isDark ? 'dark' : 'light';
                    chart.chart.update();
                }
            };
            
            SirsiCleanup.registerEventListener(document.documentElement, 'themechange', updateTheme);
        });
    }

    // Setup theme handling
    setupThemeHandling() {
        // Get stored theme preference
        const storedTheme = localStorage.getItem('sirsi-theme-preference');
        if (storedTheme) {
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        // Watch for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e) => {
            if (!localStorage.getItem('sirsi-theme-preference')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                // Dispatch theme change event
                document.documentElement.dispatchEvent(new CustomEvent('themechange'));
            }
        };

        mediaQuery.addListener(handleThemeChange);
        SirsiCleanup.registerEventListener(mediaQuery, 'change', handleThemeChange);
    }

    // Setup theme synchronization
    setupThemeSyncing() {
        // Watch for theme attribute changes
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'data-theme') {
                    document.documentElement.dispatchEvent(new CustomEvent('themechange'));
                }
            });
        });

        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        SirsiCleanup.registerObserver(this.themeObserver);
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const initializer = new SirsiInitializer();
    initializer.initializeComponents();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SirsiInitializer;
}
