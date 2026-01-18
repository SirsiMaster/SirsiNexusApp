/**
 * Cleanup utility for SirsiNexus UI components
 * Handles cleanup of dangling references and ensures proper component disposal
 */

class UICleanup {
    constructor() {
        this.observers = new Set();
        this.eventListeners = new WeakMap();
        this.init();
    }

    init() {
        // Monitor page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.cleanup();
            }
        });

        // Monitor navigation events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    registerObserver(observer) {
        this.observers.add(observer);
    }

    registerEventListener(element, type, listener) {
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, new Map());
        }
        const elementListeners = this.eventListeners.get(element);
        if (!elementListeners.has(type)) {
            elementListeners.set(type, new Set());
        }
        elementListeners.get(type).add(listener);
    }

    cleanup() {
        // Disconnect all MutationObservers
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (error) {
                console.error('Error disconnecting observer:', error);
            }
        });
        this.observers.clear();

        // Remove event listeners
        this.eventListeners.forEach((typeListeners, element) => {
            typeListeners.forEach((listeners, type) => {
                listeners.forEach(listener => {
                    try {
                        element.removeEventListener(type, listener);
                    } catch (error) {
                        console.error('Error removing event listener:', error);
                    }
                });
            });
        });
        this.eventListeners = new WeakMap();

        // Clean up any Chart.js instances
        const charts = document.querySelectorAll('canvas');
        charts.forEach(canvas => {
            if (canvas.chart) {
                try {
                    canvas.chart.destroy();
                } catch (error) {
                    console.error('Error destroying chart:', error);
                }
            }
        });

        // Remove any remaining custom elements
        const customElements = document.querySelectorAll('sirsi-header, sirsi-footer, sirsi-metric, sirsi-feature, sirsi-chart');
        customElements.forEach(element => {
            try {
                element.remove();
            } catch (error) {
                console.error('Error removing custom element:', error);
            }
        });

        // Clear any theme-related local storage
        try {
            localStorage.removeItem('theme');
        } catch (error) {
            console.error('Error clearing theme from localStorage:', error);
        }
    }
}

// Initialize cleanup utility
window.SirsiCleanup = new UICleanup();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UICleanup;
}
