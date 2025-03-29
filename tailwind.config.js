/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust for your actual paths
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f6f7f9',
          default: '#f1f2f6',
          dark: '#e2e3e8',
        },
        accent: {
          blue: '#4a90e2',
          green: '#7ed6a3',
          yellow: '#f7ca77',
          red: '#e57373',
        },
        text: {
          base: '#333',
          muted: '#666',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
