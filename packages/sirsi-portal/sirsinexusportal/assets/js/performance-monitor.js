/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals, page load times, and user interactions
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigation: {},
            resources: [],
            webVitals: {},
            userTimings: {},
            errors: []
        };
        
        this.config = {
            enableLogging: true,
            enableFirebaseAnalytics: false,
            sampleRate: 1.0, // 100% sampling
            maxResourceEntries: 100,
            reportingEndpoint: null
        };
        
        this.observers = {
            lcp: null,
            fid: null,
            cls: null,
            inp: null,
            ttfb: null
        };
        
        this.init();
    }
    
    init() {
        // Check for Performance API support
        if (!window.performance || !window.performance.timing) {
            console.warn('Performance API not supported');
            return;
        }
        
        // Initialize Core Web Vitals monitoring
        this.initWebVitals();
        
        // Monitor navigation timing
        this.captureNavigationTiming();
        
        // Monitor resource timing
        this.captureResourceTiming();
        
        // Set up error tracking
        this.setupErrorTracking();
        
        // Monitor page visibility changes
        this.monitorPageVisibility();
        
        // Set up custom performance marks
        this.setupCustomMarks();
        
        // Initialize Firebase Analytics if available
        this.initFirebaseAnalytics();
        
        console.log('Performance monitoring initialized');
    }
    
    /**
     * Initialize Core Web Vitals monitoring
     */
    initWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observers.lcp = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.webVitals.lcp = {
                value: lastEntry.renderTime || lastEntry.loadTime,
                element: lastEntry.element?.tagName,
                url: lastEntry.url,
                timestamp: Date.now()
            };
            this.reportMetric('LCP', this.metrics.webVitals.lcp.value);
        });
        
        try {
            this.observers.lcp.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            console.warn('LCP observer not supported');
        }
        
        // First Input Delay (FID)
        this.observers.fid = new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            this.metrics.webVitals.fid = {
                value: firstInput.processingStart - firstInput.startTime,
                eventType: firstInput.name,
                timestamp: Date.now()
            };
            this.reportMetric('FID', this.metrics.webVitals.fid.value);
        });
        
        try {
            this.observers.fid.observe({ type: 'first-input', buffered: true });
        } catch (e) {
            console.warn('FID observer not supported');
        }
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        let clsEntries = [];
        
        this.observers.cls = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push({
                        value: entry.value,
                        time: entry.startTime
                    });
                }
            }
            
            this.metrics.webVitals.cls = {
                value: clsValue,
                entries: clsEntries,
                timestamp: Date.now()
            };
        });
        
        try {
            this.observers.cls.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            console.warn('CLS observer not supported');
        }
        
        // Interaction to Next Paint (INP) - newer metric
        let inpValue = 0;
        this.observers.inp = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > inpValue) {
                    inpValue = entry.duration;
                    this.metrics.webVitals.inp = {
                        value: inpValue,
                        eventType: entry.name,
                        timestamp: Date.now()
                    };
                }
            }
        });
        
        try {
            this.observers.inp.observe({ type: 'event', buffered: true });
        } catch (e) {
            console.warn('INP observer not supported');
        }
        
        // Time to First Byte (TTFB)
        if (window.performance.timing) {
            const timing = window.performance.timing;
            this.metrics.webVitals.ttfb = {
                value: timing.responseStart - timing.requestStart,
                timestamp: Date.now()
            };
            this.reportMetric('TTFB', this.metrics.webVitals.ttfb.value);
        }
    }
    
    /**
     * Capture navigation timing metrics
     */
    captureNavigationTiming() {
        if (window.performance.timing) {
            const timing = window.performance.timing;
            const navigation = window.performance.navigation;
            
            // Wait for page load to complete
            window.addEventListener('load', () => {
                this.metrics.navigation = {
                    // Network timings
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp: timing.connectEnd - timing.connectStart,
                    ssl: timing.connectEnd - timing.secureConnectionStart,
                    ttfb: timing.responseStart - timing.requestStart,
                    download: timing.responseEnd - timing.responseStart,
                    
                    // Document processing
                    domInteractive: timing.domInteractive - timing.domLoading,
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                    domComplete: timing.domComplete - timing.domLoading,
                    
                    // Full page load
                    pageLoad: timing.loadEventEnd - timing.navigationStart,
                    
                    // Navigation type
                    type: navigation.type, // 0: navigate, 1: reload, 2: back/forward
                    redirectCount: navigation.redirectCount,
                    
                    // Custom metrics
                    firstPaint: this.getFirstPaint(),
                    firstContentfulPaint: this.getFirstContentfulPaint()
                };
                
                this.reportNavigationMetrics();
            });
        }
    }
    
    /**
     * Capture resource timing metrics
     */
    captureResourceTiming() {
        if (window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            
            this.metrics.resources = resources.slice(0, this.config.maxResourceEntries).map(resource => ({
                name: resource.name,
                type: this.getResourceType(resource.name),
                duration: resource.duration,
                size: resource.transferSize || 0,
                cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
                protocol: resource.nextHopProtocol,
                timing: {
                    dns: resource.domainLookupEnd - resource.domainLookupStart,
                    tcp: resource.connectEnd - resource.connectStart,
                    ssl: resource.secureConnectionStart > 0 ? resource.connectEnd - resource.secureConnectionStart : 0,
                    ttfb: resource.responseStart - resource.requestStart,
                    download: resource.responseEnd - resource.responseStart
                }
            }));
            
            // Group resources by type
            this.analyzeResourceMetrics();
        }
    }
    
    /**
     * Set up error tracking
     */
    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.metrics.errors.push({
                type: 'javascript',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
            
            this.reportError('javascript', event.message);
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors.push({
                type: 'promise',
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            });
            
            this.reportError('promise', event.reason);
        });
        
        // Track resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.metrics.errors.push({
                    type: 'resource',
                    tagName: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Resource failed to load',
                    timestamp: Date.now()
                });
                
                this.reportError('resource', `Failed to load: ${event.target.src || event.target.href}`);
            }
        }, true);
    }
    
    /**
     * Monitor page visibility changes
     */
    monitorPageVisibility() {
        let hiddenTime = 0;
        let visibleTime = Date.now();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                hiddenTime = Date.now();
                const activeTime = hiddenTime - visibleTime;
                
                this.track('page_background', {
                    activeTime: activeTime,
                    timestamp: hiddenTime
                });
            } else {
                visibleTime = Date.now();
                const inactiveTime = visibleTime - hiddenTime;
                
                this.track('page_foreground', {
                    inactiveTime: inactiveTime,
                    timestamp: visibleTime
                });
            }
        });
    }
    
    /**
     * Set up custom performance marks
     */
    setupCustomMarks() {
        // Mark important application milestones
        this.mark('app_init');
        
        // Measure time to interactive
        if (document.readyState === 'complete') {
            this.mark('app_interactive');
            this.measure('time_to_interactive', 'navigationStart', 'app_interactive');
        } else {
            window.addEventListener('load', () => {
                this.mark('app_interactive');
                this.measure('time_to_interactive', 'navigationStart', 'app_interactive');
            });
        }
    }
    
    /**
     * Initialize Firebase Analytics integration
     */
    initFirebaseAnalytics() {
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            try {
                const analytics = firebase.analytics();
                this.config.enableFirebaseAnalytics = true;
                console.log('Firebase Analytics integration enabled');
            } catch (e) {
                console.warn('Firebase Analytics not available');
            }
        }
    }
    
    /**
     * Get First Paint timing
     */
    getFirstPaint() {
        if (window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? firstPaint.startTime : 0;
        }
        return 0;
    }
    
    /**
     * Get First Contentful Paint timing
     */
    getFirstContentfulPaint() {
        if (window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcp ? fcp.startTime : 0;
        }
        return 0;
    }
    
    /**
     * Determine resource type from URL
     */
    getResourceType(url) {
        const extension = url.split('.').pop().split('?')[0].toLowerCase();
        const typeMap = {
            'js': 'script',
            'css': 'stylesheet',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'svg': 'image',
            'webp': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font',
            'otf': 'font',
            'json': 'fetch',
            'xml': 'fetch'
        };
        return typeMap[extension] || 'other';
    }
    
    /**
     * Analyze resource metrics
     */
    analyzeResourceMetrics() {
        const resourcesByType = {};
        let totalSize = 0;
        let totalDuration = 0;
        
        this.metrics.resources.forEach(resource => {
            if (!resourcesByType[resource.type]) {
                resourcesByType[resource.type] = {
                    count: 0,
                    totalSize: 0,
                    totalDuration: 0,
                    avgSize: 0,
                    avgDuration: 0
                };
            }
            
            const typeMetrics = resourcesByType[resource.type];
            typeMetrics.count++;
            typeMetrics.totalSize += resource.size;
            typeMetrics.totalDuration += resource.duration;
            
            totalSize += resource.size;
            totalDuration += resource.duration;
        });
        
        // Calculate averages
        Object.keys(resourcesByType).forEach(type => {
            const metrics = resourcesByType[type];
            metrics.avgSize = metrics.totalSize / metrics.count;
            metrics.avgDuration = metrics.totalDuration / metrics.count;
        });
        
        this.metrics.resourceSummary = {
            byType: resourcesByType,
            total: {
                count: this.metrics.resources.length,
                size: totalSize,
                duration: totalDuration
            }
        };
    }
    
    /**
     * Create a performance mark
     */
    mark(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
            this.log(`Performance mark: ${name}`);
        }
    }
    
    /**
     * Create a performance measure
     */
    measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            try {
                window.performance.measure(name, startMark, endMark);
                const measure = window.performance.getEntriesByName(name, 'measure')[0];
                
                if (measure) {
                    this.metrics.userTimings[name] = measure.duration;
                    this.log(`Performance measure: ${name} = ${measure.duration.toFixed(2)}ms`);
                    this.reportMetric(name, measure.duration);
                }
            } catch (e) {
                console.error(`Failed to measure ${name}:`, e);
            }
        }
    }
    
    /**
     * Track custom events
     */
    track(eventName, data = {}) {
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now()
        };
        
        // Log to console
        this.log(`Event: ${eventName}`, data);
        
        // Send to Firebase Analytics if enabled
        if (this.config.enableFirebaseAnalytics && firebase.analytics) {
            firebase.analytics().logEvent(eventName, data);
        }
        
        // Send to custom endpoint if configured
        if (this.config.reportingEndpoint) {
            this.sendToEndpoint('event', event);
        }
    }
    
    /**
     * Report a metric
     */
    reportMetric(name, value) {
        this.log(`Metric: ${name} = ${value}`);
        
        if (this.config.enableFirebaseAnalytics && firebase.analytics) {
            firebase.analytics().logEvent('performance_metric', {
                metric_name: name,
                value: value
            });
        }
    }
    
    /**
     * Report navigation metrics
     */
    reportNavigationMetrics() {
        const metrics = this.metrics.navigation;
        
        this.log('Navigation Metrics:', metrics);
        
        // Report key metrics
        this.reportMetric('page_load_time', metrics.pageLoad);
        this.reportMetric('dom_content_loaded', metrics.domContentLoaded);
        this.reportMetric('time_to_first_byte', metrics.ttfb);
        
        // Check for performance issues
        if (metrics.pageLoad > 3000) {
            console.warn(`Slow page load detected: ${metrics.pageLoad}ms`);
        }
        
        if (metrics.ttfb > 600) {
            console.warn(`Slow TTFB detected: ${metrics.ttfb}ms`);
        }
    }
    
    /**
     * Report an error
     */
    reportError(type, message) {
        console.error(`[Performance Monitor] Error (${type}):`, message);
        
        if (this.config.enableFirebaseAnalytics && firebase.analytics) {
            firebase.analytics().logEvent('performance_error', {
                error_type: type,
                error_message: message
            });
        }
    }
    
    /**
     * Send data to custom endpoint
     */
    async sendToEndpoint(type, data) {
        if (!this.config.reportingEndpoint) return;
        
        try {
            await fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    data: data,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
        } catch (e) {
            console.error('Failed to send performance data:', e);
        }
    }
    
    /**
     * Get current performance summary
     */
    getSummary() {
        return {
            webVitals: this.metrics.webVitals,
            navigation: this.metrics.navigation,
            resources: this.metrics.resourceSummary,
            errors: this.metrics.errors.length,
            userTimings: this.metrics.userTimings
        };
    }
    
    /**
     * Get performance score (0-100)
     */
    getScore() {
        let score = 100;
        const vitals = this.metrics.webVitals;
        
        // LCP scoring (good < 2.5s, needs improvement < 4s, poor > 4s)
        if (vitals.lcp) {
            if (vitals.lcp.value > 4000) score -= 25;
            else if (vitals.lcp.value > 2500) score -= 10;
        }
        
        // FID scoring (good < 100ms, needs improvement < 300ms, poor > 300ms)
        if (vitals.fid) {
            if (vitals.fid.value > 300) score -= 25;
            else if (vitals.fid.value > 100) score -= 10;
        }
        
        // CLS scoring (good < 0.1, needs improvement < 0.25, poor > 0.25)
        if (vitals.cls) {
            if (vitals.cls.value > 0.25) score -= 25;
            else if (vitals.cls.value > 0.1) score -= 10;
        }
        
        // TTFB scoring (good < 800ms, poor > 1800ms)
        if (vitals.ttfb) {
            if (vitals.ttfb.value > 1800) score -= 15;
            else if (vitals.ttfb.value > 800) score -= 5;
        }
        
        // Error penalty
        score -= Math.min(this.metrics.errors.length * 5, 20);
        
        return Math.max(0, score);
    }
    
    /**
     * Log message
     */
    log(message, data = null) {
        if (this.config.enableLogging) {
            if (data) {
                console.log(`[Performance Monitor] ${message}`, data);
            } else {
                console.log(`[Performance Monitor] ${message}`);
            }
        }
    }
    
    /**
     * Clean up observers
     */
    destroy() {
        Object.values(this.observers).forEach(observer => {
            if (observer) observer.disconnect();
        });
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceMonitor = new PerformanceMonitor();
    });
} else {
    window.performanceMonitor = new PerformanceMonitor();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
