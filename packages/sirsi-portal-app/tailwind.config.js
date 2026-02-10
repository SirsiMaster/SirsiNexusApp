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
          navy: '#0f172a',
          emerald: '#10B981',
          royal: '#1e3a8a',
        }
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(to bottom right, #050a18, #0f172a, #1e3a8a)',
      }
    },
  },
  plugins: [],
}
