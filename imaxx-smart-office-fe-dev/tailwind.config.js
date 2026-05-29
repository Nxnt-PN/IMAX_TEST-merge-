/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // align กับ host Bootstrap --primary: #0061A8
        primary: {
          DEFAULT: '#0061A8',
          50:  '#e6f0f8',
          100: '#cce1f0',
          700: '#004d87',
          950: '#001f3f',
        },
        success: {
          DEFAULT: '#16a34a',
          hover: '#15803d',
        },
        danger: {
          DEFAULT: '#dc2626',
          50:  '#fef2f2',
          400: '#f87171',
          600: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}

