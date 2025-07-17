/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admin.html",
    "./debug.html",
    "./script.js",
    "./admin.js",
    "./jeju-sns-app.tsx",
    "./api/**/*.js",
    "./jeju-backend/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'jeju-orange': '#ea580c',
        'jeju-orange-light': '#fed7aa',
        'jeju-orange-dark': '#c2410c',
        'jeju-yellow': '#fbbf24',
        'jeju-green': '#10b981',
        'jeju-blue': '#3b82f6',
        'jeju-red': '#ef4444',
        'jeju-gray': '#6b7280',
        'jeju-gray-light': '#f3f4f6',
        'jeju-gray-dark': '#374151',
        'jeju-white': '#ffffff',
      },
      boxShadow: {
        'jeju': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}