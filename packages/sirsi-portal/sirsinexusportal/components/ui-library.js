/**
 * SirsiNexus Toast Notification System
 * Features:
 * - Success, warning, error, and info toast types
 * - Auto-dismiss with configurable duration
 * - Stack multiple notifications
 * - Click-to-dismiss functionality
 * - Smooth slide-in animations
 * - Position options (top-right default)
 * - Queue management for multiple toasts
 */
class SirsiToastNotification {
    constructor(options = {}) {
        this.queue = [];
        this.maxVisible = options.maxVisible || 5;
        this.position = options.position || 'top-right';
        this.defaultDuration = options.defaultDuration || 5000;
        this.init();
    }

    init() {
        this.createContainer();
        this.injectStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `sirsi-toast-container sirsi-toast-${this.position}`;
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(this.container);
    }

    injectStyles() {
        const styles = `
            .sirsi-toast-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-width: 400px;
                width: 100%;
                padding: 16px;
            }

            .sirsi-toast-top-right {
                top: 0;
                right: 0;
            }

            .sirsi-toast-top-left {
                top: 0;
                left: 0;
            }

            .sirsi-toast-bottom-right {
                bottom: 0;
                right: 0;
            }

            .sirsi-toast-bottom-left {
                bottom: 0;
                left: 0;
            }

            .sirsi-toast-top-center {
                top: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .sirsi-toast-bottom-center {
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .sirsi-toast {
                pointer-events: auto;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateX(100%);
                opacity: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                line-height: 1.4;
                max-width: 100%;
                word-wrap: break-word;
            }

            .sirsi-toast.sirsi-toast-show {
                transform: translateX(0);
                opacity: 1;
            }

            .sirsi-toast.sirsi-toast-hide {
                transform: translateX(100%);
                opacity: 0;
            }

            /* Toast type styles */
            .sirsi-toast-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #ffffff;
            }

            .sirsi-toast-error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: #ffffff;
            }

            .sirsi-toast-warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: #ffffff;
            }

            .sirsi-toast-info {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: #ffffff;
            }

            .sirsi-toast-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                margin-top: 1px;
            }

            .sirsi-toast-content {
                flex: 1;
                min-width: 0;
            }

            .sirsi-toast-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .sirsi-toast-message {
                opacity: 0.9;
            }

            .sirsi-toast-close {
                flex-shrink: 0;
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
                transition: opacity 0.2s;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .sirsi-toast-close:hover {
                opacity: 1;
            }

            .sirsi-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 0 0 8px 8px;
                transition: width linear;
            }

            /* Dark mode support */
            .dark .sirsi-toast {
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            /* Animation for left positioned toasts */
            .sirsi-toast-top-left .sirsi-toast,
            .sirsi-toast-bottom-left .sirsi-toast {
                transform: translateX(-100%);
            }

            .sirsi-toast-top-left .sirsi-toast.sirsi-toast-show,
            .sirsi-toast-bottom-left .sirsi-toast.sirsi-toast-show {
                transform: translateX(0);
            }

            .sirsi-toast-top-left .sirsi-toast.sirsi-toast-hide,
            .sirsi-toast-bottom-left .sirsi-toast.sirsi-toast-hide {
                transform: translateX(-100%);
            }

            /* Animation for center positioned toasts */
            .sirsi-toast-top-center .sirsi-toast,
            .sirsi-toast-bottom-center .sirsi-toast {
                transform: translateY(-100%);
            }

            .sirsi-toast-top-center .sirsi-toast.sirsi-toast-show,
            .sirsi-toast-bottom-center .sirsi-toast.sirsi-toast-show {
                transform: translateY(0);
            }

            .sirsi-toast-top-center .sirsi-toast.sirsi-toast-hide,
            .sirsi-toast-bottom-center .sirsi-toast.sirsi-toast-hide {
                transform: translateY(-100%);
            }

            /* Responsive design */
            @media (max-width: 640px) {
                .sirsi-toast-container {
                    max-width: calc(100vw - 32px);
                    padding: 16px;
                }

                .sirsi-toast {
                    padding: 12px;
                    font-size: 13px;
                }
            }
        `;

        if (!document.querySelector('#sirsi-toast-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'sirsi-toast-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }

    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 20 20" fill="currentColor" class="sirsi-toast-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>`,
            error: `<svg viewBox="0 0 20 20" fill="currentColor" class="sirsi-toast-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>`,
            warning: `<svg viewBox="0 0 20 20" fill="currentColor" class="sirsi-toast-icon">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>`,
            info: `<svg viewBox="0 0 20 20" fill="currentColor" class="sirsi-toast-icon">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>`
        };
        return icons[type] || icons.info;
    }

