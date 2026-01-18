/**
 * Unified Header Component for SirsiNexus Portal
 * Provides consistent header across all pages
 */

class UnifiedHeader {
    constructor() {
        this.headerHTML = `
            <header class="bg-white dark:bg-gray-800 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex h-16 items-center justify-between">
                        <!-- Logo and Brand -->
                        <div class="flex items-center">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 flex items-center justify-center">
                                    <img src="/assets/images/Sirsi_Logo_300ppi_cguiyg.png" alt="Sirsi Logo" class="w-12 h-12 object-contain dark:hidden">
                                    <img src="/assets/images/Sirsi_Logo_300ppi_Inverted_lt7asx.png" alt="Sirsi Logo" class="w-12 h-12 object-contain hidden dark:block">
                                </div>
                                <div>
                                    <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
                                        SirsiNexus
                                    </h1>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${this.getPageTitle()}</p>
                                </div>
                            </div>
                            <div class="ml-10 flex items-center space-x-1">
                                <span class="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full">Investor Portal</span>
                                <div class="flex items-center space-x-1 px-3 py-1 text-xs">
                                    <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span class="text-gray-600 dark:text-gray-300">Live</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Navigation and Actions -->
                        <nav class="flex items-center space-x-6">
                            <!-- Navigation Links -->
                            <a href="/index.html" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Home</a>
                            <a href="/investor-portal/index.html" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</a>
                            
                            <!-- Search (Desktop Only) -->
                            <div class="hidden lg:block">
                                <div class="relative">
                                    <input type="text" 
                                           id="unified-search" 
                                           placeholder="Search documents..." 
                                           class="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Theme Toggle -->
                            <button id="theme-toggle" 
                                    onclick="toggleTheme()" 
                                    class="p-2 rounded-md bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                    aria-label="Toggle theme">
                                <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 818 0z"></path>
                                </svg>
                                <svg class="w-5 h-5 text-gray-300 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                                </svg>
                            </button>
                            
                            <!-- Logout -->
                            <button onclick="logout()" 
                                    class="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    getPageTitle() {
        const path = window.location.pathname;
        if (path.includes('data-room')) return 'Data Room';
        if (path.includes('committee')) return 'Committee Documents';
        if (path.includes('kpi')) return 'KPI Metrics';
        return 'Investor Portal';
    }

    render(containerId = 'unified-header') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.headerHTML;
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('unified-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    handleSearch(query) {
        // Dispatch custom event that pages can listen to
        window.dispatchEvent(new CustomEvent('unifiedSearch', { 
            detail: { query: query.toLowerCase() } 
        }));
    }
}

// Global functions
window.toggleTheme = function() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
};

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('investorAuth');
        window.location.href = '/investor-login.html';
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
});

// Export for use
window.UnifiedHeader = UnifiedHeader;
