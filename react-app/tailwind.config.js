/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tindo-orange': '#FF6B35',
        'tindo-yellow': '#FFB627',
        'tindo-red': '#D32F2F',
        'tindo-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}