    show(options) {
        // Handle both string and object parameters
        if (typeof options === 'string') {
            options = { message: options };
        }

        const {
            message,
            title,
            type = 'info',
            duration = this.defaultDuration,
            persistent = false,
            showProgress = true,
            onClick = null
        } = options;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `sirsi-toast sirsi-toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        // Build content
        let contentHTML = this.getIcon(type);
        contentHTML += '<div class="sirsi-toast-content">';
        if (title) {
            contentHTML += `<div class="sirsi-toast-title">${title}</div>`;
        }
        contentHTML += `<div class="sirsi-toast-message">${message}</div>`;
        contentHTML += '</div>';

        // Add close button
        contentHTML += `<button class="sirsi-toast-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>`;

        toast.innerHTML = contentHTML;

        // Add progress bar if enabled and not persistent
        if (showProgress && !persistent && duration > 0) {
            const progress = document.createElement('div');
            progress.className = 'sirsi-toast-progress';
            progress.style.width = '100%';
            toast.appendChild(progress);

            // Animate progress bar
            setTimeout(() => {
                progress.style.width = '0%';
                progress.style.transitionDuration = `${duration}ms`;
            }, 100);
        }

        // Add to queue
        this.queue.push({
            element: toast,
            timeout: null,
            duration,
            persistent,
            onClick
        });

        // Handle click events
        const closeBtn = toast.querySelector('.sirsi-toast-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismiss(toast);
        });

        toast.addEventListener('click', () => {
            if (onClick) {
                onClick();
            }
            this.dismiss(toast);
        });

