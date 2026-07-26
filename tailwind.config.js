/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coal: '#1E1A16',
        paper: '#F6F1E7',
        ink: '#2B2420',
        brass: '#B8793A',
        'brass-soft': '#EDD9BC',
        sage: '#4C7A5D',
        'sage-soft': '#DCE8DD',
        rust: '#9C4A3C',
        'rust-soft': '#F0DAD3',
        bg: '#F6F1E7',
        accent: '#B8793A',
        accentSoft: '#EDD9BC',
        good: '#4C7A5D',
        warn: '#B8793A',
        mustard: '#B8793A',
        'mustard-soft': '#EDD9BC',
        brick: '#9C4A3C',
        'brick-soft': '#F0DAD3',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
