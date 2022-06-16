/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
