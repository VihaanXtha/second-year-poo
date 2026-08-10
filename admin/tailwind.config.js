/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',
        'primary-dark': '#0f172a',
        'primary-light': '#38bdf8',
      },
    },
  },
  plugins: [],
};
