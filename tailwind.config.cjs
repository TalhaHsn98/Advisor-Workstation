module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe5ff",
          200: "#b5cdff",
          300: "#8bacff",
          400: "#668bf3",
          500: "#4369e4",
          600: "#3455b8",
          700: "#2d488f",
          800: "#293c76",
          900: "#24315d",
        },
        surface: {
          950: "#070b14",
        },
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
