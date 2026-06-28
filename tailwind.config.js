/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        reddit: {
          orange: '#ff4500',
          dark: '#1a1a1b',
          darker: '#030303',
          light: '#dae0e6',
          gray: '#878a8c',
          card: '#ffffff',
          cardDark: '#1a1a1b',
          border: '#ccc',
          borderDark: '#343536',
          hover: '#f6f7f8',
          hoverDark: '#272729'
        }
      }
    },
  },
  plugins: [],
}
