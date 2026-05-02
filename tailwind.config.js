/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-poudre': '#FFEAEC',
        'vert-foret': '#4D553A',
        'vert-olive': '#788943',
        'vert-sauge': '#9DBF9E',
        'bleu-ardoise': '#7D84B2',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
