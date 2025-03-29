/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kidoova: {
          yellow: '#FACC15',      // Star color
          green: '#065F46',       // Logo text color
          accent: '#10B981',      // Glowing highlight
          background: '#F9FDFB',  // Soft off-white for body
        },
        'accent-blue': '#3B82F6',
        'text-base': '#1F2937',
      },
      fontFamily: {
        sans: ['"Fredoka"', 'Nunito', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        kidoova: '0 4px 20px rgba(16, 185, 129, 0.2)',  // soft green glow
        yellowSoft: '0 4px 12px rgba(250, 204, 21, 0.3)', // soft yellow glow
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
} 