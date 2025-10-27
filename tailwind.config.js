/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './imports/ui/**/*.{js,jsx,ts,tsx}', // React components
    './client/*.html', // HTML files (nếu có)
    './imports/**/*.{js,jsx,ts,tsx}', // Tất cả JS/TS files
    './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Flowbite React components
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'), // Flowbite plugin for component styles
  ],
};
