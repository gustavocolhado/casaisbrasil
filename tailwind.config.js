/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-gray': '#1a1a1a',
        'darker-gray': '#0f0f0f',
        'light-gray': '#2a2a2a',
        'text-gray': '#9ca3af',
        'gray-750': '#374151',
      },
    },
  },
  plugins: [],
} 