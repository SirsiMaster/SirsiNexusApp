/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './admin/*.html',
    './investor-portal/*.html',
    './assets/js/**/*.js',
    './components/**/*.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#0f1419',
        'dark-card': '#1a1f29',
        'dark-border': '#2a2f3a',
        'dark-text': '#e1e8ed',
        'dark-text-secondary': '#8b98a5',
      }
    }
  },
  plugins: [],
}
