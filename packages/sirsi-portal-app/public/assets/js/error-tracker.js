/**
 * Error Tracking Service
 * Captures and reports JavaScript errors, API failures, and other issues
 */

class ErrorTracker {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.sessionId = this.generateSessionId();
        this.userId = null;
        
        this.config = {
            enableConsoleCapture: true,
            enableNetworkCapture: true,
            enableStackTrace: true,
            enableSourceMap: false,
            enableFirebaseLogging: false,
            reportingEndpoint: null,
            environment: this.detectEnvironment(),
            version: '1.0.0'
        };
        
        this.errorCounts = {
            javascript: 0,
            network: 0,
            promise: 0,
            console: 0
        };
        
        this.init();
    }
    
    init() {
        // Set up global error handlers
        this.setupErrorHandlers();
        
        // Capture console errors
        if (this.config.enableConsoleCapture) {
            this.captureConsoleErrors();
        }
        
        // Monitor network errors
        if (this.config.enableNetworkCapture) {
            this.monitorNetworkErrors();
        }
        
        // Initialize Firebase Crashlytics if available
        this.initFirebaseCrashlytics();
        
        // Set up user context
        this.setupUserContext();
        
        console.log('[Error Tracker] Initialized');
    }
    
    /**
     * Set up global error handlers
     */
    setupErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'javascript',
                message: event.message,
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'promise',
                message: `Unhandled Promise Rejection: ${event.reason}`,
                reason: event.reason,
                promise: event.promise,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
        
        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.captureError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    tagName: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }
    
    /**
     * Capture console errors
     */
    captureConsoleErrors() {
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args) => {
            this.captureError({
                type: 'console',
                level: 'error',
                message: args.map(arg => this.stringifyArg(arg)).join(' '),
                arguments: args,
                stack: this.getStackTrace(),
                timestamp: Date.now()
            });
            
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            // Only capture warnings in production
            if (this.config.environment === 'production') {
                this.captureError({
                    type: 'console',
                    level: 'warn',
                    message: args.map(arg => this.stringifyArg(arg)).join(' '),
                    arguments: args,
                    stack: this.getStackTrace(),
                    timestamp: Date.now()
                });
            }
            
            originalWarn.apply(console, args);
        };
    }
    
    /**
     * Monitor network errors
     */
    monitorNetworkErrors() {
        // Intercept fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = Date.now();
            const [resource, config] = args;
            
            try {
                const response = await originalFetch(...args);
                
                // Check for HTTP errors
                if (!response.ok) {
                    this.captureError({
                        type: 'network',
                        subtype: 'fetch',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: resource.toString(),
                        method: config?.method || 'GET',
                        status: response.status,
                        statusText: response.statusText,
                        duration: Date.now() - startTime,
                        timestamp: Date.now()
                    });
                }
                
                return response;
            } catch (error) {
                this.captureError({
                    type: 'network',
                    subtype: 'fetch',
                    message: `Network request failed: ${error.message}`,
                    url: resource.toString(),
                    method: config?.method || 'GET',
                    error: error,
                    duration: Date.now() - startTime,
                    timestamp: Date.now()
                });
                
                throw error;
            }
        };
        
        // Intercept XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._errorTracker = {
                method: method,
                url: url,
                startTime: null
            };
            
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._errorTracker) {
                this._errorTracker.startTime = Date.now();
                
                this.addEventListener('error', () => {
                    window.errorTracker.captureError({
                        type: 'network',
                        subtype: 'xhr',
                        message: 'XMLHttpRequest failed',
                        url: this._errorTracker.url,
                        method: this._errorTracker.method,
                        duration: Date.now() - this._errorTracker.startTime,
                        timestamp: Date.now()
                    });
                });
                
                this.addEventListener('load', () => {
                    if (this.status >= 400) {
                        window.errorTracker.captureError({
                            type: 'network',
                            subtype: 'xhr',
                            message: `HTTP ${this.status}: ${this.statusText}`,
                            url: this._errorTracker.url,
                            method: this._errorTracker.method,
                            status: this.status,
                            statusText: this.statusText,
                            duration: Date.now() - this._errorTracker.startTime,
                            timestamp: Date.now()
                        });
                    }
                });
            }
            
            return originalSend.apply(this, args);
        };
    }
    
    /**
     * Initialize Firebase Crashlytics
     */
    initFirebaseCrashlytics() {
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            try {
                this.config.enableFirebaseLogging = true;
                console.log('[Error Tracker] Firebase Crashlytics enabled');
            } catch (e) {
                console.warn('[Error Tracker] Firebase Crashlytics not available');
            }
        }
    }
    
    /**
     * Set up user context
     */
    setupUserContext() {
        // Listen for authentication changes
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.setUser(user.uid, {
                        email: user.email,
                        displayName: user.displayName
                    });
                } else {
                    this.clearUser();
                }
            });
        }
    }
    
    /**
     * Capture an error
     */
    captureError(errorData) {
        // Increment counter
        this.errorCounts[errorData.type] = (this.errorCounts[errorData.type] || 0) + 1;
        
        // Create error object
        const error = {
            id: this.generateErrorId(),
            sessionId: this.sessionId,
            userId: this.userId,
            ...errorData,
            context: this.getContext(),
            breadcrumbs: this.getBreadcrumbs()
        };
        
        // Add to errors array
        this.errors.push(error);
        
        // Trim errors array if needed
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log to console
        console.error('[Error Tracker]', error);
        
        // Report error
        this.reportError(error);
        
        return error;
    }
    
    /**
     * Report error to various services
     */
    async reportError(error) {
        // Report to Firebase
        if (this.config.enableFirebaseLogging && firebase.analytics) {
            firebase.analytics().logEvent('error_captured', {
                error_type: error.type,
                error_message: error.message?.substring(0, 100),
                error_source: error.source,
                error_id: error.id
            });
        }
        
        // Report to custom endpoint
        if (this.config.reportingEndpoint) {
            try {
                await fetch(this.config.reportingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(error)
                });
            } catch (e) {
                console.error('[Error Tracker] Failed to report error:', e);
            }
        }
        
        // Store in localStorage for offline reporting
        this.storeErrorForOfflineReporting(error);
    }
    
    /**
     * Store error for offline reporting
     */
    storeErrorForOfflineReporting(error) {
        try {
            const storedErrors = JSON.parse(localStorage.getItem('errorTracker_errors') || '[]');
            storedErrors.push({
                ...error,
                stored: true,
                storedAt: Date.now()
            });
            
            // Keep only last 50 errors
            if (storedErrors.length > 50) {
                storedErrors.splice(0, storedErrors.length - 50);
            }
            
            localStorage.setItem('errorTracker_errors', JSON.stringify(storedErrors));
        } catch (e) {
            // Ignore localStorage errors
        }
    }
    
    /**
     * Report stored offline errors
     */
    async reportOfflineErrors() {
        try {
            const storedErrors = JSON.parse(localStorage.getItem('errorTracker_errors') || '[]');
            
            if (storedErrors.length > 0 && this.config.reportingEndpoint) {
                const response = await fetch(this.config.reportingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        batch: true,
                        errors: storedErrors
                    })
                });
                
                if (response.ok) {
                    localStorage.removeItem('errorTracker_errors');
                    console.log(`[Error Tracker] Reported ${storedErrors.length} offline errors`);
                }
            }
        } catch (e) {
            console.error('[Error Tracker] Failed to report offline errors:', e);
        }
    }
    
    /**
     * Get current context
     */
    getContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timestamp: Date.now(),
            environment: this.config.environment,
            version: this.config.version
        };
    }
    
    /**
     * Get breadcrumbs (last actions)
     */
    getBreadcrumbs() {
        // This would typically track user actions
        // For now, return empty array
        return [];
    }
    
    /**
     * Get stack trace
     */
    getStackTrace() {
        const error = new Error();
        return error.stack || '';
    }
    
    /**
     * Stringify argument for console capture
     */
    stringifyArg(arg) {
        if (typeof arg === 'string') {
            return arg;
        }
        
        if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}`;
        }
        
        try {
            return JSON.stringify(arg);
        } catch {
            return String(arg);
        }
    }
    
    /**
     * Detect environment
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        
        if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        }
        
        return 'production';
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Set user context
     */
    setUser(userId, userData = {}) {
        this.userId = userId;
        
        if (this.config.enableFirebaseLogging && firebase.analytics) {
            firebase.analytics().setUserId(userId);
            firebase.analytics().setUserProperties(userData);
        }
    }
    
    /**
     * Clear user context
     */
    clearUser() {
        this.userId = null;
    }
    
    /**
     * Manual error capture
     */
    captureException(error, context = {}) {
        return this.captureError({
            type: 'manual',
            message: error.message || String(error),
            error: error,
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        });
    }
    
    /**
     * Capture message
     */
    captureMessage(message, level = 'info', context = {}) {
        return this.captureError({
            type: 'message',
            level: level,
            message: message,
            context: context,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get error summary
     */
    getSummary() {
        const recentErrors = this.errors.slice(-10);
        
        return {
            sessionId: this.sessionId,
            totalErrors: this.errors.length,
            errorCounts: this.errorCounts,
            recentErrors: recentErrors,
            environment: this.config.environment,
            version: this.config.version
        };
    }
    
    /**
     * Get errors by type
     */
    getErrorsByType(type) {
        return this.errors.filter(error => error.type === type);
    }
    
    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = [];
        this.errorCounts = {
            javascript: 0,
            network: 0,
            promise: 0,
            console: 0
        };
    }
    
    /**
     * Export errors for debugging
     */
    exportErrors() {
        const data = {
            sessionId: this.sessionId,
            userId: this.userId,
            errors: this.errors,
            errorCounts: this.errorCounts,
            context: this.getContext(),
            exported: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Test error tracking
     */
    test() {
        console.log('[Error Tracker] Running tests...');
        
        // Test JavaScript error
        try {
            throw new Error('Test JavaScript error');
        } catch (e) {
            this.captureException(e);
        }
        
        // Test message
        this.captureMessage('Test message', 'info');
        
        // Test network error
        fetch('https://nonexistent.example.com/api/test').catch(() => {});
        
        console.log('[Error Tracker] Tests complete. Check getSummary() for results.');
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.errorTracker = new ErrorTracker();
        
        // Report offline errors when online
        window.addEventListener('online', () => {
            window.errorTracker.reportOfflineErrors();
        });
    });
} else {
    window.errorTracker = new ErrorTracker();
    
    // Report offline errors when online
    window.addEventListener('online', () => {
        window.errorTracker.reportOfflineErrors();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorTracker;
}
