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
        try {
            // Only define components if they haven't been defined yet
            const components = [
                ['sirsi-header', this.createHeader()],
                ['sirsi-footer', this.createFooter()],
                ['sirsi-metric', this.createMetric()],
                ['sirsi-feature', this.createFeature()],
                ['sirsi-chart', this.createChart()]
            ];

            components.forEach(([name, component]) => {
                if (!customElements.get(name)) {
                    customElements.define(name, component);
                    console.log(`✅ Registered component: ${name}`);
                }
            });
        } catch (error) {
            console.error('❌ Error setting up components:', error);
        }
    }

    createHeader() {
        return class extends HTMLElement {
            static get observedAttributes() {
                return ['logo-path', 'version'];
            }

            constructor() {
                super();
                this.version = window.SirsiUI?.version || 'v0.5.0-alpha';
            }

            attributeChangedCallback(name, oldValue, newValue) {
                if (name === 'version' && newValue) {
                    this.version = newValue;
                    this.render();
                }
            }

            connectedCallback() {
                this.render();
            }

            render() {
                // Get logo path from attribute or use relative path as fallback
                const logoPath = this.getAttribute('logo-path') || '../assets/images/Sirsi_Logo_300ppi_cguiyg.png';
                const darkLogoPath = this.getAttribute('dark-logo-path') || '../assets/images/Sirsi_Logo_300ppi_Inverted_lt7asx.png';
                
                this.innerHTML = `
                    <header class="bg-white dark:bg-gray-800/95 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
                        <div class="sirsi-container">
                            <div class="flex h-16 items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 flex items-center justify-center">
                                        <img src="${logoPath}" alt="Sirsi Logo" class="w-12 h-12 object-contain dark:hidden">
                                        <img src="${darkLogoPath}" alt="Sirsi Logo" class="w-12 h-12 object-contain hidden dark:block">
                                    </div>
                                    <div>
                                        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">SirsiNexus</h1>
                                        <div class="flex items-center gap-2">
                                            <span class="version-badge text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded">${this.version}</span>
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
            static get observedAttributes() {
                return ['title', 'theme'];
            }

            constructor() {
                super();
                this.theme = 'light';
                this.observer = new MutationObserver(() => this.updateChartTheme());
            }

            connectedCallback() {
                this.render();
                
                // Observe theme changes
                this.observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['class']
                });

                // Set initial theme
                this.updateChartTheme();
            }

            disconnectedCallback() {
                this.observer.disconnect();
            }

            attributeChangedCallback(name, oldValue, newValue) {
                if (oldValue !== newValue) {
                    this.render();
                }
            }

            updateChartTheme() {
                const isDark = document.documentElement.classList.contains('dark');
                const chartElement = this.querySelector('canvas');
                if (chartElement && chartElement.chart) {
                    const chart = chartElement.chart;
                    chart.options.theme = isDark ? 'dark' : 'light';
                    chart.options.scales.x.grid.color = isDark ? '#334155' : '#e2e8f0';
                    chart.options.scales.y.grid.color = isDark ? '#334155' : '#e2e8f0';
                    chart.options.scales.x.ticks.color = isDark ? '#94a3b8' : '#64748b';
                    chart.options.scales.y.ticks.color = isDark ? '#94a3b8' : '#64748b';
                    chart.update();
                }
            }

            render() {
                const title = this.getAttribute('title');
                
                this.innerHTML = `
                    <div class="sirsi-chart-container dark:bg-slate-800">
                        <h3 class="font-semibold mb-4 text-slate-900 dark:text-slate-100">${title}</h3>
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
