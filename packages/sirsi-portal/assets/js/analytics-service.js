/**
 * Google Analytics 4 Service
 * Handles all analytics tracking and custom events
 * @version 1.0.0
 */

class AnalyticsService {
    constructor() {
        // Replace with your actual GA4 Measurement ID
        this.measurementId = 'G-XXXXXXXXXX'; // Replace this
        this.initialized = false;
        this.debugMode = window.location.hostname === 'localhost';
        this.userId = null;
        this.userProperties = {};
        
        // Custom event queue for offline/delayed tracking
        this.eventQueue = [];
        this.maxQueueSize = 100;
        
        // Conversion events
        this.conversionEvents = [
            'sign_up',
            'purchase',
            'subscription_started',
            'project_created',
            'api_key_generated'
        ];
    }

    /**
     * Initialize Google Analytics
     */
    async init() {
        if (this.initialized) return;

        try {
            // Load Google Analytics script
            await this.loadGoogleAnalytics();
            
            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { 
                window.dataLayer.push(arguments); 
            };
            
            // Configure GA4
            gtag('js', new Date());
            gtag('config', this.measurementId, {
                'debug_mode': this.debugMode,
                'send_page_view': false, // We'll send manually for better control
                'cookie_flags': 'SameSite=None;Secure'
            });

            // Set up user properties if user is authenticated
            if (window.authService && window.authService.isAuthenticated()) {
                await this.identifyUser();
            }

            // Send initial page view
            this.trackPageView();

            // Process any queued events
            this.processEventQueue();

            // Set up automatic tracking
            this.setupAutomaticTracking();

            this.initialized = true;
            console.log('Analytics service initialized');
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    /**
     * Load Google Analytics script
     */
    async loadGoogleAnalytics() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.gtag) {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
            script.onload = resolve;
            script.onerror = reject;
            
            // Add to document
            document.head.appendChild(script);
        });
    }

    /**
     * Identify user for analytics
     */
    async identifyUser() {
        if (!window.authService || !window.authService.isAuthenticated()) return;

        const user = window.authService.getCurrentUser();
        const profile = window.authService.getUserProfile();

        if (user) {
            this.userId = user.uid;
            
            // Set user ID
            gtag('config', this.measurementId, {
                'user_id': this.userId
            });

            // Set user properties
            this.setUserProperties({
                'user_type': profile?.role || 'user',
                'subscription_plan': profile?.subscription?.plan || 'free',
                'account_created': profile?.createdAt || new Date().toISOString(),
                'email_verified': user.emailVerified || false,
                'provider': user.providerData?.[0]?.providerId || 'email'
            });
        }
    }

    /**
     * Set user properties
     */
    setUserProperties(properties) {
        this.userProperties = { ...this.userProperties, ...properties };
        
        if (window.gtag) {
            gtag('set', 'user_properties', this.userProperties);
        }
    }

    /**
     * Track page view
     */
    trackPageView(pagePath = null, pageTitle = null) {
        if (!window.gtag) {
            this.queueEvent('page_view', { page_path: pagePath, page_title: pageTitle });
            return;
        }

        const eventData = {
            page_path: pagePath || window.location.pathname,
            page_title: pageTitle || document.title,
            page_location: window.location.href,
            page_referrer: document.referrer
        };

        gtag('event', 'page_view', eventData);
        
        if (this.debugMode) {
            console.log('Page view tracked:', eventData);
        }
    }

    /**
     * Track custom event
     */
    trackEvent(eventName, parameters = {}) {
        if (!window.gtag) {
            this.queueEvent(eventName, parameters);
            return;
        }

        // Add common parameters
        const eventData = {
            ...parameters,
            'user_id': this.userId,
            'session_id': this.getSessionId(),
            'timestamp': new Date().toISOString()
        };

        // Track in GA4
        gtag('event', eventName, eventData);

        // Also track in Firebase Analytics if available
        if (window.firebase && window.firebase.analytics) {
            window.firebase.analytics().logEvent(eventName, eventData);
        }

        // Log conversion events
        if (this.conversionEvents.includes(eventName)) {
            this.trackConversion(eventName, eventData);
        }

        if (this.debugMode) {
            console.log(`Event tracked: ${eventName}`, eventData);
        }
    }

    /**
     * Track conversion event
     */
    trackConversion(conversionName, value = null) {
        const conversionData = {
            'send_to': `${this.measurementId}/conversion/${conversionName}`,
            'value': value?.amount || 0,
            'currency': value?.currency || 'USD'
        };

        gtag('event', 'conversion', conversionData);
        
        if (this.debugMode) {
            console.log('Conversion tracked:', conversionName, conversionData);
        }
    }

    /**
     * Track user actions
     */
    trackUserAction(action, category, label = null, value = null) {
        this.trackEvent('user_action', {
            'action': action,
            'category': category,
            'label': label,
            'value': value
        });
    }

    /**
     * Track errors
     */
    trackError(error, fatal = false) {
        this.trackEvent('exception', {
            'description': error.message || error,
            'fatal': fatal,
            'error_code': error.code,
            'error_stack': error.stack
        });
    }

    /**
     * Track timing
     */
    trackTiming(category, variable, time, label = null) {
        this.trackEvent('timing_complete', {
            'name': variable,
            'value': time,
            'event_category': category,
            'event_label': label
        });
    }

    /**
     * Track search
     */
    trackSearch(searchTerm, searchCategory = null, resultsCount = null) {
        this.trackEvent('search', {
            'search_term': searchTerm,
            'search_category': searchCategory,
            'results_count': resultsCount
        });
    }

    /**
     * Track social interaction
     */
    trackSocial(network, action, target) {
        this.trackEvent('social', {
            'social_network': network,
            'social_action': action,
            'social_target': target
        });
    }

    /**
     * Track e-commerce events
     */
    trackPurchase(transactionData) {
        this.trackEvent('purchase', {
            'transaction_id': transactionData.id,
            'value': transactionData.total,
            'currency': transactionData.currency || 'USD',
            'items': transactionData.items
        });
    }

    /**
     * Track sign up
     */
    trackSignUp(method) {
        this.trackEvent('sign_up', {
            'method': method
        });
    }

    /**
     * Track login
     */
    trackLogin(method) {
        this.trackEvent('login', {
            'method': method
        });
    }

    /**
     * Track subscription events
     */
    trackSubscription(action, plan, value = null) {
        this.trackEvent(`subscription_${action}`, {
            'plan': plan,
            'value': value,
            'currency': 'USD'
        });
    }

    /**
     * Track API usage
     */
    trackAPICall(endpoint, method, responseTime, statusCode) {
        this.trackEvent('api_call', {
            'endpoint': endpoint,
            'method': method,
            'response_time': responseTime,
            'status_code': statusCode,
            'success': statusCode >= 200 && statusCode < 300
        });
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName, action = 'used') {
        this.trackEvent('feature_usage', {
            'feature_name': featureName,
            'action': action
        });
    }

    /**
     * Track form interactions
     */
    trackForm(formName, action, fieldName = null) {
        this.trackEvent('form_interaction', {
            'form_name': formName,
            'action': action, // 'start', 'submit', 'error', 'abandon'
            'field_name': fieldName
        });
    }

    /**
     * Track video interactions
     */
    trackVideo(videoTitle, action, currentTime = null) {
        this.trackEvent('video_interaction', {
            'video_title': videoTitle,
            'action': action, // 'play', 'pause', 'complete', 'progress'
            'current_time': currentTime
        });
    }

    /**
     * Track download
     */
    trackDownload(fileName, fileType) {
        this.trackEvent('file_download', {
            'file_name': fileName,
            'file_type': fileType
        });
    }

    /**
     * Track outbound link
     */
    trackOutboundLink(url) {
        this.trackEvent('click', {
            'link_url': url,
            'link_domain': new URL(url).hostname,
            'link_classes': 'outbound',
            'outbound': true
        });
    }

    /**
     * Set up automatic tracking
     */
    setupAutomaticTracking() {
        // Track outbound links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes(window.location.hostname)) {
                this.trackOutboundLink(link.href);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const formName = form.id || form.name || 'unnamed_form';
                this.trackForm(formName, 'submit');
            }
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_visibility', { 'state': 'hidden' });
            } else {
                this.trackEvent('page_visibility', { 'state': 'visible' });
            }
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError(e.error || e.message, false);
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e.reason, false);
        });

        // Track scroll depth
        this.trackScrollDepth();

        // Track time on page
        this.trackTimeOnPage();
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const checkScrollDepth = () => {
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = window.scrollY;
            const scrollPercentage = Math.round((scrolled / scrollHeight) * 100);

            thresholds.forEach(threshold => {
                if (scrollPercentage >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    this.trackEvent('scroll', {
                        'percent_scrolled': threshold
                    });
                }
            });
        };

        // Throttle scroll events
        let scrollTimer;
        window.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(checkScrollDepth, 500);
        });
    }

    /**
     * Track time on page
     */
    trackTimeOnPage() {
        const startTime = Date.now();
        const pagePath = window.location.pathname;

        // Track time when user leaves
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            this.trackTiming('engagement', 'time_on_page', timeOnPage, pagePath);
        });

        // Also track at intervals
        const intervals = [10, 30, 60, 120, 300]; // seconds
        intervals.forEach(seconds => {
            setTimeout(() => {
                if (!document.hidden) {
                    this.trackEvent('engagement_time', {
                        'engagement_time_msec': seconds * 1000,
                        'page_path': pagePath
                    });
                }
            }, seconds * 1000);
        });
    }

    /**
     * Queue event for later processing
     */
    queueEvent(eventName, parameters) {
        if (this.eventQueue.length >= this.maxQueueSize) {
            this.eventQueue.shift(); // Remove oldest event
        }
        
        this.eventQueue.push({
            eventName,
            parameters,
            timestamp: Date.now()
        });
    }

    /**
     * Process queued events
     */
    processEventQueue() {
        if (!window.gtag || this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        events.forEach(({ eventName, parameters }) => {
            this.trackEvent(eventName, parameters);
        });
    }

    /**
     * Get or create session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        
        if (!sessionId) {
            sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        
        return sessionId;
    }

    /**
     * Get analytics data (for internal use)
     */
    async getAnalyticsData(startDate, endDate, metrics = ['users', 'sessions', 'pageviews']) {
        // This would typically call the Google Analytics Data API
        // For now, return mock data
        return {
            users: Math.floor(Math.random() * 10000),
            sessions: Math.floor(Math.random() * 20000),
            pageviews: Math.floor(Math.random() * 50000),
            avgSessionDuration: Math.floor(Math.random() * 300),
            bounceRate: Math.random() * 0.7,
            conversionRate: Math.random() * 0.1
        };
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('Analytics debug mode enabled');
    }

    /**
     * Disable tracking (for GDPR compliance)
     */
    disableTracking() {
        window['ga-disable-' + this.measurementId] = true;
        console.log('Analytics tracking disabled');
    }

    /**
     * Enable tracking
     */
    enableTracking() {
        window['ga-disable-' + this.measurementId] = false;
        console.log('Analytics tracking enabled');
    }
}

// Create global instance
window.analyticsService = new AnalyticsService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analyticsService.init().catch(console.error);
    });
} else {
    window.analyticsService.init().catch(console.error);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsService;
}
