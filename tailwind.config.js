/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      dropShadow: {
        "2xl": "0rem 1rem 1rem rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
