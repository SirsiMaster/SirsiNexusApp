/**
 * Security Headers Service
 * Implements CSP, HSTS, X-Frame-Options and other security headers
 */

class SecurityHeaders {
    constructor() {
        this.config = {
            enableCSP: true,
            enableHSTS: true,
            enableFrameOptions: true,
            enableContentTypeOptions: true,
            enableXSSProtection: true,
            enableReferrerPolicy: true,
            enablePermissionsPolicy: true,
            reportingEndpoint: '/api/security/csp-report',
            environment: this.detectEnvironment()
        };
        
        this.cspDirectives = this.getCSPDirectives();
        this.violationReports = [];
        
        this.init();
    }
    
    init() {
        // Apply meta tag based headers
        this.applyMetaHeaders();
        
        // Set up CSP violation reporting
        this.setupCSPReporting();
        
        // Monitor security events
        this.monitorSecurityEvents();
        
        // Check current security status
        this.checkSecurityStatus();
        
        console.log('[Security Headers] Initialized');
    }
    
    /**
     * Get CSP directives based on environment
     */
    getCSPDirectives() {
        const baseDirectives = {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'", // Remove in production
                "'unsafe-eval'",   // Remove in production
                "https://www.gstatic.com",
                "https://apis.google.com",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com",
                "https://js.stripe.com"
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'", // Required for inline styles
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            'font-src': [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com",
                "data:"
            ],
            'img-src': [
                "'self'",
                "data:",
                "blob:",
                "https:",
                "http://localhost:*"
            ],
            'connect-src': [
                "'self'",
                "https://*.firebaseio.com",
                "https://*.firebaseapp.com",
                "https://*.googleapis.com",
                "https://api.stripe.com",
                "https://sirsi.ai",
                "https://sirsi-nexus-live.firebaseapp.com",
                "wss://*.firebaseio.com",
                "http://localhost:*"
            ],
            'media-src': [
                "'self'",
                "blob:",
                "data:"
            ],
            'object-src': ["'none'"],
            'frame-src': [
                "'self'",
                "https://js.stripe.com",
                "https://hooks.stripe.com"
            ],
            'frame-ancestors': ["'self'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'manifest-src': ["'self'"],
            'worker-src': [
                "'self'",
                "blob:"
            ]
        };
        
        // Add report-uri if endpoint is configured
        if (this.config.reportingEndpoint) {
            baseDirectives['report-uri'] = [this.config.reportingEndpoint];
        }
        
        // Adjust for development environment
        if (this.config.environment === 'development') {
            baseDirectives['script-src'].push("'unsafe-inline'", "'unsafe-eval'");
            baseDirectives['connect-src'].push("ws://localhost:*");
        }
        
        return baseDirectives;
    }
    
    /**
     * Apply security headers via meta tags
     */
    applyMetaHeaders() {
        // Content Security Policy
        if (this.config.enableCSP) {
            this.applyCSP();
        }
        
        // Other security headers via meta tags
        const metaHeaders = [
            { 
                httpEquiv: 'X-Content-Type-Options', 
                content: 'nosniff',
                enabled: this.config.enableContentTypeOptions
            },
            { 
                httpEquiv: 'X-Frame-Options', 
                content: 'SAMEORIGIN',
                enabled: this.config.enableFrameOptions
            },
            { 
                httpEquiv: 'X-XSS-Protection', 
                content: '1; mode=block',
                enabled: this.config.enableXSSProtection
            },
            { 
                name: 'referrer', 
                content: 'strict-origin-when-cross-origin',
                enabled: this.config.enableReferrerPolicy
            }
        ];
        
        metaHeaders.forEach(header => {
            if (header.enabled) {
                this.addMetaTag(header);
            }
        });
        
        // Permissions Policy (Feature Policy)
        if (this.config.enablePermissionsPolicy) {
            this.applyPermissionsPolicy();
        }
    }
    
    /**
     * Apply Content Security Policy
     */
    applyCSP() {
        const cspString = this.buildCSPString(this.cspDirectives);
        
        // Add CSP meta tag
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspString;
        document.head.appendChild(meta);
        
        console.log('[Security Headers] CSP applied:', cspString);
    }
    
    /**
     * Build CSP string from directives
     */
    buildCSPString(directives) {
        return Object.entries(directives)
            .map(([key, values]) => `${key} ${values.join(' ')}`)
            .join('; ');
    }
    
    /**
     * Apply Permissions Policy
     */
    applyPermissionsPolicy() {
        const permissions = {
            'accelerometer': ['self'],
            'camera': ['self'],
            'geolocation': ['self'],
            'gyroscope': ['self'],
            'magnetometer': ['self'],
            'microphone': ['self'],
            'payment': ['self', 'https://js.stripe.com'],
            'usb': ['self']
        };
        
        const policyString = Object.entries(permissions)
            .map(([key, values]) => `${key}=(${values.join(' ')})`)
            .join(', ');
        
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Permissions-Policy';
        meta.content = policyString;
        document.head.appendChild(meta);
    }
    
    /**
     * Add meta tag to head
     */
    addMetaTag(config) {
        const meta = document.createElement('meta');
        
        if (config.httpEquiv) {
            meta.httpEquiv = config.httpEquiv;
        } else if (config.name) {
            meta.name = config.name;
        }
        
        meta.content = config.content;
        document.head.appendChild(meta);
    }
    
    /**
     * Set up CSP violation reporting
     */
    setupCSPReporting() {
        // Listen for security policy violation events
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleCSPViolation(event);
        });
    }
    
    /**
     * Handle CSP violation
     */
    handleCSPViolation(event) {
        const violation = {
            blockedURI: event.blockedURI,
            columnNumber: event.columnNumber,
            disposition: event.disposition,
            documentURI: event.documentURI,
            effectiveDirective: event.effectiveDirective,
            lineNumber: event.lineNumber,
            originalPolicy: event.originalPolicy,
            referrer: event.referrer,
            sample: event.sample,
            sourceFile: event.sourceFile,
            statusCode: event.statusCode,
            violatedDirective: event.violatedDirective,
            timestamp: Date.now()
        };
        
        // Store violation
        this.violationReports.push(violation);
        
        // Log violation
        console.warn('[Security Headers] CSP Violation:', violation);
        
        // Report to server
        this.reportViolation(violation);
    }
    
    /**
     * Report violation to server
     */
    async reportViolation(violation) {
        if (!this.config.reportingEndpoint) return;
        
        try {
            await fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'csp-violation',
                    violation: violation,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('[Security Headers] Failed to report violation:', error);
        }
    }
    
    /**
     * Monitor security events
     */
    monitorSecurityEvents() {
        // Monitor mixed content
        this.detectMixedContent();
        
        // Monitor insecure requests
        this.monitorInsecureRequests();
        
        // Check for XSS attempts
        this.monitorXSSAttempts();
        
        // Monitor iframe usage
        this.monitorIframes();
    }
    
    /**
     * Detect mixed content
     */
    detectMixedContent() {
        if (window.location.protocol === 'https:') {
            // Check for HTTP resources
            const resources = [
                ...document.getElementsByTagName('img'),
                ...document.getElementsByTagName('script'),
                ...document.getElementsByTagName('link'),
                ...document.getElementsByTagName('iframe')
            ];
            
            resources.forEach(resource => {
                const src = resource.src || resource.href;
                if (src && src.startsWith('http://')) {
                    console.warn('[Security Headers] Mixed content detected:', src);
                    this.reportSecurityIssue('mixed-content', { url: src });
                }
            });
        }
    }
    
    /**
     * Monitor insecure requests
     */
    monitorInsecureRequests() {
        // Intercept fetch to check for insecure requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource] = args;
            const url = resource.toString();
            
            // Check if request is to insecure origin
            if (url.startsWith('http://') && !url.includes('localhost')) {
                console.warn('[Security Headers] Insecure request detected:', url);
                this.reportSecurityIssue('insecure-request', { url });
            }
            
            return originalFetch(...args);
        };
    }
    
    /**
     * Monitor XSS attempts
     */
    monitorXSSAttempts() {
        // Monitor for suspicious patterns in URL parameters
        const params = new URLSearchParams(window.location.search);
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i,
            /<iframe/i,
            /eval\(/i,
            /document\.write/i
        ];
        
        params.forEach((value, key) => {
            suspiciousPatterns.forEach(pattern => {
                if (pattern.test(value)) {
                    console.error('[Security Headers] Potential XSS attempt detected:', { key, value });
                    this.reportSecurityIssue('xss-attempt', { key, value });
                    
                    // Clean the URL
                    params.delete(key);
                    const cleanUrl = `${window.location.pathname}?${params.toString()}`;
                    window.history.replaceState(null, '', cleanUrl);
                }
            });
        });
    }
    
    /**
     * Monitor iframe usage
     */
    monitorIframes() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'IFRAME') {
                        const src = node.src;
                        
                        // Check if iframe source is allowed
                        if (!this.isAllowedIframeSource(src)) {
                            console.warn('[Security Headers] Unauthorized iframe detected:', src);
                            node.remove();
                            this.reportSecurityIssue('unauthorized-iframe', { src });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Check if iframe source is allowed
     */
    isAllowedIframeSource(src) {
        const allowedSources = [
            'https://js.stripe.com',
            'https://hooks.stripe.com',
            'https://www.youtube.com',
            'https://player.vimeo.com'
        ];
        
        return allowedSources.some(allowed => src.startsWith(allowed));
    }
    
    /**
     * Report security issue
     */
    async reportSecurityIssue(type, details) {
        const issue = {
            type,
            details,
            url: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // Log to console
        console.warn('[Security Headers] Security issue:', issue);
        
        // Store locally
        this.storeSecurityIssue(issue);
        
        // Report to server if configured
        if (this.config.reportingEndpoint) {
            try {
                await fetch(this.config.reportingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(issue)
                });
            } catch (error) {
                console.error('[Security Headers] Failed to report issue:', error);
            }
        }
    }
    
    /**
     * Store security issue locally
     */
    storeSecurityIssue(issue) {
        try {
            const stored = JSON.parse(localStorage.getItem('securityIssues') || '[]');
            stored.push(issue);
            
            // Keep only last 100 issues
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }
            
            localStorage.setItem('securityIssues', JSON.stringify(stored));
        } catch (error) {
            console.error('[Security Headers] Failed to store issue:', error);
        }
    }
    
    /**
     * Check current security status
     */
    checkSecurityStatus() {
        const status = {
            https: window.location.protocol === 'https:',
            csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            frameOptions: !!document.querySelector('meta[http-equiv="X-Frame-Options"]'),
            contentTypeOptions: !!document.querySelector('meta[http-equiv="X-Content-Type-Options"]'),
            xssProtection: !!document.querySelector('meta[http-equiv="X-XSS-Protection"]'),
            referrerPolicy: !!document.querySelector('meta[name="referrer"]'),
            violations: this.violationReports.length,
            score: 0
        };
        
        // Calculate security score
        const checks = ['https', 'csp', 'frameOptions', 'contentTypeOptions', 'xssProtection', 'referrerPolicy'];
        const passed = checks.filter(check => status[check]).length;
        status.score = Math.round((passed / checks.length) * 100);
        
        console.log('[Security Headers] Security Status:', status);
        
        return status;
    }
    
    /**
     * Get security report
     */
    getSecurityReport() {
        return {
            status: this.checkSecurityStatus(),
            violations: this.violationReports,
            config: this.config,
            cspDirectives: this.cspDirectives,
            timestamp: Date.now()
        };
    }
    
    /**
     * Export security report
     */
    exportSecurityReport() {
        const report = this.getSecurityReport();
        
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
     * Update CSP directive
     */
    updateCSPDirective(directive, values) {
        this.cspDirectives[directive] = values;
        
        // Reapply CSP
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingCSP) {
            existingCSP.content = this.buildCSPString(this.cspDirectives);
        }
    }
    
    /**
     * Enable strict mode
     */
    enableStrictMode() {
        // Remove unsafe-inline and unsafe-eval
        if (this.cspDirectives['script-src']) {
            this.cspDirectives['script-src'] = this.cspDirectives['script-src']
                .filter(src => src !== "'unsafe-inline'" && src !== "'unsafe-eval'");
        }
        
        if (this.cspDirectives['style-src']) {
            this.cspDirectives['style-src'] = this.cspDirectives['style-src']
                .filter(src => src !== "'unsafe-inline'");
        }
        
        // Reapply CSP
        this.applyCSP();
        
        console.log('[Security Headers] Strict mode enabled');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.securityHeaders = new SecurityHeaders();
    });
} else {
    window.securityHeaders = new SecurityHeaders();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityHeaders;
}
