/**
 * Style Consistency Enforcer for SirsiNexus
 * Ensures consistent styling across all pages
 */

class StyleConsistency {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enforce());
        } else {
            this.enforce();
        }
    }

    enforce() {
        this.enforceHeaders();
        this.enforceCards();
        this.enforceCharts();
        this.enforceResponsiveness();
        this.setupTheme();
    }

    enforceHeaders() {
        // Replace any existing headers with common-header component
        const existingHeader = document.querySelector('header:not(common-header)');
        if (existingHeader) {
            const commonHeader = document.createElement('common-header');
            commonHeader.setAttribute('page-title', document.title);
            existingHeader.replaceWith(commonHeader);
        }
    }

    enforceCards() {
        // Apply consistent card styling
        document.querySelectorAll('.card, .panel, .box').forEach(element => {
            element.classList.add('common-card');
        });
    }

    enforceCharts() {
        // Ensure chart containers are responsive
        document.querySelectorAll('.chart-container, [data-chart]').forEach(container => {
            container.classList.add('chart-container');
            
            // Ensure chart resizes with container
            const chart = container.querySelector('canvas, svg');
            if (chart) {
                const resizeObserver = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        const event = new CustomEvent('chart-resize', {
                            detail: {
                                width: entry.contentRect.width,
                                height: entry.contentRect.height
                            }
                        });
                        chart.dispatchEvent(event);
                    }
                });
                resizeObserver.observe(container);
            }
        });
    }

    enforceResponsiveness() {
        // Ensure KPI stats are responsive
        const kpiContainers = document.querySelectorAll('.kpi-container, .stats-container');
        kpiContainers.forEach(container => {
            if (!container.matches('kpi-stats')) {
                const kpiStats = document.createElement('kpi-stats');
                const stats = Array.from(container.children);
                stats.forEach(stat => kpiStats.appendChild(stat));
                container.replaceWith(kpiStats);
            }
        });

        // Ensure navigation is responsive
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.add('nav-menu');
            
            // Add mobile menu toggle
            const menuButton = document.createElement('button');
            menuButton.className = 'md:hidden p-2';
            menuButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
            `;
            menuButton.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
            });
            nav.parentElement.insertBefore(menuButton, nav);
        }
    }

    setupTheme() {
        // Setup theme based on user preference or system
        const theme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.classList.toggle('dark', e.matches);
            }
        });
    }
}

// Initialize style consistency
new StyleConsistency();
