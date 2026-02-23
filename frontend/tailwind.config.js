/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body:    ['"Manrope"', 'sans-serif'],
      },
      colors: {
        conf: {
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7c3aed',
        },
        dark: {
          950: '#09090b',
          900: '#0f0f14',
          800: '#16161d',
          700: '#1e1e28',
          600: '#27273a',
          500: '#36364f',
          400: '#6b6b8a',
          300: '#9898b0',
        }
      }
    }
  },
  plugins: []
}
