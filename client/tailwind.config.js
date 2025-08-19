/** @type {import('tailwindcss').Config} */
import tailwindcss from '@tailwindcss/vite'

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindcss(),
  ],
  
}