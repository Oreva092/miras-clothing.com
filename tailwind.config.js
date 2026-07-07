/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./shop.html",
    "./blog.html",
    "./about.html",
    "./contact.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        poppins: ['Poppins', 'sans-serif'],
        instrument: ['Instrument Serif', 'serif'],
        playwrite: ['Playwrite AT', 'cursive']
      },
    },
  },
  plugins: [],
}