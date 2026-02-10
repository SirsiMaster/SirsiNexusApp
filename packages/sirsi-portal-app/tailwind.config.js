/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sirsi: {
          gold: '#C8A951',
          dark: '#05100a',
          emerald: '#10B981',
          forest: '#0a2a1b',
        }
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'sirsi-gradient': 'linear-gradient(to bottom right, #05100a, #0a1a11, #064e3b)',
      }
    },
  },
  plugins: [],
}
