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
        sage: '#3F6B4A',
        'sage-soft': '#E1EBE1',
        mustard: '#C97A1E',
        'mustard-soft': '#F4E1C4',
        brick: '#A63A2E',
        'brick-soft': '#F3DEDA',
      },
    },
  },
  plugins: [],
};