        this.render();
        return toast;
    }

    dismiss(toastElement) {
        const toastData = this.queue.find(item => item.element === toastElement);
        if (!toastData) return;

        // Clear timeout
        if (toastData.timeout) {
            clearTimeout(toastData.timeout);
        }

        // Add hide animation
        toastElement.classList.remove('sirsi-toast-show');
        toastElement.classList.add('sirsi-toast-hide');

        // Remove after animation
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
            this.queue = this.queue.filter(item => item.element !== toastElement);
            this.render();
        }, 300);
    }

    render() {
        // Show only the most recent toasts up to maxVisible
        const visibleToasts = this.queue.slice(-this.maxVisible);
        
        // Clear container
        this.container.innerHTML = '';

        // Add visible toasts
        visibleToasts.forEach((toastData, index) => {
            this.container.appendChild(toastData.element);
            
            // Trigger show animation
            setTimeout(() => {
                toastData.element.classList.add('sirsi-toast-show');
            }, index * 100);

            // Set auto-dismiss timeout
            if (!toastData.persistent && toastData.duration > 0 && !toastData.timeout) {
                toastData.timeout = setTimeout(() => {
                    this.dismiss(toastData.element);
                }, toastData.duration);
            }
        });
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show({ ...options, message, type: 'success' });
    }

    error(message, options = {}) {
        return this.show({ ...options, message, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show({ ...options, message, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show({ ...options, message, type: 'info' });
    }

    clear() {
        this.queue.forEach(toastData => {
            if (toastData.timeout) {
                clearTimeout(toastData.timeout);
            }
            this.dismiss(toastData.element);
        });
    }

    setPosition(position) {
        this.position = position;
        this.container.className = `sirsi-toast-container sirsi-toast-${position}`;
    }
}

// Initialize the notification system
window.SirsiToast = new SirsiToastNotification();

// SirsiNexus UI Component Library
// Fix paths to be relative to root
const BASE_PATH = '';

class SirsiHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }

                .header {
                    background: var(--header-bg, #ffffff);
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(8px);
                }

                :host-context(.dark) .header {
                    background: rgba(31, 41, 55, 0.95);
                    border-color: #334155;
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .nav-content {
                    display: flex;
                    height: 4rem;
                    align-items: center;
                    justify-content: space-between;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .logo {
                    width: 3rem;
                    height: 3rem;
                    object-fit: contain;
                }

                .title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary, #1a1a1a);
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .nav-items {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                ::slotted(a) {
                    font-size: 0.875rem;
                    color: var(--text-secondary, #64748b);
                    text-decoration: none;
                    transition: color 0.2s;
                }

                ::slotted(a:hover) {
                    color: var(--text-primary, #1a1a1a);
                }

                :host-context(.dark) ::slotted(a) {
                    color: #94a3b8;
                }

                :host-context(.dark) ::slotted(a:hover) {
                    color: #f1f5f9;
                }

                .theme-toggle {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    color: var(--text-secondary, #64748b);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .theme-toggle:hover {
                    color: var(--text-primary, #1a1a1a);
                    background: var(--hover-bg, #f1f5f9);
                }

                :host-context(.dark) .theme-toggle:hover {
                    color: #f1f5f9;
                    background: #334155;
                }

                .version-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    background: var(--badge-bg, #f1f5f9);
                    border-radius: 0.25rem;
                    color: var(--text-secondary, #64748b);
                }

                :host-context(.dark) .version-badge {
                    background: #334155;
                    color: #94a3b8;
                }
            </style>

            <header class="header">
                <div class="container">
                    <nav class="nav-content">
                        <div class="logo-section">
<img src="/assets/images/Sirsi_Logo_300ppi_cguiyg.png" alt="Sirsi Logo" class="logo light-logo">
                            <img src="/assets/images/Sirsi_Logo_300ppi_Inverted_lt7asx.png" alt="Sirsi Logo" class="logo dark-logo" style="display: none;">
                            <div>
                                <h1 class="title">SirsiNexus</h1>
                                <span class="version-badge">v0.5.0-alpha</span>
                            </div>
                        </div>
                        <div class="nav-items">
                            <slot name="nav-items"></slot>
                            <button class="theme-toggle" onclick="window.toggleTheme()">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </nav>
                </div>
            </header>
        `;

        // Handle theme
        const darkLogo = this.shadowRoot.querySelector('.dark-logo');
        const lightLogo = this.shadowRoot.querySelector('.light-logo');
        
        const updateLogos = () => {
            const isDark = document.documentElement.classList.contains('dark');
            darkLogo.style.display = isDark ? 'block' : 'none';
            lightLogo.style.display = isDark ? 'none' : 'block';
        };

        // Initial update
        updateLogos();

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateLogos();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true
        });
    }
}

class SirsiFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }

                .footer {
                    background: var(--footer-bg, #1a1a1a);
                    color: #ffffff;
                    padding: 3rem 0;
                    margin-top: 4rem;
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }

                .copyright {
                    text-align: center;
                    padding-top: 2rem;
                    margin-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-size: 0.875rem;
                }

                ::slotted(*) {
                    color: #ffffff;
                }
            </style>

            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <slot name="footer-content"></slot>
                    </div>
                    <div class="copyright">
                        © ${new Date().getFullYear()} SirsiNexus. All rights reserved.
                    </div>
                </div>
            </footer>
        `;
    }
}

class SirsiMetric extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'label'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const value = this.getAttribute('value');
        const label = this.getAttribute('label');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .metric {
                    background: var(--metric-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.3s;
                }

                :host-context(.dark) .metric {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .metric:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
                }

                :host-context(.dark) .metric:hover {
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }

                .value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--value-color, #16a34a);
                    margin-bottom: 0.5rem;
                }

                :host-context(.dark) .value {
                    color: #22c55e;
                }

                .label {
                    font-size: 0.875rem;
                    color: var(--label-color, #64748b);
                    font-weight: 500;
                }

                :host-context(.dark) .label {
                    color: #94a3b8;
                }
            </style>

            <div class="metric">
                <div class="value">${value}</div>
                <div class="label">${label}</div>
            </div>
        `;
    }
}

class SirsiChart extends HTMLElement {
    static get observedAttributes() {
        return ['title'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .chart-container {
                    background: var(--chart-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }

                :host-context(.dark) .chart-container {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--title-color, #1a1a1a);
                    margin-bottom: 1rem;
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .chart-content {
                    position: relative;
                    height: 400px;
                }
            </style>

            <div class="chart-container">
                <div class="title">${title}</div>
                <div class="chart-content">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

class SirsiFeature extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'description', 'icon'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title');
        const description = this.getAttribute('description');
        const icon = this.getAttribute('icon');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .feature {
                    background: var(--feature-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }

                :host-context(.dark) .feature {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .feature:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
                }

                :host-context(.dark) .feature:hover {
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }

                .icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--title-color, #1a1a1a);
                    margin-bottom: 0.5rem;
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .description {
                    font-size: 0.875rem;
                    color: var(--description-color, #64748b);
                    line-height: 1.5;
                }

                :host-context(.dark) .description {
                    color: #94a3b8;
                }
            </style>

            <div class="feature">
                <div class="icon">${icon}</div>
                <div class="title">${title}</div>
                <div class="description">${description}</div>
            </div>
        `;
    }
}

/**
 * SirsiNexus UI Component Library
 * Provides consistent styling and components across all pages
 */

class UILibrary {
    constructor() {
        this.version = 'v0.5.0-alpha';
        this.init();
    }

    init() {
        this.injectStyles();
        this.setupComponents();
    }

    injectStyles() {
        const styles = `
            /* Professional Enterprise Styling */
            .sirsi-container {
                @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
            }

            .sirsi-card {
                @apply bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700;
            }

            .sirsi-stat {
                @apply flex flex-col p-4 bg-slate-50 dark:bg-slate-700 rounded-lg;
            }

            .sirsi-stat-value {
                @apply text-2xl font-bold text-primary-600 dark:text-primary-400;
            }

            .sirsi-stat-label {
                @apply text-sm text-slate-600 dark:text-slate-400;
            }

            .sirsi-grid {
                @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
            }

            .sirsi-section {
                @apply py-12;
            }

            .sirsi-heading-1 {
                @apply text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white;
            }

            .sirsi-heading-2 {
                @apply text-2xl md:text-3xl font-bold text-slate-900 dark:text-white;
            }

            .sirsi-text {
                @apply text-slate-600 dark:text-slate-400 leading-relaxed;
            }

            .sirsi-button {
                @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors;
            }

            .sirsi-button-primary {
                @apply sirsi-button bg-primary-600 text-white hover:bg-primary-700;
            }

            .sirsi-button-secondary {
                @apply sirsi-button bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600;
            }

            /* Chart Containers */
            .sirsi-chart-container {
                @apply sirsi-card overflow-hidden;
                min-height: 300px;
            }

            /* Feature List */
            .sirsi-feature-list {
                @apply space-y-4;
            }

            .sirsi-feature-item {
                @apply flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700;
            }

            .sirsi-feature-icon {
                @apply w-8 h-8 text-primary-600 dark:text-primary-400;
            }

            /* Timeline */
            .sirsi-timeline {
                @apply relative pl-8 space-y-8 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-200 dark:before:bg-primary-800;
            }

            .sirsi-timeline-item {
                @apply relative;
            }

            .sirsi-timeline-dot {
                @apply absolute -left-10 w-4 h-4 rounded-full bg-primary-600;
            }

            /* Table */
            .sirsi-table {
                @apply w-full text-left;
            }

            .sirsi-table th {
                @apply px-4 py-2 bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white;
            }

            .sirsi-table td {
                @apply px-4 py-2 border-t border-slate-200 dark:border-slate-700;
            }

            /* Metric Grid */
            .sirsi-metric-grid {
                @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
            }

            .sirsi-metric-card {
                @apply sirsi-card flex flex-col items-center text-center;
            }

            .sirsi-metric-value {
                @apply text-3xl font-bold text-primary-600 dark:text-primary-400;
            }

            .sirsi-metric-label {
                @apply text-sm text-slate-600 dark:text-slate-400 mt-1;
            }

            /* Alert/Callout */
            .sirsi-alert {
                @apply p-4 rounded-lg border;
            }

            .sirsi-alert-info {
                @apply sirsi-alert bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200;
            }

            .sirsi-alert-success {
                @apply sirsi-alert bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200;
            }

            /* Navigation */
            .sirsi-nav {
                @apply flex items-center space-x-4;
            }

            .sirsi-nav-item {
                @apply text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors;
            }

            /* Version Badge */
            .sirsi-version-badge {
                @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupComponents() {
        // Register custom elements
if (!customElements.get('sirsi-header')) customElements.define('sirsi-header', SirsiHeader);
        if (!customElements.get('sirsi-footer')) customElements.define('sirsi-footer', SirsiFooter);
        if (!customElements.get('sirsi-metric')) customElements.define('sirsi-metric', SirsiMetric);
        if (!customElements.get('sirsi-feature')) customElements.define('sirsi-feature', SirsiFeature);
        if (!customElements.get('sirsi-chart')) customElements.define('sirsi-chart', SirsiChart);
    }

    createHeader() {
        return class extends HTMLElement {
            connectedCallback() {
                this.innerHTML = `
                    <header class="bg-white dark:bg-gray-800/95 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
                        <div class="sirsi-container">
                            <div class="flex h-16 items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <img src="/assets/images/logo.svg" alt="SirsiNexus" class="h-8 w-auto">
                                    <div>
                                        <h1 class="text-lg font-semibold">SirsiNexus</h1>
                                        <div class="flex items-center gap-2">
                                            <span class="sirsi-version-badge">${this.version}</span>
                                        </div>
                                    </div>
                                </div>
                                <nav class="sirsi-nav">
                                    <slot name="nav-items"></slot>
                                </nav>
                            </div>
                        </div>
                    </header>
                `;
            }
        }
    }

    createFooter() {
        return class extends HTMLElement {
            connectedCallback() {
                this.innerHTML = `
                    <footer class="bg-slate-900 text-white py-12">
                        <div class="sirsi-container">
                            <div class="grid md:grid-cols-3 gap-8">
                                <div>
                                    <h3 class="text-lg font-semibold mb-4">SirsiNexus</h3>
                                    <p class="text-slate-400">AI-Powered Cloud Infrastructure</p>
                                </div>
                                <div>
                                    <slot name="footer-content"></slot>
                                </div>
                                <div class="text-sm text-slate-400">
                                    © 2025 Sirsi Technologies Inc. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            }
        }
    }

    createMetric() {
        return class extends HTMLElement {
            connectedCallback() {
                const value = this.getAttribute('value');
                const label = this.getAttribute('label');
                
                this.innerHTML = `
                    <div class="sirsi-metric-card">
                        <div class="sirsi-metric-value">${value}</div>
                        <div class="sirsi-metric-label">${label}</div>
                    </div>
                `;
            }
        }
    }

    createFeature() {
        return class extends HTMLElement {
            connectedCallback() {
                const title = this.getAttribute('title');
                const description = this.getAttribute('description');
                const icon = this.getAttribute('icon');

                this.innerHTML = `
                    <div class="sirsi-feature-item">
                        <div class="sirsi-feature-icon">${icon}</div>
                        <div>
                            <h3 class="font-semibold mb-1">${title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${description}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    createChart() {
        return class extends HTMLElement {
            connectedCallback() {
                const title = this.getAttribute('title');
                
                this.innerHTML = `
                    <div class="sirsi-chart-container">
                        <h3 class="font-semibold mb-4">${title}</h3>
                        <div class="w-full h-full">
                            <slot></slot>
                        </div>
                    </div>
                `;
            }
        }
    }
}

// Initialize library
window.SirsiUI = new UILibrary();
