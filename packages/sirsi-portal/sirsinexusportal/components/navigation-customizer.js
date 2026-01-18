/**
 * Utility functions for customizing the universal navigation with page-specific elements
 */

class NavigationCustomizer {
    constructor() {
        this.customElements = document.getElementById('custom-nav-elements');
    }

    /**
     * Add the committee dropdown menu
     */
    addCommitteeMenu(activePage = '') {
        if (!this.customElements) return;
        
        const pages = [
            { id: 'dashboard', title: 'Committee Dashboard', path: '/investor-portal/committee/index.html' },
            { id: 'market', title: 'Market Analysis', path: '/investor-portal/committee/market-analysis.html' },
            { id: 'roadmap', title: 'Product Roadmap', path: '/investor-portal/committee/product-roadmap.html' },
            { id: 'sales', title: 'Sales Strategy', path: '/investor-portal/committee/sales-strategy.html' },
            { id: 'metrics', title: 'KPI & Metrics', path: '/investor-portal/committee/kpi-metrics.html' },
            { id: 'gtm', title: 'Go-to-Market', path: '/investor-portal/committee/go-to-market.html' }
        ];

        const dropdown = document.createElement('div');
        dropdown.className = 'relative group';
        dropdown.innerHTML = `
            <button class="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1">
                Committee
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div class="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div class="py-2">
                    ${pages.map(page => {
                        if (page.id === activePage) {
                            return `<span class="block px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20">${page.title}</span>`;
                        }
                        return `<a href="${page.path}" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">${page.title}</a>`;
                    }).join('\n')}
                </div>
            </div>
        `;

        this.customElements.appendChild(dropdown);
    }

    /**
     * Add custom action buttons
     */
    addActionButtons(buttons) {
        if (!this.customElements) return;
        
        const container = document.createElement('div');
        container.className = 'flex items-center gap-2';
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = button.className || 'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + 
                          'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';
            btn.onclick = button.onClick;
            btn.innerHTML = button.label;
            container.appendChild(btn);
        });
        
        this.customElements.appendChild(container);
    }

    /**
     * Add any custom HTML element
     */
    addCustomElement(html) {
        if (!this.customElements) return;
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        this.customElements.appendChild(wrapper.firstChild);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navCustomizer = new NavigationCustomizer();
});
