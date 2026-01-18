document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new AdminDashboard();

    // Functionality for live clock
    function updateClock() {
        const clockElement = document.querySelector('.clock');
        if (clockElement) {
            clockElement.textContent = new Date().toLocaleTimeString();
        }
    }
    setInterval(updateClock, 1000);

    // Theme toggle implementation
    const themeToggleButton = document.querySelector('[data-theme-toggle]');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            dashboard.updateChartsForTheme();
        });
    }

    // Functionality for navigation items
    const navigationItems = document.querySelectorAll('nav a');
    navigationItems.forEach(item => {
        item.addEventListener('click', (event) => {
            navigationItems.forEach(navItem => navItem.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'));
            event.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
        });
    });
});
