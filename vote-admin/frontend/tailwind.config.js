/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-hover': '#1d4ed8',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#6366f1',
      },
    },
  },
  plugins: [],
}
