/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    { pattern: /\[.*\]/ },                 // arbitrary values like [mask-image:...]
    { pattern: /^(bg|text|border|from|to|via)-/ }, // keep common utility families
    { pattern: /^(sm:|md:|lg:|xl:)?(grid|flex|items|justify|gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-/ },
    { pattern: /^hover:(bg|text|border)-/ },
  ],
};


