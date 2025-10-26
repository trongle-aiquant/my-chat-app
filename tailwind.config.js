/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./imports/ui/**/*.{js,jsx,ts,tsx}",  // React components
    "./client/*.html",                     // HTML files (nếu có)
    "./imports/**/*.{js,jsx,ts,tsx}",     // Tất cả JS/TS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}