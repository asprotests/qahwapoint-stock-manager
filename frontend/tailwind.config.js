/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf6f4",
          100: "#f4ede8",
          200: "#e9dbd1",
          300: "#d9c0b0",
          400: "#c69f8a",
          500: "#b8856d",
          600: "#9E593C", // Your secondary color as primary-600
          700: "#653524", // Your primary color as primary-700
          800: "#543020",
          900: "#46291b",
          950: "#251410",
        },
        secondary: {
          50: "#faf6f4",
          100: "#f4ede8",
          200: "#e9dbd1",
          300: "#d9c0b0",
          400: "#c69f8a",
          500: "#b8856d",
          600: "#9E593C",
          700: "#8a4d33",
          800: "#73412b",
          900: "#5f3726",
          950: "#321b13",
        },
      },
    },
  },
  plugins: [],
};
