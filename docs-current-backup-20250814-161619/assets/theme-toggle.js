// SirsiNexus - Standardized Theme Toggle Functionality

// Theme initialization and toggle functions
(function() {
    'use strict';
    
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Update any theme-dependent elements
        updateThemeElements(theme);
    }
    
    // Toggle theme function
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateThemeElements('light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeElements('dark');
        }
    }
    
    // Update theme-dependent elements
    function updateThemeElements(theme) {
        // Update theme toggle button icon if it exists
        const themeToggleBtn = document.querySelector('.theme-toggle');
        if (themeToggleBtn) {
            const iconSvg = themeToggleBtn.querySelector('svg');
            if (iconSvg) {
                if (theme === 'dark') {
                    // Moon icon for dark mode
                    iconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
                } else {
                    // Sun icon for light mode
                    iconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
                }
            }
        }
        
        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    }
    
    // Make functions globally available
    window.toggleTheme = toggleTheme;
    window.initTheme = initTheme;
    
    // Initialize theme immediately (before DOMContentLoaded)
    initTheme();
    
    // Also initialize after DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        
        // Add click handler to theme toggle button
        const themeToggleBtn = document.querySelector('.theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            initTheme();
        }
    });
    
})();
