/**
 * SirsiNexus Professional State Management Library
 * Features:
 * - Skeleton loaders for data tables
 * - Spinning indicators for actions
 * - Empty state illustrations
 * - Error boundary implementation
 * - Retry mechanisms
 * - Offline state detection
 * - Graceful degradation
 */

class SirsiStateManager {
    constructor(options = {}) {
        this.isOnline = navigator.onLine;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.loadingStates = new Map();
        this.errorBoundaries = new Map();
        this.offlineQueue = [];
        
        this.init();
    }

    init() {
        this.injectStyles();
        this.setupOfflineDetection();
        this.setupGlobalErrorHandler();
    }

    injectStyles() {
        const styles = `
            /* Loading States */
            .sirsi-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
                transition: all 0.3s ease;
            }

            .sirsi-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #3b82f6;
                animation: sirsi-spin 1s ease-in-out infinite;
            }

            .sirsi-loading-dots {
                display: flex;
                gap: 4px;
            }

            .sirsi-loading-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #3b82f6;
                animation: sirsi-pulse 1.4s ease-in-out infinite both;
            }

            .sirsi-loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .sirsi-loading-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes sirsi-spin {
                to { transform: rotate(360deg); }
            }

            @keyframes sirsi-pulse {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Skeleton Loaders */
            .sirsi-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: sirsi-skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }

            .dark .sirsi-skeleton {
                background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
                background-size: 200% 100%;
            }

            @keyframes sirsi-skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .sirsi-skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }

            .sirsi-skeleton-text:last-child {
                margin-bottom: 0;
                width: 60%;
            }

            .sirsi-skeleton-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
            }

            .sirsi-skeleton-button {
                height: 40px;
                width: 120px;
                border-radius: 6px;
            }

            /* Table Skeleton */
            .sirsi-skeleton-table {
                width: 100%;
                border-collapse: collapse;
            }

            .sirsi-skeleton-table th {
                height: 48px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }

            .dark .sirsi-skeleton-table th {
                background: #1e293b;
                border-color: #475569;
            }

            .sirsi-skeleton-table td {
                height: 64px;
                padding: 16px;
                border-bottom: 1px solid #e2e8f0;
                vertical-align: middle;
            }

            .dark .sirsi-skeleton-table td {
                border-color: #334155;
            }

            /* Empty States */
            .sirsi-empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 64px 32px;
                text-align: center;
                background: white;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                min-height: 400px;
            }

            .dark .sirsi-empty-state {
                background: rgba(30, 41, 59, 0.5);
                border-color: #475569;
            }

            .sirsi-empty-illustration {
                width: 120px;
                height: 120px;
                margin-bottom: 24px;
                opacity: 0.6;
            }

            .sirsi-empty-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .dark .sirsi-empty-title {
                color: #f3f4f6;
            }

            .sirsi-empty-description {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.5;
            }

            .dark .sirsi-empty-description {
                color: #9ca3af;
            }

            /* Error States */
            .sirsi-error-boundary {
                padding: 32px;
                text-align: center;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                margin: 16px;
            }

            .dark .sirsi-error-boundary {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.2);
            }

            .sirsi-error-icon {
                width: 64px;
                height: 64px;
                margin: 0 auto 16px;
                color: #ef4444;
            }

            .sirsi-error-title {
                font-size: 18px;
                font-weight: 600;
                color: #dc2626;
                margin-bottom: 8px;
            }

            .dark .sirsi-error-title {
                color: #f87171;
            }

            .sirsi-error-message {
                font-size: 14px;
                color: #7f1d1d;
                margin-bottom: 16px;
            }

            .dark .sirsi-error-message {
                color: #fca5a5;
            }

            /* Offline States */
            .sirsi-offline-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f59e0b;
                color: white;
                padding: 12px;
                text-align: center;
                z-index: 10000;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }

            .sirsi-offline-banner.show {
                transform: translateY(0);
            }

            .sirsi-offline-message {
                font-size: 14px;
                font-weight: 500;
            }

            /* Action States */
            .sirsi-btn-loading {
                position: relative;
                color: transparent !important;
                pointer-events: none;
            }

            .sirsi-btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid transparent;
                border-top-color: currentColor;
                border-radius: 50%;
                animation: sirsi-spin 1s linear infinite;
            }

            /* Retry Button */
            .sirsi-retry-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .sirsi-retry-btn:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }

            .sirsi-retry-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Progressive Enhancement */
            .sirsi-graceful-degradation {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
            }

            .dark .sirsi-graceful-degradation {
                background: rgba(245, 158, 11, 0.1);
                border-color: rgba(245, 158, 11, 0.2);
            }

            /* Responsive Design */
            @media (max-width: 640px) {
                .sirsi-empty-state {
                    padding: 40px 20px;
                    min-height: 300px;
                }

                .sirsi-empty-illustration {
                    width: 80px;
                    height: 80px;
                }

                .sirsi-error-boundary {
                    padding: 24px 16px;
                }
            }
        `;

        if (!document.querySelector('#sirsi-state-management-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'sirsi-state-management-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineBanner();
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineBanner();
        });

        // Check connection periodically
        setInterval(() => {
            this.checkConnection();
        }, 30000);
    }

    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    // Loading States
    showLoadingSpinner(container, type = 'spinner') {
        const loadingId = this.generateId();
        const overlay = document.createElement('div');
        overlay.className = 'sirsi-loading-overlay';
        overlay.id = loadingId;

        if (type === 'spinner') {
            overlay.innerHTML = `
                <div class="sirsi-loading-spinner"></div>
            `;
        } else if (type === 'dots') {
            overlay.innerHTML = `
                <div class="sirsi-loading-dots">
                    <div class="sirsi-loading-dot"></div>
                    <div class="sirsi-loading-dot"></div>
                    <div class="sirsi-loading-dot"></div>
                </div>
            `;
        }

        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
        }

