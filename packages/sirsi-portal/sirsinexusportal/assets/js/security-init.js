/**
 * Global Security Initializer
 * Automatically loads on all pages to ensure security is pervasive
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Security configuration
    const config = {
        enableAuth: true,
        enableCSP: true,
        enableAudit: true,
        enable2FA: true,
        enableEncryption: true,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        requireEmailVerification: true,
        autoLoadOnPages: ['login', 'signup', 'register', 'portal', 'admin', 'investor', 'developer']
    };

    // Check if we should initialize on this page
    function shouldInitialize() {
        const path = window.location.pathname.toLowerCase();
        return config.autoLoadOnPages.some(page => path.includes(page)) || 
               path.includes('.html') || 
               path.endsWith('/');
    }

    // Load required scripts
    function loadSecurityScripts() {
        const scripts = [
            { src: '/assets/js/secure-auth.js', id: 'secure-auth' },
            { src: '/assets/js/auth-integration.js', id: 'auth-integration' }
        ];

        scripts.forEach(script => {
            if (!document.getElementById(script.id)) {
                const scriptTag = document.createElement('script');
                scriptTag.src = script.src;
                scriptTag.id = script.id;
                scriptTag.async = false;
                document.head.appendChild(scriptTag);
            }
        });
    }

    // Set security headers via meta tags
    function setSecurityHeaders() {
        if (!config.enableCSP) return;

        // Content Security Policy
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const csp = document.createElement('meta');
            csp.httpEquiv = 'Content-Security-Policy';
            csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.ipify.org; frame-src 'none'; object-src 'none';";
            document.head.appendChild(csp);
        }

        // Referrer Policy
        if (!document.querySelector('meta[name="referrer"]')) {
            const referrer = document.createElement('meta');
            referrer.name = 'referrer';
            referrer.content = 'strict-origin-when-cross-origin';
            document.head.appendChild(referrer);
        }
    }

    // Initialize session monitoring
    function initializeSessionMonitoring() {
        // Check session validity
        const checkSession = () => {
            const sessionId = sessionStorage.getItem('authToken');
            const sessionStart = sessionStorage.getItem('sessionStart');
            
            if (sessionId && sessionStart) {
                const elapsed = Date.now() - parseInt(sessionStart);
                if (elapsed > config.sessionTimeout) {
                    // Session expired
                    handleSessionExpired();
                }
            }
        };

        // Monitor activity
        let activityTimer;
        const resetActivityTimer = () => {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                // Warn about inactivity
                if (sessionStorage.getItem('authToken')) {
                    showInactivityWarning();
                }
            }, 15 * 60 * 1000); // 15 minutes
        };

        // Track activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetActivityTimer, { passive: true });
        });

        // Check session every minute
        setInterval(checkSession, 60 * 1000);
        
        // Set session start time if logged in
        if (sessionStorage.getItem('authToken') && !sessionStorage.getItem('sessionStart')) {
            sessionStorage.setItem('sessionStart', Date.now().toString());
        }
    }

    // Handle expired session
    function handleSessionExpired() {
        sessionStorage.clear();
        localStorage.removeItem('authenticated');
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4 text-red-600">Session Expired</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your session has expired for security reasons. Please log in again.
                </p>
                <button onclick="window.location.href='/login.html'" 
                    class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    Go to Login
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show inactivity warning
    function showInactivityWarning() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4 text-amber-600">Session Timeout Warning</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You will be logged out in 5 minutes due to inactivity.
                </p>
                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove(); window.securityInit.extendSession()" 
                        class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        Stay Logged In
                    </button>
                    <button onclick="window.securityInit.logout()" 
                        class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Log Out Now
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto logout after 5 minutes
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
                handleSessionExpired();
            }
        }, 5 * 60 * 1000);
    }

    // Secure form handling
    function secureFormHandling() {
        // Add CSRF tokens to all forms
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                const csrfInput = e.target.querySelector('input[name="csrf_token"]');
                if (!csrfInput) {
                    const token = sessionStorage.getItem('csrfToken') || generateCSRFToken();
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'csrf_token';
                    input.value = token;
                    e.target.appendChild(input);
                }
            }
        }, true);

        // Prevent autocomplete on sensitive fields
        const sensitiveFields = document.querySelectorAll(
            'input[type="password"], input[name*="ssn"], input[name*="credit"], input[name*="cvv"]'
        );
        sensitiveFields.forEach(field => {
            field.setAttribute('autocomplete', 'off');
            field.setAttribute('autocorrect', 'off');
            field.setAttribute('autocapitalize', 'off');
            field.setAttribute('spellcheck', 'false');
        });
    }

    // Generate CSRF token
    function generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrfToken', token);
        return token;
    }

    // Audit logging
    function auditLog(action, details = {}) {
        if (!config.enableAudit) return;

        const log = {
            action,
            details,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem('authToken') || 'anonymous'
        };

        // Store in IndexedDB when available
        if (window.secureAuth && window.secureAuth.auditLog) {
            window.secureAuth.auditLog(
                sessionStorage.getItem('userId'),
                action,
                details
            );
        } else {
            // Fallback to localStorage
            const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
            logs.push(log);
            // Keep only last 1000 logs
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            localStorage.setItem('auditLogs', JSON.stringify(logs));
        }
    }

    // Initialize security features
    function initialize() {
        if (!shouldInitialize()) return;

        console.log('🔒 Initializing security features...');

        // Set security headers
        setSecurityHeaders();

        // Load security scripts
        loadSecurityScripts();

        // Initialize session monitoring
        initializeSessionMonitoring();

        // Secure form handling
        secureFormHandling();

        // Log page view
        auditLog('PAGE_VIEW', {
            referrer: document.referrer,
            title: document.title
        });

        // Monitor for XSS attempts
        monitorXSS();

        // Expose public API
        window.securityInit = {
            auditLog,
            extendSession: () => {
                sessionStorage.setItem('sessionStart', Date.now().toString());
                auditLog('SESSION_EXTENDED');
            },
            logout: async () => {
                if (window.secureAuth && window.secureAuth.logout) {
                    await window.secureAuth.logout();
                }
                sessionStorage.clear();
                localStorage.removeItem('authenticated');
                window.location.href = '/login.html';
            },
            getSecurityStatus: () => ({
                authLoaded: !!window.secureAuth,
                sessionActive: !!sessionStorage.getItem('authToken'),
                csrfToken: !!sessionStorage.getItem('csrfToken'),
                encryptionReady: !!(window.secureAuth && window.secureAuth.encryptionKey)
            })
        };

        console.log('✅ Security features initialized');
    }

    // Monitor for XSS attempts
    function monitorXSS() {
        // Override potentially dangerous methods
        const dangerousMethods = ['eval', 'Function'];
        
        dangerousMethods.forEach(method => {
            const original = window[method];
            window[method] = function(...args) {
                auditLog('POTENTIAL_XSS', {
                    method,
                    args: args.map(a => String(a).substring(0, 100))
                });
                
                // In production, you might want to block this
                console.warn(`⚠️ Potentially dangerous ${method} call detected`);
                
                return original.apply(this, args);
            };
        });

        // Monitor DOM changes for script injection
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && !node.src.includes('/')) {
                        auditLog('SUSPICIOUS_SCRIPT', {
                            src: node.src,
                            content: node.textContent.substring(0, 100)
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
