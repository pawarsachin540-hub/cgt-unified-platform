/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0f2742',
          800: '#16345a',
          700: '#1d4571',
        },
        steel: {
          50: '#f5f7fa',
          100: '#e9eef4',
          200: '#d4dde8',
          300: '#aebfd1',
          400: '#7e93ad',
          500: '#5a7090',
          600: '#46587280',
        },
        teal: {
          500: '#2a9d8f',
          600: '#21867a',
        },
        amber: { 500: '#e0922f' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
