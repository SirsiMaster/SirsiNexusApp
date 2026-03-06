/**
 * Firebase Performance Monitoring & Analytics Module
 * Complete monitoring, analytics, and error reporting for SirsiNexus
 */

class FirebaseMonitoring {
    constructor() {
        this.performance = null;
        this.analytics = null;
        this.initialized = false;
        this.customTraces = {};
    }

    /**
     * Initialize Firebase Performance Monitoring and Analytics
     */
    async init() {
        if (this.initialized) return;

        try {
            // Initialize Firebase Performance Monitoring
            if (typeof firebase !== 'undefined' && firebase.performance) {
                this.performance = firebase.performance();
                
                // Configure performance monitoring
                this.configurePerformanceMonitoring();
                
                console.log('Firebase Performance Monitoring initialized');
            }

            // Initialize Firebase Analytics
            if (typeof firebase !== 'undefined' && firebase.analytics) {
                this.analytics = firebase.analytics();
                
                // Set default analytics properties
                this.setDefaultAnalyticsProperties();
                
                console.log('Firebase Analytics initialized');
            }

            // Set up error tracking
            this.setupErrorTracking();
            
            // Track page performance
            this.trackPagePerformance();
            
            // Monitor network requests
            this.monitorNetworkRequests();

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing monitoring:', error);
        }
    }

    /**
     * Configure Performance Monitoring settings
     */
    configurePerformanceMonitoring() {
        if (!this.performance) return;

        // Set data collection to true
        this.performance.dataCollectionEnabled = true;

        // Set instrumentation to true
        this.performance.instrumentationEnabled = true;
    }