        this.loadingStates.set(loadingId, { overlay, container });
        return loadingId;
    }

    hideLoadingSpinner(loadingId) {
        const state = this.loadingStates.get(loadingId);
        if (state && state.overlay) {
            state.overlay.style.opacity = '0';
            setTimeout(() => {
                if (state.overlay.parentNode) {
                    state.overlay.parentNode.removeChild(state.overlay);
                }
                this.loadingStates.delete(loadingId);
            }, 300);
        }
    }

    // Skeleton Loaders
    createTableSkeleton(container, rows = 5, columns = 6) {
        const skeleton = document.createElement('div');
        skeleton.innerHTML = `
            <table class="sirsi-skeleton-table">
                <thead>
                    <tr>
                        ${Array.from({length: columns}, () => 
                            '<th><div class="sirsi-skeleton sirsi-skeleton-text"></div></th>'
                        ).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: rows}, () => `
                        <tr>
                            ${Array.from({length: columns}, (_, i) => 
                                i === 0 
                                    ? '<td><div class="sirsi-skeleton sirsi-skeleton-avatar"></div></td>'
                                    : '<td><div class="sirsi-skeleton sirsi-skeleton-text"></div></td>'
                            ).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        if (container) {
            container.innerHTML = '';
            container.appendChild(skeleton);
        }
        
        return skeleton;
    }

    createCardSkeleton(container) {
        const skeleton = document.createElement('div');
        skeleton.className = 'p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700';
        skeleton.innerHTML = `
            <div class="flex items-center gap-4 mb-4">
                <div class="sirsi-skeleton sirsi-skeleton-avatar"></div>
                <div class="flex-1">
                    <div class="sirsi-skeleton sirsi-skeleton-text"></div>
                    <div class="sirsi-skeleton sirsi-skeleton-text"></div>
                </div>
            </div>
            <div class="space-y-2">
                <div class="sirsi-skeleton sirsi-skeleton-text"></div>
                <div class="sirsi-skeleton sirsi-skeleton-text"></div>
                <div class="sirsi-skeleton sirsi-skeleton-text"></div>
            </div>
            <div class="flex justify-between items-center mt-4">
                <div class="sirsi-skeleton sirsi-skeleton-button"></div>
                <div class="sirsi-skeleton sirsi-skeleton-text" style="width: 80px;"></div>
            </div>
        `;

        if (container) {
            container.appendChild(skeleton);
        }
        
        return skeleton;
    }

    // Empty States
    showEmptyState(container, options = {}) {
        const {
            title = 'No data available',
            description = 'There are no items to display at the moment.',
            illustration = this.getEmptyStateIllustration(options.type || 'default'),
            actionText = null,
            actionCallback = null
        } = options;

        const emptyState = document.createElement('div');
        emptyState.className = 'sirsi-empty-state';
        
        let actionButton = '';
        if (actionText && actionCallback) {
            actionButton = `
                <button class="sirsi-retry-btn" onclick="(${actionCallback})()">
                    ${actionText}
                </button>
            `;
        }

        emptyState.innerHTML = `
            <div class="sirsi-empty-illustration">
                ${illustration}
            </div>
            <h3 class="sirsi-empty-title">${title}</h3>
            <p class="sirsi-empty-description">${description}</p>
            ${actionButton}
        `;

        if (container) {
            container.innerHTML = '';
            container.appendChild(emptyState);
        }

        return emptyState;
    }

    getEmptyStateIllustration(type) {
        const illustrations = {
            default: `
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="50" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
                    <path d="M45 50h30v20H45z" fill="#9ca3af"/>
                    <circle cx="52" cy="57" r="3" fill="#6b7280"/>
                    <circle cx="68" cy="57" r="3" fill="#6b7280"/>
                    <path d="M52 75h16" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            users: `
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="45" cy="35" r="15" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
                    <circle cx="75" cy="35" r="15" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
                    <path d="M25 85c0-11 9-20 20-20s20 9 20 20v10H25V85z" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
                    <path d="M55 85c0-11 9-20 20-20s20 9 20 20v10H55V85z" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
                </svg>
            `,
            documents: `
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="20" width="60" height="80" rx="4" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
                    <path d="M40 35h40M40 45h40M40 55h30M40 65h35M40 75h25" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            search: `
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#d1d5db" stroke-width="3"/>
                    <path d="70 70l20 20" stroke="#d1d5db" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="15" fill="#f3f4f6"/>
                </svg>
            `
        };

        return illustrations[type] || illustrations.default;
    }

    // Error Boundaries
    createErrorBoundary(container, error, options = {}) {
        const {
            title = 'Something went wrong',
            message = 'An unexpected error occurred. Please try again.',
            showRetry = true,
            retryCallback = null
        } = options;

        const boundary = document.createElement('div');
        boundary.className = 'sirsi-error-boundary';
        
        const boundaryId = this.generateId();
        let retryButton = '';
        
        if (showRetry) {
            retryButton = `
                <button class="sirsi-retry-btn" onclick="window.SirsiState.retry('${boundaryId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M3 21v-5h5"/>
                    </svg>
                    Retry
                </button>
            `;
        }

        boundary.innerHTML = `
            <div class="sirsi-error-icon">
                <svg viewBox="0 0 64 64" fill="currentColor">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="4"/>
                    <path d="M32 16v16M32 40v4"/>
                </svg>
            </div>
            <h3 class="sirsi-error-title">${title}</h3>
            <p class="sirsi-error-message">${message}</p>
            ${retryButton}
        `;

        if (container) {
            container.innerHTML = '';
            container.appendChild(boundary);
        }

        this.errorBoundaries.set(boundaryId, {
            boundary,
            container,
            retryCallback: retryCallback || (() => window.location.reload())
        });

        return boundary;
    }

    retry(boundaryId) {
        const errorBoundary = this.errorBoundaries.get(boundaryId);
        if (errorBoundary && errorBoundary.retryCallback) {
            errorBoundary.retryCallback();
        }
    }

    // Button Loading States
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('sirsi-btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('sirsi-btn-loading');
            button.disabled = false;
        }
    }

    // Retry Mechanisms
    async withRetry(asyncFunction, options = {}) {
        const {
            retries = this.retryAttempts,
            delay = this.retryDelay,
            exponentialBackoff = true,
            onRetry = null
        } = options;

        let lastError;
        
        for (let i = 0; i <= retries; i++) {
            try {
                return await asyncFunction();
            } catch (error) {
                lastError = error;
                
                if (i === retries) {
                    throw lastError;
                }

                if (onRetry) {
                    onRetry(error, i + 1);
                }

                const waitTime = exponentialBackoff ? delay * Math.pow(2, i) : delay;
                await this.delay(waitTime);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Offline State Management
    showOfflineBanner() {
        let banner = document.getElementById('sirsi-offline-banner');
        
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'sirsi-offline-banner';
            banner.className = 'sirsi-offline-banner';
            banner.innerHTML = `
                <div class="sirsi-offline-message">
                    📡 You're currently offline. Some features may be limited.
                </div>
            `;
            document.body.appendChild(banner);
        }

        setTimeout(() => banner.classList.add('show'), 100);
    }

    hideOfflineBanner() {
        const banner = document.getElementById('sirsi-offline-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        }
    }

    async checkConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (!this.isOnline && response.ok) {
                this.isOnline = true;
                this.hideOfflineBanner();
                this.processOfflineQueue();
            }
        } catch (error) {
            if (this.isOnline) {
                this.isOnline = false;
                this.showOfflineBanner();
            }
        }
    }

    addToOfflineQueue(request) {
        this.offlineQueue.push(request);
        localStorage.setItem('sirsi-offline-queue', JSON.stringify(this.offlineQueue));
    }

    async processOfflineQueue() {
        const queue = [...this.offlineQueue];
        this.offlineQueue = [];
        
        for (const request of queue) {
            try {
                await fetch(request.url, request.options);
            } catch (error) {
                // Re-add failed requests to queue
                this.offlineQueue.push(request);
            }
        }

        localStorage.setItem('sirsi-offline-queue', JSON.stringify(this.offlineQueue));
    }

    // Graceful Degradation
    showGracefulDegradation(container, message, fallbackContent = null) {
        const degradation = document.createElement('div');
        degradation.className = 'sirsi-graceful-degradation';
        degradation.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <strong>Limited Functionality</strong>
            </div>
            <p style="margin: 0; font-size: 14px; color: #92400e;">${message}</p>
            ${fallbackContent ? `<div style="margin-top: 12px;">${fallbackContent}</div>` : ''}
        `;

        if (container) {
            container.insertBefore(degradation, container.firstChild);
        }

        return degradation;
    }

    // Global Error Handler
    handleGlobalError(error) {
        // Log error for debugging
        console.error('Global error:', error);

        // Show user-friendly notification
        if (window.SirsiToast) {
            window.SirsiToast.error('Something went wrong. Please refresh the page if issues persist.', {
                persistent: true,
                showProgress: false
            });
        }
    }

    // Utility Methods
    generateId() {
        return 'sirsi-' + Math.random().toString(36).substr(2, 9);
    }

    // API Wrapper with State Management
    async apiCall(url, options = {}) {
        const {
            showLoading = true,
            loadingContainer = null,
            retryOptions = {},
            onSuccess = null,
            onError = null
        } = options;

        let loadingId;
        if (showLoading) {
            loadingId = this.showLoadingSpinner(loadingContainer);
        }

        try {
            const result = await this.withRetry(async () => {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return await response.json();
            }, retryOptions);

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (error) {
            if (!this.isOnline) {
                this.addToOfflineQueue({ url, options });
            }

            if (onError) {
                onError(error);
            } else {
                throw error;
            }
        } finally {
            if (loadingId) {
                this.hideLoadingSpinner(loadingId);
            }
        }
    }
}

// Enhanced Data Table Component with State Management
class SirsiDataTable extends HTMLElement {
    static get observedAttributes() {
        return ['data-source', 'columns', 'loading', 'error'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.stateManager = window.SirsiState;
        this.data = [];
        this.loading = false;
        this.error = null;
    }

    connectedCallback() {
        this.render();
        this.loadData();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'loading') {
            this.loading = newValue === 'true';
            this.render();
        } else if (name === 'error') {
            this.error = newValue;
            this.render();
        }
    }

    async loadData() {
        const dataSource = this.getAttribute('data-source');
        if (!dataSource) return;

        this.loading = true;
        this.render();

        try {
            const response = await fetch(dataSource);
            if (!response.ok) throw new Error('Failed to load data');
            
            this.data = await response.json();
            this.loading = false;
            this.error = null;
        } catch (error) {
            this.loading = false;
            this.error = error.message;
        }

        this.render();
    }

    render() {
        const columns = JSON.parse(this.getAttribute('columns') || '[]');
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }

                .table-container {
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .table th {
                    background: #f8fafc;
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 1px solid #e2e8f0;
                }

                .table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .table tr:hover td {
                    background: #f8fafc;
                }
            </style>
            <div class="table-container">
                ${this.renderContent(columns)}
            </div>
        `;
    }

    renderContent(columns) {
        if (this.loading) {
            const skeleton = this.stateManager.createTableSkeleton(null, 5, columns.length);
            return skeleton.innerHTML;
        }

        if (this.error) {
            return `
                <div style="padding: 48px; text-align: center;">
                    <div style="color: #ef4444; margin-bottom: 16px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h3 style="margin-bottom: 8px; color: #374151;">Error loading data</h3>
                    <p style="color: #6b7280; margin-bottom: 16px;">${this.error}</p>
                    <button onclick="this.parentElement.parentElement.parentElement.host.loadData()" 
                            style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }

        if (this.data.length === 0) {
            return `
                <div style="padding: 48px; text-align: center; color: #6b7280;">
                    <div style="margin-bottom: 16px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                    </div>
                    <h3 style="margin-bottom: 8px;">No data available</h3>
                    <p>There are no records to display.</p>
                </div>
            `;
        }

        return `
            <table class="table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(row => `
                        <tr>
                            ${columns.map(col => `<td>${row[col.key] || '-'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Register custom elements
if (!customElements.get('sirsi-data-table')) {
    customElements.define('sirsi-data-table', SirsiDataTable);
}

// Initialize State Manager
window.SirsiState = new SirsiStateManager();

// Export utility functions for global use
window.SirsiStateUtils = {
    showLoading: (container, type) => window.SirsiState.showLoadingSpinner(container, type),
    hideLoading: (id) => window.SirsiState.hideLoadingSpinner(id),
    createTableSkeleton: (container, rows, columns) => window.SirsiState.createTableSkeleton(container, rows, columns),
    showEmptyState: (container, options) => window.SirsiState.showEmptyState(container, options),
    createErrorBoundary: (container, error, options) => window.SirsiState.createErrorBoundary(container, error, options),
    setButtonLoading: (button, loading) => window.SirsiState.setButtonLoading(button, loading),
    apiCall: (url, options) => window.SirsiState.apiCall(url, options),
    withRetry: (fn, options) => window.SirsiState.withRetry(fn, options)
};
