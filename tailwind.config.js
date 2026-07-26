/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F5',
        ink: '#2B2420',
        accent: '#B0431E',
        accentSoft: '#F2D9C7',
        good: '#3F6B4A',
        warn: '#C98A1A',
      },
    },
  },
  plugins: [],
};
