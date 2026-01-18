// SirsiNexus Configuration

const SIRSI_CONFIG = {
    // Base path for GitHub Pages
    basePath: '/SirsiNexusPortal',
    
    // Asset paths
    paths: {
        components: '/components',
        assets: '/assets',
        styles: '/assets/css',
        images: '/assets/images',
        js: '/assets/js'
    },
    
    // Theme configuration
    theme: {
        light: {
            primary: '#22c55e',
            secondary: '#64748b',
            background: '#ffffff',
            text: '#374151'
        },
        dark: {
            primary: '#4ade80',
            secondary: '#94a3b8',
            background: '#1e293b',
            text: '#f1f5f9'
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SIRSI_CONFIG;
}
