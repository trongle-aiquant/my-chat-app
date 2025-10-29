/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable dark mode with class strategy
  // Sử dụng class 'dark' trên root element để toggle dark mode
  darkMode: 'class',

  content: [
    './imports/ui/**/*.{js,jsx,ts,tsx}', // React components
    './client/*.html', // HTML files (nếu có)
    './imports/**/*.{js,jsx,ts,tsx}', // Tất cả JS/TS files
    './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Flowbite React components
  ],

  theme: {
    extend: {
      // Custom colors cho dark mode (optional - có thể extend thêm)
      colors: {
        // Dark mode background colors
        dark: {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          hover: '#334155', // slate-700
        },
      },
      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },

  plugins: [
    require('flowbite/plugin'), // Flowbite plugin for component styles
  ],
};