    /**
     * Set default analytics properties
     */
    setDefaultAnalyticsProperties() {
        if (!this.analytics) return;

        // Set user properties
        this.analytics.setUserProperties({
            platform: 'web',
            app_version: window.SirsiVersion?.version || '1.0.0',
            environment: window.location.hostname.includes('localhost') ? 'development' : 'production'
        });

        // Log default events
        this.analytics.logEvent('app_open', {
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track page performance metrics
     */
    trackPagePerformance() {
        // Use Navigation Timing API
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const metrics = {
                        // Page load metrics
                        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                        loadComplete: timing.loadEventEnd - timing.loadEventStart,
                        domInteractive: timing.domInteractive - timing.navigationStart,
                        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                        
                        // Network metrics
                        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                        tcpConnect: timing.connectEnd - timing.connectStart,
                        serverResponse: timing.responseEnd - timing.requestStart,
                        
                        // Resource metrics
                        fetchTime: timing.responseEnd - timing.fetchStart,
                        redirectTime: timing.redirectEnd - timing.redirectStart,
                        
                        // User experience metrics
                        firstPaint: this.getFirstPaintTime(),
                        firstContentfulPaint: this.getFirstContentfulPaintTime()
                    };

                    // Log to analytics
                    this.logPerformanceMetrics(metrics);
                    
                    // Send custom metrics to Performance Monitoring
                    if (this.performance) {
                        Object.keys(metrics).forEach(key => {
                            if (metrics[key] > 0) {
                                this.performance.trace(key).record(
                                    metrics[key],
                                    {
                                        page: window.location.pathname,
                                        timestamp: new Date().toISOString()
                                    }
                                );
                            }
                        });
                    }
                }, 0);
            });
        }

        // Track Core Web Vitals
        this.trackCoreWebVitals();
    }

    /**
     * Track Core Web Vitals
     */
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.logMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.warn('LCP observer not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.logMetric('FID', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ type: 'first-input', buffered: true });
            } catch (e) {
                console.warn('FID observer not supported');
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.logMetric('CLS', clsValue);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                console.warn('CLS observer not supported');
            }
        }
    }

    /**
     * Monitor network requests
     */
    monitorNetworkRequests() {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - startTime;
                
                this.trackNetworkRequest({
                    url: typeof url === 'string' ? url : url.url,
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    duration,
                    success: response.ok
                });
                
                return response;
            } catch (error) {
                const duration = performance.now() - startTime;
                
                this.trackNetworkRequest({
                    url: typeof url === 'string' ? url : url.url,
                    method: args[1]?.method || 'GET',
                    status: 0,
                    duration,
                    success: false,
                    error: error.message
                });
                
                throw error;
            }
        };

        // Intercept XMLHttpRequest
        const originalXHR = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
            const xhr = this;
            const startTime = performance.now();
            
            xhr.addEventListener('loadend', () => {
                const duration = performance.now() - startTime;
                
                window.SirsiMonitoring?.trackNetworkRequest({
                    url,
                    method,
                    status: xhr.status,
                    duration,
                    success: xhr.status >= 200 && xhr.status < 300
                });
            });
            
            return originalXHR.call(this, method, url, ...args);
        };
    }

    /**
     * Track network request performance
     */
    trackNetworkRequest(data) {
        if (this.analytics) {
            this.analytics.logEvent('network_request', {
                url: data.url,
                method: data.method,
                status: data.status,
                duration: Math.round(data.duration),
                success: data.success
            });
        }

        // Track slow requests
        if (data.duration > 3000) {
            this.logSlowRequest(data);
        }

        // Track failed requests
        if (!data.success) {
            this.logFailedRequest(data);
        }
    }

    /**
     * Set up global error tracking
     */
    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                type: 'javascript_error'
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                type: 'unhandled_promise_rejection'
            });
        });

        // Track console errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError({
                message: args.join(' '),
                type: 'console_error',
                severity: 'error'
            });
            originalConsoleError.apply(console, args);
        };
    }

    /**
     * Start a custom trace
     */
    startTrace(name, attributes = {}) {
        if (!this.performance) return null;

        try {
            const trace = this.performance.trace(name);
            
            // Add custom attributes
            Object.keys(attributes).forEach(key => {
                trace.putAttribute(key, String(attributes[key]));
            });
            
            trace.start();
            this.customTraces[name] = trace;
            
            return trace;
        } catch (error) {
            console.error('Error starting trace:', error);
            return null;
        }
    }

    /**
     * Stop a custom trace
     */
    stopTrace(name, metrics = {}) {
        const trace = this.customTraces[name];
        if (!trace) return;

        try {
            // Add custom metrics
            Object.keys(metrics).forEach(key => {
                trace.putMetric(key, metrics[key]);
            });
            
            trace.stop();
            delete this.customTraces[name];
        } catch (error) {
            console.error('Error stopping trace:', error);
        }
    }

    /**
     * Log custom event
     */
    logEvent(eventName, parameters = {}) {
        if (this.analytics) {
            this.analytics.logEvent(eventName, {
                ...parameters,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
        }
    }

    /**
     * Log user action
     */
    logUserAction(action, category, label = null, value = null) {
        this.logEvent('user_action', {
            action,
            category,
            label,
            value
        });
    }

    /**
     * Log conversion event
     */
    logConversion(type, value = null, currency = 'USD') {
        if (this.analytics) {
            this.analytics.logEvent('conversion', {
                conversion_type: type,
                value: value,
                currency: currency
            });
        }
    }

    /**
     * Log page view
     */
    logPageView(pageName = null) {
        if (this.analytics) {
            this.analytics.logEvent('page_view', {
                page_title: pageName || document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics(metrics) {
        if (this.analytics) {
            this.analytics.logEvent('performance_metrics', metrics);
        }

        // Log slow page loads
        if (metrics.pageLoadTime > 5000) {
            this.logSlowPageLoad(metrics);
        }
    }

    /**
     * Log custom metric
     */
    logMetric(name, value) {
        if (this.analytics) {
            this.analytics.logEvent('custom_metric', {
                metric_name: name,
                metric_value: value
            });
        }
    }

    /**
     * Log error to analytics and reporting
     */
    logError(error) {
        if (this.analytics) {
            this.analytics.logEvent('error', {
                error_message: error.message,
                error_type: error.type,
                error_source: error.source,
                error_line: error.line,
                error_column: error.column,
                page: window.location.pathname
            });
        }

        // Also log to Firestore for persistent error tracking
        if (window.firebase?.firestore) {
            try {
                firebase.firestore().collection('error_logs').add({
                    ...error,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    userId: firebase.auth()?.currentUser?.uid || 'anonymous'
                });
            } catch (e) {
                console.error('Failed to log error to Firestore:', e);
            }
        }
    }

    /**
     * Log slow page load
     */
    logSlowPageLoad(metrics) {
        this.logEvent('slow_page_load', {
            page_load_time: metrics.pageLoadTime,
            dom_interactive: metrics.domInteractive,
            server_response: metrics.serverResponse
        });
    }

    /**
     * Log slow request
     */
    logSlowRequest(data) {
        this.logEvent('slow_request', {
            url: data.url,
            method: data.method,
            duration: Math.round(data.duration),
            status: data.status
        });
    }

    /**
     * Log failed request
     */
    logFailedRequest(data) {
        this.logEvent('failed_request', {
            url: data.url,
            method: data.method,
            status: data.status,
            error: data.error
        });
    }

    /**
     * Get first paint time
     */
    getFirstPaintTime() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? Math.round(firstPaint.startTime) : 0;
        }
        return 0;
    }

    /**
     * Get first contentful paint time
     */
    getFirstContentfulPaintTime() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcp ? Math.round(fcp.startTime) : 0;
        }
        return 0;
    }

    /**
     * Set user ID for analytics
     */
    setUserId(userId) {
        if (this.analytics) {
            this.analytics.setUserId(userId);
        }
    }

    /**
     * Set user properties
     */
    setUserProperties(properties) {
        if (this.analytics) {
            this.analytics.setUserProperties(properties);
        }
    }

    /**
     * Track screen/page view with custom dimensions
     */
    trackScreenView(screenName, screenClass = 'WebPage') {
        if (this.analytics) {
            this.analytics.logEvent('screen_view', {
                screen_name: screenName,
                screen_class: screenClass
            });
        }
    }

    /**
     * Track e-commerce events
     */
    trackPurchase(transactionId, value, currency = 'USD', items = []) {
        if (this.analytics) {
            this.analytics.logEvent('purchase', {
                transaction_id: transactionId,
                value: value,
                currency: currency,
                items: items
            });
        }
    }

    /**
     * Track search events
     */
    trackSearch(searchTerm, results = 0) {
        if (this.analytics) {
            this.analytics.logEvent('search', {
                search_term: searchTerm,
                number_of_results: results
            });
        }
    }

    /**
     * Track share events
     */
    trackShare(contentType, itemId, method) {
        if (this.analytics) {
            this.analytics.logEvent('share', {
                content_type: contentType,
                item_id: itemId,
                method: method
            });
        }
    }
}

// Create and export singleton instance
const monitoring = new FirebaseMonitoring();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => monitoring.init());
} else {
    monitoring.init();
}

// Export for use in other modules
window.SirsiMonitoring = monitoring;
