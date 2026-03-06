/**
 * SirsiNexus Performance Optimizer
 * Comprehensive performance optimization with lazy loading, caching, and monitoring
 * @version 1.0.0
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.metrics = {
            loadTime: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
        };
        
        this.resourceHints = [];
        this.deferredTasks = [];
        this.criticalResources = new Set(['css', 'js']);
        
        this.init();
    }

    /**
     * Initialize performance optimizations
     */
    init() {
        this.measureInitialMetrics();
        this.setupLazyLoading();
        this.optimizeImages();
        this.setupResourceHints();
        this.deferNonCriticalTasks();
        this.setupCaching();
        this.monitorPerformance();
        this.optimizeAnimations();
        
        console.log('✓ Performance optimizations initialized');
    }

    /**
     * Measure initial performance metrics
     */
    measureInitialMetrics() {
        // Navigation timing
        if (performance.timing) {
            this.metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.metrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        }

        // Paint timing
        if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }

        // Core Web Vitals
        this.measureWebVitals();
    }

    /**
     * Measure Core Web Vitals
     */
    measureWebVitals() {
        // LCP (Largest Contentful Paint)
        if (window.PerformanceObserver) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.warn('LCP measurement not supported');
            }

            // FID (First Input Delay)
            try {
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                    });
                });
                fidObserver.observe({ type: 'first-input', buffered: true });
            } catch (e) {
                console.warn('FID measurement not supported');
            }

            // CLS (Cumulative Layout Shift)
            try {
                const clsObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            this.metrics.cumulativeLayoutShift += entry.value;
                        }
                    });
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                console.warn('CLS measurement not supported');
            }
        }
    }

    /**
     * Setup lazy loading for images and content
     */
    setupLazyLoading() {
        // Native lazy loading support
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // Intersection Observer for custom lazy loading
        if (window.IntersectionObserver) {
            const lazyElements = document.querySelectorAll('[data-lazy]');
            
            if (lazyElements.length > 0) {
                const lazyObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadLazyElement(entry.target);
                            lazyObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });

                lazyElements.forEach(el => lazyObserver.observe(el));
                this.observers.set('lazy', lazyObserver);
            }
        }

        // Lazy load charts
        this.setupLazyCharts();
    }

    /**
     * Load lazy element
     */
    loadLazyElement(element) {
        const src = element.dataset.src;
        const lazySrc = element.dataset.lazy;

        if (src && element.tagName === 'IMG') {
            element.src = src;
            element.removeAttribute('data-src');
        }

        if (lazySrc) {
            if (element.tagName === 'SCRIPT') {
                this.loadScript(lazySrc, element);
            } else if (element.tagName === 'LINK') {
                element.href = lazySrc;
            }
            element.removeAttribute('data-lazy');
        }

        // Trigger custom event
        element.dispatchEvent(new CustomEvent('lazy-loaded', {
            bubbles: true,
            detail: { element }
        }));
    }

    /**
     * Setup lazy loading for charts
     */
    setupLazyCharts() {
        const chartContainers = document.querySelectorAll('.chart-container canvas');
        
        if (chartContainers.length > 0 && window.IntersectionObserver) {
            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.initializeChart(entry.target);
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });

            chartContainers.forEach(canvas => {
                if (!canvas.hasAttribute('data-chart-initialized')) {
                    chartObserver.observe(canvas);
                }
            });
        }
    }

    /**
     * Initialize chart when visible
     */
    initializeChart(canvas) {
        canvas.setAttribute('data-chart-initialized', 'true');
        
        // Trigger chart initialization based on canvas ID
        const chartId = canvas.id;
        const chartEvent = new CustomEvent('init-chart', {
            bubbles: true,
            detail: { canvas, chartId }
        });
        
        document.dispatchEvent(chartEvent);
    }

    /**
     * Optimize images
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add decoding hint
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }

            // Optimize loading priority
            if (this.isAboveFold(img)) {
                img.setAttribute('fetchpriority', 'high');
            }

            // Add srcset for responsive images
            this.addResponsiveSrcset(img);
        });

        // Preload critical images
        this.preloadCriticalImages();
    }

    /**
     * Check if element is above the fold
     */
    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < viewportHeight && rect.bottom >= 0;
    }

    /**
     * Add responsive srcset
     */
    addResponsiveSrcset(img) {
        const src = img.src || img.dataset.src;
        if (!src || img.hasAttribute('srcset')) return;

        // Generate responsive sizes (this would typically be done server-side)
        const baseName = src.substring(0, src.lastIndexOf('.'));
        const extension = src.substring(src.lastIndexOf('.'));
        
        // Mock responsive images - replace with actual image service
        const srcset = [
            `${baseName}_400w${extension} 400w`,
            `${baseName}_800w${extension} 800w`,
            `${baseName}_1200w${extension} 1200w`
        ].join(', ');
        
        const sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px';
        
        // Only add if responsive variants exist
        if (this.checkImageExists(`${baseName}_400w${extension}`)) {
            img.setAttribute('srcset', srcset);
            img.setAttribute('sizes', sizes);
        }
    }

    /**
     * Check if image exists (mock implementation)
     */
    checkImageExists(src) {
        // In a real implementation, this would check if responsive images exist
        return false;
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical="true"], .hero img, .above-fold img');
        
        criticalImages.forEach(img => {
            const src = img.src || img.dataset.src;
            if (src) {
                this.preloadResource(src, 'image');
            }
        });
    }

    /**
     * Setup resource hints
     */
    setupResourceHints() {
        // DNS prefetch for external domains
        const externalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdn.jsdelivr.net',
            'cdnjs.cloudflare.com'
        ];

        externalDomains.forEach(domain => {
            this.addResourceHint('dns-prefetch', `//${domain}`);
        });

        // Preconnect to critical third-party domains
        this.addResourceHint('preconnect', '//fonts.googleapis.com');
        this.addResourceHint('preconnect', '//fonts.gstatic.com', true);

        // Preload critical resources
        this.preloadCriticalResources();
    }

    /**
     * Add resource hint
     */
    addResourceHint(rel, href, crossorigin = false) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
        this.resourceHints.push({ rel, href, crossorigin });
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-critical="true"]');
        const criticalJS = document.querySelectorAll('script[data-critical="true"]');

        criticalCSS.forEach(link => {
            this.preloadResource(link.href, 'style');
        });

        criticalJS.forEach(script => {
            if (script.src) {
                this.preloadResource(script.src, 'script');
            }
        });
    }

    /**
     * Preload resource
     */
    preloadResource(href, as, crossorigin = false) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
    }

    /**
     * Defer non-critical tasks
     */
    deferNonCriticalTasks() {
        // Defer analytics and tracking
        this.deferTask(() => {
            this.initializeAnalytics();
        }, 2000);

        // Defer non-critical third-party scripts
        this.deferTask(() => {
            this.loadNonCriticalScripts();
        }, 1000);

        // Defer social media widgets
        this.deferTask(() => {
            this.initializeSocialWidgets();
        }, 3000);
    }

    /**
     * Defer task execution
     */
    deferTask(callback, delay = 0) {
        const task = {
            callback,
            delay,
            scheduled: false
        };

        this.deferredTasks.push(task);

        if (document.readyState === 'complete') {
            this.executeDeferredTask(task);
        } else {
            window.addEventListener('load', () => {
                this.executeDeferredTask(task);
            });
        }
    }

    /**
     * Execute deferred task
     */
    executeDeferredTask(task) {
        if (task.scheduled) return;
        
        task.scheduled = true;
        
        if (task.delay > 0) {
            setTimeout(() => {
                requestIdleCallback ? 
                    requestIdleCallback(task.callback) : 
                    task.callback();
            }, task.delay);
        } else {
            requestIdleCallback ? 
                requestIdleCallback(task.callback) : 
                setTimeout(task.callback, 0);
        }
    }

    /**
     * Initialize analytics (placeholder)
     */
    initializeAnalytics() {
        console.log('Analytics initialized (deferred)');
        // Initialize Google Analytics, Adobe Analytics, etc.
    }

    /**
     * Load non-critical scripts
     */
    loadNonCriticalScripts() {
        const nonCriticalScripts = document.querySelectorAll('script[data-defer="true"]');
        
        nonCriticalScripts.forEach(script => {
            if (script.dataset.src) {
                this.loadScript(script.dataset.src, script);
            }
        });
    }

    /**
     * Load script asynchronously
     */
    loadScript(src, originalScript = null) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            if (originalScript) {
                // Copy attributes
                Array.from(originalScript.attributes).forEach(attr => {
                    if (attr.name !== 'data-src' && attr.name !== 'data-defer') {
                        script.setAttribute(attr.name, attr.value);
                    }
                });
            }
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize social media widgets
     */
    initializeSocialWidgets() {
        console.log('Social widgets initialized (deferred)');
        // Initialize Twitter, Facebook, LinkedIn widgets, etc.
    }

    /**
     * Setup caching
     */
    setupCaching() {
        // Service Worker registration (if available)
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // Cache API responses
        this.setupAPICache();

        // Cache static assets
        this.setupAssetCache();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <p>A new version is available. Refresh to update.</p>
                <button onclick="window.location.reload()" class="btn-update">Refresh</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-dismiss">Dismiss</button>
            </div>
        `;
        
        document.body.appendChild(notification);
    }

    /**
     * Setup API cache
     */
    setupAPICache() {
        // Override fetch for API caching
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            const method = options.method || 'GET';
            const cacheKey = `${method}:${url}`;
            
            // Check cache for GET requests
            if (method === 'GET' && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                    return Promise.resolve(new Response(cached.data));
                }
            }
            
            try {
                const response = await originalFetch(url, options);
                
                // Cache successful GET responses
                if (method === 'GET' && response.ok) {
                    const clonedResponse = response.clone();
                    const data = await clonedResponse.text();
                    
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                }
                
                return response;
            } catch (error) {
                // Return cached version if available
                if (method === 'GET' && this.cache.has(cacheKey)) {
                    const cached = this.cache.get(cacheKey);
                    return Promise.resolve(new Response(cached.data));
                }
                throw error;
            }
        };
    }

    /**
     * Setup asset cache
     */
    setupAssetCache() {
        // Cache images in memory
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) {
                this.cacheImage(img.src);
            } else {
                img.addEventListener('load', () => {
                    this.cacheImage(img.src);
                });
            }
        });
    }

    /**
     * Cache image
     */
    cacheImage(src) {
        if (!src || this.cache.has(`image:${src}`)) return;
        
        const img = new Image();
        img.src = src;
        
        this.cache.set(`image:${src}`, {
            element: img,
            timestamp: Date.now()
        });
    }

    /**
     * Monitor performance
     */
    monitorPerformance() {
        // Monitor resource loading
        if (window.PerformanceObserver) {
            try {
                const resourceObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    this.analyzeResourcePerformance(entries);
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', resourceObserver);
            } catch (e) {
                console.warn('Resource performance monitoring not supported');
            }
        }

        // Monitor long tasks
        this.monitorLongTasks();

        // Report performance metrics
        this.schedulePerformanceReport();
    }

    /**
     * Analyze resource performance
     */
    analyzeResourcePerformance(entries) {
        entries.forEach(entry => {
            const duration = entry.responseEnd - entry.requestStart;
            const size = entry.transferSize || 0;
            
            if (duration > 1000) { // Slow resource (>1s)
                console.warn(`Slow resource: ${entry.name} (${duration}ms)`);
            }
            
            if (size > 1000000) { // Large resource (>1MB)
                console.warn(`Large resource: ${entry.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
            }
        });
    }

    /**
     * Monitor long tasks
     */
    monitorLongTasks() {
        if (window.PerformanceObserver) {
            try {
                const longTaskObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        console.warn(`Long task detected: ${entry.duration}ms`);
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', longTaskObserver);
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }

    /**
     * Schedule performance report
     */
    schedulePerformanceReport() {
        // Report after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.reportPerformanceMetrics();
            }, 5000);
        });
    }

    /**
     * Optimize animations
     */
    optimizeAnimations() {
        // Use CSS containment
        const animatedElements = document.querySelectorAll('.animated, [class*="animate"]');
        animatedElements.forEach(el => {
            if (!el.style.contain) {
                el.style.contain = 'layout style paint';
            }
        });

        // Optimize scroll-based animations
        this.optimizeScrollAnimations();

        // Use requestAnimationFrame for JavaScript animations
        this.optimizeJSAnimations();
    }

    /**
     * Optimize scroll animations
     */
    optimizeScrollAnimations() {
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    /**
     * Handle scroll animations
     */
    handleScrollAnimations() {
        const scrollAnimatedElements = document.querySelectorAll('[data-scroll-animation]');
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        scrollAnimatedElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top + scrollTop;
            
            if (scrollTop + windowHeight > elementTop) {
                el.classList.add('animate-in');
            }
        });
    }

    /**
     * Optimize JavaScript animations
     */
    optimizeJSAnimations() {
        // Override setTimeout/setInterval for animations
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = (callback, delay) => {
            if (delay <= 16) { // ~60fps
                return requestAnimationFrame(callback);
            }
            return originalSetTimeout(callback, delay);
        };
        
        // Note: setInterval override would need more careful handling
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.cache.size,
            deferredTasks: this.deferredTasks.length,
            resourceHints: this.resourceHints.length,
            observers: this.observers.size
        };
    }

    /**
     * Report performance metrics
     */
    reportPerformanceMetrics() {
        const metrics = this.getPerformanceMetrics();
        
        console.group('🚀 Performance Metrics');
        console.log('Load Time:', metrics.loadTime, 'ms');
        console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
        console.log('First Paint:', metrics.firstPaint, 'ms');
        console.log('First Contentful Paint:', metrics.firstContentfulPaint, 'ms');
        console.log('Largest Contentful Paint:', metrics.largestContentfulPaint, 'ms');
        console.log('First Input Delay:', metrics.firstInputDelay, 'ms');
        console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift);
        console.log('Cache Size:', metrics.cacheSize, 'entries');
        console.groupEnd();
        
        // Send to analytics (placeholder)
        this.sendMetricsToAnalytics(metrics);
    }

    /**
     * Send metrics to analytics
     */
    sendMetricsToAnalytics(metrics) {
        // Send to Google Analytics, Adobe Analytics, etc.
        if (window.gtag) {
            gtag('event', 'page_timing', {
                custom_parameter_1: metrics.loadTime,
                custom_parameter_2: metrics.firstContentfulPaint
            });
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Disconnect observers
        this.observers.forEach((observer, key) => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Clear cache
        this.cache.clear();
        
        // Clear deferred tasks
        this.deferredTasks.length = 0;
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
