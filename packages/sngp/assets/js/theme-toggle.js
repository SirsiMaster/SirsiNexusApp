// Theme Toggle Functionality
(function() {
  function getInitialColorMode() {
    const persistedColorPreference = window.localStorage.getItem('theme');
    if (persistedColorPreference) {
      return persistedColorPreference;
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      return 'dark';
    }
    return 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }

  // Initialize theme on page load
  const colorMode = getInitialColorMode();
  setTheme(colorMode);

  // Theme toggle function
  window.toggleTheme = function() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // Re-initialize theme when DOM is loaded (for safety)
  document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  });
})();
