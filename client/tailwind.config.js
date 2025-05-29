/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec4ff',
          400: '#59a4ff',
          500: '#3282ff',
          600: '#1b63f5',
          700: '#144ee1',
          800: '#1740b6',
          900: '#193a8f',
          950: '#142557',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.05)',
        lift: '0 6px 20px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};