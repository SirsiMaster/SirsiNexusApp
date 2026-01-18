// Shared theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }

    // Update navigation if it exists
    if (window.universalNav) {
        window.universalNav.renderNavigation();
    }
}

// Initialize theme
function initTheme() {
    const theme = localStorage.getItem('theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Make theme toggle available globally
window.toggleTheme = toggleTheme;

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
