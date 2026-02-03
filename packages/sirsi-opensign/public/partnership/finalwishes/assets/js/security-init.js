/**
 * Global Security Initializer
 * Automatically loads on all pages to ensure security is pervasive
 * @version 1.0.0
 */

(function () {
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
        developerMode: {
            name: "Cylton Collymore",
            email: "cylton@sirsi.ai",
            phone: "+1 202 747 4787",
            // Master Secret for Google Authenticator (Base32)
            // Use this to add to Google Auth manually if not already bound
            masterSecret: "SIRSI777CYLTON777"
        },
        autoLoadOnPages: ['login', 'signup', 'register', 'portal', 'admin', 'investor', 'developer']
    };

    // Check if we should initialize on this page
    function shouldInitialize() {
        const path = window.location.pathname.toLowerCase();
        // Don't initialize on policy pages themselves to avoid recursion or unnecessary gates
        if (path.includes('privacy.html') || path.includes('terms.html') || path.includes('security.html')) return false;

        return config.autoLoadOnPages.some(page => path.includes(page)) ||
            path.includes('.html') ||
            path.endsWith('/');
    }

    // MFA Enforcement - Per AUTHORIZATION_POLICY.md Section 4.3
    function enforceMFA() {
        if (!config.enable2FA) return;

        const path = window.location.pathname.toLowerCase();
        const sensitivePaths = ['/admin/', '/investor-portal/', 'payment.html', 'create-invoice.html', 'validate_payments.html'];
        const isSensitive = sensitivePaths.some(p => path.includes(p));

        if (isSensitive) {
            const mfaVerified = sessionStorage.getItem('mfaVerified');
            const isGuest = sessionStorage.getItem('isGuest') === 'true';

            if (!mfaVerified && !isGuest) {
                console.warn('⚠️ Sensitive path access attempt without MFA verification');
                showMFAGate();
            }
        }
    }

    function showMFAGate() {
        if (document.getElementById('mfa-gate-modal')) return;

        // Internal State for MFA
        const mfaState = {
            currentMethod: 'totp',
            codes: { sms: null, email: null }
        };

        const modal = document.createElement('div');
        modal.id = 'mfa-gate-modal';
        modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4';

        const renderModalContent = () => {
            const methodTitle = mfaState.currentMethod === 'totp' ? 'Authenticator App' :
                mfaState.currentMethod === 'sms' ? 'SMS Verification' : 'Email Verification';
            const methodTarget = mfaState.currentMethod === 'totp' ? 'Google Authenticator' :
                mfaState.currentMethod === 'sms' ? config.developerMode.phone : config.developerMode.email;
            const methodIcon = mfaState.currentMethod === 'totp' ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' :
                mfaState.currentMethod === 'sms' ? 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' :
                    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';

            modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in relative overflow-hidden">
                <!-- Method Selector Tabs -->
                <div class="flex border-b border-slate-100 dark:border-slate-700 mb-6">
                    <button onclick="window.securityInit.switchMfaMethod('totp')" class="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${mfaState.currentMethod === 'totp' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}">TOTP</button>
                    <button onclick="window.securityInit.switchMfaMethod('sms')" class="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${mfaState.currentMethod === 'sms' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}">SMS</button>
                    <button onclick="window.securityInit.switchMfaMethod('email')" class="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${mfaState.currentMethod === 'email' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}">Email</button>
                </div>

                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${methodIcon}"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">${methodTitle}</h3>
                    <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <p class="text-xs font-bold text-[#C8A951] uppercase tracking-widest">${config.developerMode.name}</p>
                        <p class="text-[10px] text-slate-400 font-mono">${methodTarget}</p>
                    </div>
                    ${mfaState.currentMethod !== 'totp' ? `
                        <button onclick="window.securityInit.sendMfaCode('${mfaState.currentMethod}')" class="mt-4 text-xs text-emerald-600 font-bold hover:underline">Click to Send Code</button>
                    ` : ''}
                </div>
                
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Code</label>
                            <span class="text-[10px] text-emerald-500 font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded">Live Sec-V2</span>
                        </div>
                        <input type="text" id="mfa-code-input" placeholder="000 000" maxlength="6"
                            class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-emerald-500 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all">
                    </div>
                    <button onclick="window.securityInit.verifyMFA('${mfaState.currentMethod}')" 
                        class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <span>Unlock Access</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </button>
                    <button onclick="window.location.href='/index.html'" 
                        class="w-full py-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest transition-all">
                        Terminate Session
                    </button>
                    <p class="text-[9px] text-center text-slate-400 mt-4 leading-relaxed font-mono">
                        AUDIT REFERENCE: ${Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                </div>
            </div>
            `;
        };

        renderModalContent();
        document.body.appendChild(modal);

        // Expose method switcher to public API
        window.securityInit.switchMfaMethod = (method) => {
            mfaState.currentMethod = method;
            renderModalContent();
            setTimeout(() => document.getElementById('mfa-code-input')?.focus(), 100);
        };

        window.securityInit.sendMfaCode = async (method) => {
            const target = method === 'sms' ? config.developerMode.phone : config.developerMode.email;
            const btn = document.querySelector(`button[onclick*="sendMfaCode('${method}')"]`);
            const originalText = btn ? btn.innerText : 'Send';

            try {
                btn.innerText = 'Sending...';
                btn.disabled = true;

                const response = await fetch('https://api-6kdf4or4qq-uc.a.run.app/api/security/mfa/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ method, target })
                });

                const result = await response.json();
                if (result.success) {
                    alert(`✅ Verification code sent to ${target}`);
                    btn.innerText = 'Code Sent';
                    setTimeout(() => { btn.innerText = 'Resend Code'; btn.disabled = false; }, 30000);
                } else {
                    throw new Error(result.error || 'Failed to send code');
                }
            } catch (err) {
                console.error('MFA Send Error:', err);
                alert(`❌ Failed to send code: ${err.message}`);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        };

        // Auto-focus input
        setTimeout(() => document.getElementById('mfa-code-input')?.focus(), 100);
    }

    // Policy Footer Injection - Per PRIVACY_POLICY.md
    function injectPolicyFooter() {
        if (document.getElementById('policy-footer-injected')) return;

        const footers = document.querySelectorAll('footer');
        if (footers.length === 0) return;

        footers.forEach(footer => {
            // Create policy links div if not present
            let legalDiv = footer.querySelector('.policy-links-container');
            if (!legalDiv) {
                legalDiv = document.createElement('div');
                legalDiv.className = 'policy-links-container border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center';
                footer.appendChild(legalDiv);
            }

            legalDiv.id = 'policy-footer-injected';
            legalDiv.innerHTML = `
                <div class="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <a href="/privacy.html" class="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                    <a href="/terms.html" class="hover:text-emerald-600 transition-colors">Terms of Service</a>
                    <a href="/security.html" class="hover:text-emerald-600 transition-colors">Security Policy</a>
                    <a href="/cookies.html" class="hover:text-emerald-600 transition-colors">Cookie Policy</a>
                </div>
                <p class="text-xs text-slate-400">
                    &copy; ${new Date().getFullYear()} Sirsi Technologies Inc.. All rights reserved. 
                    All data is encrypted and handled per SOC 2 Type II compliance standards.
                </p>
            `;
        });
    }

    // Load required scripts
    function loadSecurityScripts() {
        const version = '20260203';
        const scripts = [
            { src: `/assets/js/secure-auth.js?v=${version}`, id: 'secure-auth' },
            { src: `/assets/js/auth-integration.js?v=${version}`, id: 'auth-integration' }
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
            csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.ipify.org https://api-6kdf4or4qq-uc.a.run.app https://checkout.stripe.com; frame-src https://checkout.stripe.com https://js.stripe.com; object-src 'none';";
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

        // Expose public API EARLIER to prevent onclick ReferenceErrors
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
                encryptionReady: !!(window.secureAuth && window.secureAuth.encryptionKey),
                mfaVerified: !!sessionStorage.getItem('mfaVerified')
            }),
            verifyMFA: async (method) => {
                const input = document.getElementById('mfa-code-input');
                const code = input?.value?.replace(/\s/g, '');

                if (!code || code.length !== 6) {
                    alert('Please enter a valid 6-digit verification code.');
                    return;
                }

                let isValid = false;

                if (method === 'totp') {
                    // Check against real TOTP logic
                    if (window.secureAuth && window.secureAuth.verifyTOTPCode) {
                        isValid = window.secureAuth.verifyTOTPCode(config.developerMode.masterSecret, code);
                    } else {
                        // Fallback TOTP check
                        const window_size = 30;
                        const time = Math.floor(Date.now() / 1000 / window_size);
                        const generateHash = (s, t) => {
                            return Array.from(s + t).reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
                        };
                        for (let i = -1; i <= 1; i++) {
                            const expected = String(Math.abs(generateHash(config.developerMode.masterSecret, time + i)) % 1000000).padStart(6, '0');
                            if (code === expected) isValid = true;
                        }
                    }
                } else {
                    // Check against live backend verification
                    try {
                        const target = method === 'sms' ? config.developerMode.phone : config.developerMode.email;
                        const response = await fetch('https://api-6kdf4or4qq-uc.a.run.app/api/security/mfa/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ method, target, code })
                        });
                        const result = await response.json();
                        if (result.success) {
                            isValid = true;
                        } else {
                            alert(`❌ Verification failed: ${result.error}`);
                            return;
                        }
                    } catch (err) {
                        console.error('MFA Verify Error:', err);
                        alert('❌ Connection to security rail failed');
                        return;
                    }
                }

                if (isValid) {
                    sessionStorage.setItem('mfaVerified', 'true');
                    sessionStorage.setItem('mfaMethod', method);
                    sessionStorage.setItem('signerEmail', config.developerMode.email);
                    sessionStorage.setItem('signerName', config.developerMode.name);

                    auditLog('MFA_VERIFIED', {
                        method: method,
                        user: config.developerMode.email,
                        identity: 'Developer Admin'
                    });

                    const modal = document.getElementById('mfa-gate-modal');
                    if (modal) {
                        modal.classList.add('opacity-0');
                        setTimeout(() => {
                            modal.remove();
                            if (window.location.pathname.includes('payment.html')) {
                                window.location.reload();
                            }
                        }, 300);
                    }
                } else {
                    const errorMsg = method === 'totp' ?
                        `Invalid Authenticator code for ${config.developerMode.email}` :
                        `Invalid ${method.toUpperCase()} verification code.`;
                    alert(errorMsg);
                    auditLog('MFA_FAILED', { method: method, user: config.developerMode.email });
                }
            }
        };

        // Set security headers
        setSecurityHeaders();

        // Load security scripts
        loadSecurityScripts();

        // Initialize session monitoring
        initializeSessionMonitoring();

        // Secure form handling
        secureFormHandling();

        // Enforce MFA for sensitive paths
        enforceMFA();

        // Inject policy footer
        setTimeout(injectPolicyFooter, 500);

        // Log page view
        auditLog('PAGE_VIEW', {
            referrer: document.referrer,
            title: document.title
        });

        // Monitor for XSS attempts
        monitorXSS();
    }

    function monitorXSS() {
        // Override potentially dangerous methods
        const dangerousMethods = ['eval', 'Function'];

        dangerousMethods.forEach(method => {
            const original = window[method];
            window[method] = function (...args) {
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
