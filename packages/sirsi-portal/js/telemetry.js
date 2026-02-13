// SirsiNexus Telemetry Tracking System
// This script should be included on every page to track user behavior

(function() {
    'use strict';

    // Configuration
    const TELEMETRY_CONFIG = {
        endpoint: '/api/telemetry', // Backend endpoint for telemetry data
        batchSize: 50, // Number of events to batch before sending
        flushInterval: 30000, // Send data every 30 seconds
        sessionTimeout: 1800000, // 30 minutes
        trackingEnabled: true, // Re-enabled but with local storage only
        debugMode: false,
        useLocalStorage: true // Store telemetry locally instead of sending to API
    };

    // Telemetry class
    class SirsiNexusTelemetry {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.userId = this.getUserId();
            this.eventQueue = [];
            this.pageLoadTime = Date.now();
            this.lastActivityTime = Date.now();
            this.mousePositions = [];
            this.scrollDepths = {};
            this.elementVisibility = new Map();
            this.clickmap = new Map();
            
            // Page metrics
            this.pageMetrics = {
                loadTime: 0,
                timeOnPage: 0,
                scrollDepth: 0,
                clicks: 0,
                keystrokes: 0,
                mouseMovements: 0,
                elementsViewed: new Set(),
                elementsInteracted: new Set()
            };

            this.init();
        }

        init() {
            // Track page load
            this.trackPageLoad();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start periodic flush
            this.startPeriodicFlush();
            
            // Track page visibility
            this.trackPageVisibility();
            
            // Set up intersection observer for element visibility
            this.setupIntersectionObserver();
            
            // Track performance metrics
            this.trackPerformanceMetrics();
        }

        generateSessionId() {
            const stored = sessionStorage.getItem('sirsi_session_id');
            if (stored) return stored;
            
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sirsi_session_id', sessionId);
            return sessionId;
        }

        getUserId() {
            // Get user ID from localStorage or generate anonymous ID
            return localStorage.getItem('sirsi_user_id') || 'anonymous_' + Math.random().toString(36).substr(2, 9);
        }

        trackPageLoad() {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            
            this.track('page_load', {
                url: window.location.href,
                path: window.location.pathname,
                referrer: document.referrer,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                },
                performance: navigationEntry ? {
                    dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
                    tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
                    request: navigationEntry.responseStart - navigationEntry.requestStart,
                    response: navigationEntry.responseEnd - navigationEntry.responseStart,
                    dom: navigationEntry.domComplete - navigationEntry.domLoading,
                    load: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
                    total: navigationEntry.loadEventEnd - navigationEntry.fetchStart
                } : null
            });
        }

        setupEventListeners() {
            // Click tracking
            document.addEventListener('click', (e) => this.handleClick(e), true);
            
            // Form tracking
            document.addEventListener('submit', (e) => this.handleFormSubmit(e), true);
            document.addEventListener('change', (e) => this.handleFormChange(e), true);
            
            // Focus/Blur tracking
            document.addEventListener('focus', (e) => this.handleFocus(e), true);
            document.addEventListener('blur', (e) => this.handleBlur(e), true);
            
            // Scroll tracking
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => this.handleScroll(), 100);
            });
            
            // Mouse movement tracking (sampled)
            let lastMouseTrack = 0;
            document.addEventListener('mousemove', (e) => {
                const now = Date.now();
                if (now - lastMouseTrack > 1000) { // Track every second
                    this.handleMouseMove(e);
                    lastMouseTrack = now;
                }
            });
            
            // Keyboard tracking
            document.addEventListener('keydown', (e) => this.handleKeydown(e));
            
            // Page unload
            window.addEventListener('beforeunload', () => this.handlePageUnload());
            
            // Error tracking
            window.addEventListener('error', (e) => this.handleError(e));
            
            // File upload/download tracking
            this.trackFileOperations();
        }

        handleClick(event) {
            const element = event.target;
            const data = {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                text: element.textContent?.substring(0, 100),
                href: element.href,
                position: {
                    x: event.pageX,
                    y: event.pageY
                },
                viewport: {
                    x: event.clientX,
                    y: event.clientY
                }
            };

            // Track click heatmap
            const key = `${Math.floor(event.pageX / 10)},${Math.floor(event.pageY / 10)}`;
            this.clickmap.set(key, (this.clickmap.get(key) || 0) + 1);

            // Special tracking for important elements
            if (element.tagName === 'A') {
                data.linkType = element.hostname === window.location.hostname ? 'internal' : 'external';
            }
            
            if (element.tagName === 'BUTTON' || element.type === 'submit') {
                data.action = element.getAttribute('data-action') || 'button_click';
            }

            this.track('click', data);
            this.pageMetrics.clicks++;
        }

        handleFormSubmit(event) {
            const form = event.target;
            this.track('form_submit', {
                formId: form.id,
                formName: form.name,
                action: form.action,
                method: form.method,
                fields: Array.from(form.elements).map(el => ({
                    name: el.name,
                    type: el.type,
                    filled: !!el.value
                }))
            });
        }

        handleFormChange(event) {
            const element = event.target;
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                this.track('form_interaction', {
                    fieldName: element.name,
                    fieldType: element.type,
                    fieldId: element.id,
                    hasValue: !!element.value,
                    timeToInteract: Date.now() - this.pageLoadTime
                });
            }
        }

        handleFocus(event) {
            const element = event.target;
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                this.track('field_focus', {
                    fieldName: element.name,
                    fieldType: element.type,
                    fieldId: element.id,
                    focusTime: Date.now()
                });
            }
        }

        handleBlur(event) {
            const element = event.target;
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                this.track('field_blur', {
                    fieldName: element.name,
                    fieldType: element.type,
                    fieldId: element.id,
                    blurTime: Date.now(),
                    hadValue: !!element.value
                });
            }
        }

        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
            
            this.pageMetrics.scrollDepth = Math.max(this.pageMetrics.scrollDepth, scrollPercentage);
            
            // Track scroll milestones
            const milestones = [25, 50, 75, 90, 100];
            milestones.forEach(milestone => {
                if (scrollPercentage >= milestone && !this.scrollDepths[milestone]) {
                    this.scrollDepths[milestone] = true;
                    this.track('scroll_milestone', {
                        depth: milestone,
                        time: Date.now() - this.pageLoadTime
                    });
                }
            });
        }

        handleMouseMove(event) {
            this.mousePositions.push({
                x: event.pageX,
                y: event.pageY,
                t: Date.now() - this.pageLoadTime
            });
            
            // Keep only last 100 positions
            if (this.mousePositions.length > 100) {
                this.mousePositions.shift();
            }
            
            this.pageMetrics.mouseMovements++;
        }

        handleKeydown(event) {
            // Track keyboard shortcuts
            if (event.ctrlKey || event.metaKey || event.altKey) {
                this.track('keyboard_shortcut', {
                    key: event.key,
                    ctrlKey: event.ctrlKey,
                    metaKey: event.metaKey,
                    altKey: event.altKey,
                    shiftKey: event.shiftKey
                });
            }
            
            this.pageMetrics.keystrokes++;
        }

        handlePageUnload() {
            const timeOnPage = Date.now() - this.pageLoadTime;
            
            this.track('page_unload', {
                timeOnPage: timeOnPage,
                scrollDepth: this.pageMetrics.scrollDepth,
                clicks: this.pageMetrics.clicks,
                keystrokes: this.pageMetrics.keystrokes,
                elementsViewed: Array.from(this.pageMetrics.elementsViewed),
                elementsInteracted: Array.from(this.pageMetrics.elementsInteracted),
                mouseHeatmap: Array.from(this.clickmap.entries()).map(([pos, count]) => ({
                    position: pos,
                    count: count
                }))
            });
            
            // Force flush events
            this.flush(true);
        }

        handleError(event) {
            this.track('javascript_error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        }

        trackPageVisibility() {
            let hiddenTime = null;
            
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    hiddenTime = Date.now();
                    this.track('page_hidden', {
                        timeVisible: hiddenTime - this.pageLoadTime
                    });
                } else if (hiddenTime) {
                    const timeHidden = Date.now() - hiddenTime;
                    this.track('page_visible', {
                        timeHidden: timeHidden
                    });
                    hiddenTime = null;
                }
            });
        }

        setupIntersectionObserver() {
            if (!('IntersectionObserver' in window)) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const element = entry.target;
                    const elementId = element.id || element.className || element.tagName;
                    
                    if (entry.isIntersecting && !this.elementVisibility.has(element)) {
                        this.elementVisibility.set(element, Date.now());
                        this.pageMetrics.elementsViewed.add(elementId);
                        
                        this.track('element_visible', {
                            elementId: elementId,
                            tagName: element.tagName,
                            timeToView: Date.now() - this.pageLoadTime
                        });
                    } else if (!entry.isIntersecting && this.elementVisibility.has(element)) {
                        const viewTime = Date.now() - this.elementVisibility.get(element);
                        this.elementVisibility.delete(element);
                        
                        this.track('element_hidden', {
                            elementId: elementId,
                            tagName: element.tagName,
                            viewDuration: viewTime
                        });
                    }
                });
            }, {
                threshold: [0.25, 0.5, 0.75, 1.0]
            });
            
            // Observe important elements
            const importantSelectors = [
                '[data-track]',
                'article',
                'section',
                '.card',
                '.modal',
                'form',
                'video',
                'img',
                '[role="button"]',
                'a[href]'
            ];
            
            importantSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    observer.observe(el);
                });
            });
        }

        trackFileOperations() {
            // Track file uploads
            document.addEventListener('change', (e) => {
                if (e.target.type === 'file' && e.target.files.length > 0) {
                    const files = Array.from(e.target.files).map(file => ({
                        name: file.name,
                        size: file.size,
                        type: file.type
                    }));
                    
                    this.track('file_selected', {
                        inputId: e.target.id,
                        inputName: e.target.name,
                        files: files,
                        totalSize: files.reduce((sum, file) => sum + file.size, 0)
                    });
                }
            });
            
            // Track downloads by intercepting link clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[download], a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".zip"]');
                if (link) {
                    this.track('file_download', {
                        fileName: link.download || link.href.split('/').pop(),
                        fileUrl: link.href,
                        linkText: link.textContent
                    });
                }
            });
        }

        trackPerformanceMetrics() {
            // Track Web Vitals
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                try {
                    const lcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        this.track('web_vital_lcp', {
                            value: lastEntry.renderTime || lastEntry.loadTime,
                            element: lastEntry.element?.tagName
                        });
                    });
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {}
                
                // First Input Delay
                try {
                    const fidObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            this.track('web_vital_fid', {
                                value: entry.processingStart - entry.startTime,
                                eventType: entry.name
                            });
                        });
                    });
                    fidObserver.observe({ entryTypes: ['first-input'] });
                } catch (e) {}
                
                // Cumulative Layout Shift
                try {
                    let clsValue = 0;
                    const clsObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        }
                        this.track('web_vital_cls', {
                            value: clsValue
                        });
                    });
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {}
            }
        }

        track(eventType, data = {}) {
            const event = {
                type: eventType,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                page: {
                    url: window.location.href,
                    path: window.location.pathname,
                    title: document.title
                },
                data: data,
                context: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    cookiesEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            
            this.eventQueue.push(event);
            
            if (TELEMETRY_CONFIG.debugMode) {
                console.log('Telemetry Event:', event);
            }
            
            // Auto-flush if queue is getting large
            if (this.eventQueue.length >= TELEMETRY_CONFIG.batchSize) {
                this.flush();
            }
        }

        flush(sync = false) {
            if (this.eventQueue.length === 0) return;
            
            const events = [...this.eventQueue];
            this.eventQueue = [];
            
            const payload = {
                events: events,
                session: {
                    id: this.sessionId,
                    duration: Date.now() - this.pageLoadTime
                }
            };
            
            // Store telemetry locally instead of sending to API
            if (TELEMETRY_CONFIG.useLocalStorage) {
                try {
                    const existingData = JSON.parse(localStorage.getItem('sirsi_telemetry') || '[]');
                    existingData.push(payload);
                    // Keep only last 100 payloads
                    if (existingData.length > 100) {
                        existingData.shift();
                    }
                    localStorage.setItem('sirsi_telemetry', JSON.stringify(existingData));
                } catch (e) {
                    console.error('Failed to store telemetry locally:', e);
                }
                return;
            }
            
            if (sync && navigator.sendBeacon) {
                // Use sendBeacon for synchronous sends (page unload)
                navigator.sendBeacon(TELEMETRY_CONFIG.endpoint, JSON.stringify(payload));
            } else {
                // Regular async send
                fetch(TELEMETRY_CONFIG.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).catch(err => {
                    // Re-queue events on failure
                    this.eventQueue.unshift(...events);
                    console.error('Telemetry send failed:', err);
                });
            }
        }

        startPeriodicFlush() {
            setInterval(() => {
                this.flush();
            }, TELEMETRY_CONFIG.flushInterval);
        }

        // Public API for custom tracking
        trackCustom(eventName, data) {
            this.track('custom_' + eventName, data);
        }

        // Track user actions like downloads, uploads, etc.
        trackAction(action, metadata = {}) {
            this.track('user_action', {
                action: action,
                metadata: metadata,
                timestamp: Date.now()
            });
        }
    }

    // Initialize telemetry
    if (TELEMETRY_CONFIG.trackingEnabled) {
        window.SirsiTelemetry = new SirsiNexusTelemetry();
    }
})();
