const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable class-based dark mode
  darkMode: 'class',

  // Configure files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Extend the default theme
  theme: {
    extend: {
      fontFamily: {
        // Set 'Inter' as the default sans-serif font
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        // Add 'Poppins' as a 'display' font for headings or special text
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  // Add any plugins here
  plugins: [],
};
