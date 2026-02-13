/**
 * Monitoring Loader
 * Automatically loads Firebase monitoring on all pages
 */

(function() {
    'use strict';

    // Check if Firebase is loaded
    function waitForFirebase(callback) {
        if (typeof firebase !== 'undefined') {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }

    // Load monitoring module
    function loadMonitoring() {
        // Check if already loaded
        if (window.SirsiMonitoring && window.SirsiMonitoring.initialized) {
            return;
        }

        // Create script element for monitoring module
        const script = document.createElement('script');
        script.src = '/assets/js/firebase-monitoring.js';
        script.async = true;
        
        script.onload = function() {
            console.log('Firebase Monitoring module loaded');
            
            // Set up page-specific tracking
            setupPageTracking();
            
            // Track initial page view
            if (window.SirsiMonitoring) {
                window.SirsiMonitoring.logPageView();
            }
        };
        
        script.onerror = function() {
            console.error('Failed to load Firebase Monitoring module');
        };
        
        document.head.appendChild(script);
    }

    // Set up page-specific tracking
    function setupPageTracking() {
        if (!window.SirsiMonitoring) return;

        // Track link clicks
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    window.SirsiMonitoring.logUserAction('link_click', 'navigation', href);
                }
            }

            // Track button clicks
            const button = e.target.closest('button');
            if (button) {
                const text = button.textContent.trim();
                const id = button.id || button.className;
                window.SirsiMonitoring.logUserAction('button_click', 'interaction', id || text);
            }
        });

        // Track form submissions
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const formId = form.id || form.className || 'unknown_form';
            window.SirsiMonitoring.logUserAction('form_submit', 'conversion', formId);
            
            // Start trace for form submission
            const trace = window.SirsiMonitoring.startTrace('form_submission', {
                form_id: formId
            });
            
            // Stop trace when form is actually submitted
            setTimeout(() => {
                if (trace) {
                    window.SirsiMonitoring.stopTrace('form_submission');
                }
            }, 100);
        });

        // Track scroll depth
        let maxScroll = 0;
        let scrollTimer;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    if (scrollPercent >= 25 && scrollPercent < 50) {
                        window.SirsiMonitoring.logUserAction('scroll_depth', 'engagement', '25%');
                    } else if (scrollPercent >= 50 && scrollPercent < 75) {
                        window.SirsiMonitoring.logUserAction('scroll_depth', 'engagement', '50%');
                    } else if (scrollPercent >= 75 && scrollPercent < 100) {
                        window.SirsiMonitoring.logUserAction('scroll_depth', 'engagement', '75%');
                    } else if (scrollPercent === 100) {
                        window.SirsiMonitoring.logUserAction('scroll_depth', 'engagement', '100%');
                    }
                }
            }, 500);
        });

        // Track time on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            window.SirsiMonitoring.logEvent('time_on_page', {
                duration_seconds: timeOnPage,
                page: window.location.pathname
            });
        });

        // Set user properties if user is authenticated
        if (window.firebase && window.firebase.auth) {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    window.SirsiMonitoring.setUserId(user.uid);
                    window.SirsiMonitoring.setUserProperties({
                        email: user.email,
                        provider: user.providerData[0]?.providerId || 'email',
                        created_at: user.metadata.creationTime
                    });
                }
            });
        }

        // Track search functionality if present
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i]');
        searchInputs.forEach(input => {
            let searchTimer;
            input.addEventListener('input', function() {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    if (input.value.length > 2) {
                        window.SirsiMonitoring.trackSearch(input.value);
                    }
                }, 1000);
            });
        });

        // Monitor AJAX calls for specific events
        if (window.XMLHttpRequest) {
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                this.addEventListener('load', function() {
                    // Track API calls
                    if (url.includes('/api/') || url.includes('firestore')) {
                        window.SirsiMonitoring.logEvent('api_call', {
                            method: method,
                            endpoint: url,
                            status: this.status
                        });
                    }
                });
                originalOpen.apply(this, arguments);
            };
        }
    }

    // Initialize monitoring when Firebase is ready
    waitForFirebase(loadMonitoring);

    // Also ensure monitoring loads after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadMonitoring);
    } else {
        loadMonitoring();
    }
})();
