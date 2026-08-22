/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0c0403',
        panel: '#141014',
        'panel-2': '#1c161a',
        maroon: '#2a0a08',
        'maroon-2': '#3d0f0a',
        crimson: '#9c1c1c',
        gold: {
          pale: '#ffe9a8',
          DEFAULT: '#f0c44a',
          deep: '#b9861f'
        },
        cream: {
          DEFAULT: '#f6ecdc',
          dim: '#b8aa96'
        },
        felt: '#0e3d2d'
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Oswald"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        stub: 'inset 0 0 0 1px rgba(240,196,74,0.15)'
      }
    }
  },
  plugins: []
};
