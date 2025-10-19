/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: { extend: {} },
  plugins: [],
  // Keep arbitrary values like [mask-image:...] safe in production
  safelist: [
    { pattern: /\[.*\]/ }, // allows bracketed arbitrary utilities
  ],
}


