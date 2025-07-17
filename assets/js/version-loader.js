/**
 * Dynamic Version Loader for SirsiNexus
 * Loads version information from central version.json file
 */

class VersionLoader {
    constructor() {
        this.versionData = null;
        this.cache = null;
        this.cacheExpiry = null;
        this.baseUrl = this.getBaseUrl();
    }

    /**
     * Get the base URL for loading version file
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/investor-portal/')) {
            return '../version.json';
        } else if (path.includes('/committee/')) {
            return '../../version.json';
        } else {
            return './version.json';
        }
    }

    /**
     * Load version data from server
     */
    async loadVersion() {
        try {
            // Check cache first
            if (this.cache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.cache;
            }

            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.cache = data;
            this.cacheExpiry = Date.now() + (data.metadata?.cache_duration || 300) * 1000;
            
            return data;
        } catch (error) {
            console.warn('Failed to load version data:', error);
            // Fallback to default version
            return {
                version: '0.7.9-alpha',
                status: 'Live',
                build: 'unknown',
                environment: 'production'
            };
        }
    }

    /**
     * Update version display in the UI
     */
    async updateVersionDisplay() {
        const versionData = await this.loadVersion();
        
        // Update version badge
        const versionElement = document.querySelector('.version-badge');
        if (versionElement) {
            versionElement.textContent = `v${versionData.version}`;
        }

        // Update status indicator
        const statusElement = document.querySelector('.status-indicator');
        if (statusElement) {
            statusElement.textContent = versionData.status;
            
            // Update status color based on environment
            const statusDot = statusElement.previousElementSibling;
            if (statusDot && statusDot.classList.contains('w-1.5')) {
                statusDot.className = `w-1.5 h-1.5 rounded-full ${this.getStatusColor(versionData.environment)}`;
            }
        }

        // Update any other version displays
        const allVersionElements = document.querySelectorAll('[data-version]');
        allVersionElements.forEach(element => {
            const dataType = element.getAttribute('data-version');
            if (dataType && versionData[dataType]) {
                element.textContent = versionData[dataType];
            }
        });

        // Store version data globally for other scripts
        window.SirsiNexusVersion = versionData;
        
        // Dispatch custom event for version loaded
        window.dispatchEvent(new CustomEvent('versionLoaded', {
            detail: versionData
        }));
    }

    /**
     * Get status color based on environment
     */
    getStatusColor(environment) {
        switch (environment) {
            case 'production':
                return 'bg-emerald-500';
            case 'staging':
                return 'bg-amber-500';
            case 'development':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    }

    /**
     * Initialize version loader
     */
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateVersionDisplay());
        } else {
            await this.updateVersionDisplay();
        }
    }
}

// Global instance
const versionLoader = new VersionLoader();

// Auto-initialize when script loads
versionLoader.init();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionLoader;
}
