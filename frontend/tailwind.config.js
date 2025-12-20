/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          900: '#0f172a', // Dark Background
          800: '#1e293b', // Card Background
          700: '#334155', // Borders
        },
        brand: {
          blue: '#3b82f6', 
          accent: '#0ea5e9',
        },
        status: {
          success: '#10b981', 
          warning: '#f59e0b', 
          danger: '#ef4444', 
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}