/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Royal Neo-Deco Color Palette
        'royal': {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#050b14', // Deep background
        },
        'gold': {
          DEFAULT: '#C8A951',
          50: '#faf8f1',
          100: '#f5f0df',
          200: '#ebe0bd',
          300: '#dece96',
          400: '#d4bf73',
          500: '#C8A951', // Primary gold
          600: '#b8953d',
          700: '#9a7a33',
          800: '#7d622e',
          900: '#655028',
        },
        'emerald': {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.15)',
        },
        // Semantic colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#93c5fd',
      },
      fontFamily: {
        'serif': ['Cinzel', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0a1628 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37, #C8A951)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(200, 169, 81, 0.4)',
        'gold-hover': '0 0 40px rgba(200, 169, 81, 0.8)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'neo': '0 0 30px rgba(200, 169, 81, 0.05)',
      },
      borderRadius: {
        'neo': '12px',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 169, 81, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 169, 81, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
