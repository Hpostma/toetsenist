/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'han-red': '#E50056',
        'han-black': '#141414',
        'han-gray': '#F1F1F1',
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'sans-serif'],
        condensed: ['"Avenir Next Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 