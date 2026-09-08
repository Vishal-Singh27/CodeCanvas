/** @type {import('tailwindcss').Config} */
export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0E1117',
          800: '#161B22',
          700: '#21262D',
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
