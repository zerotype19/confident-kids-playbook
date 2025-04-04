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
          yellow: '#FACC15',      // Star color (used sparingly)
          green: '#065F46',       // Logo text color
          accent: '#10B981',      // Optional highlight use
          background: '#F9FDFB',  // Soft off-white for body
        },
        'accent-blue': '#3B82F6',
        'text-base': '#1F2937',
      },
      fontFamily: {
        sans: ['"Fredoka"', 'Nunito', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        kidoova: '0 6px 12px rgba(0, 0, 0, 0.1)',  // replaced green glow with neutral gray
        yellowSoft: '0 6px 12px rgba(0, 0, 0, 0.05)', // replaced yellow glow with subtle shadow
        card: '0 6px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
