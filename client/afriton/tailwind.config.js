/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode with a class
  theme: {
    extend: {
      colors: {
        yellow: {
          50: '#fefce8',
          600: '#d97706',
        },
        gray: {
          200: '#e5e7eb',
          600: '#4b5563',
          900: '#111827',
        },
        black: '#000000',
      },
    },
  },
  plugins: [],
}