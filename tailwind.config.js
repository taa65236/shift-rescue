/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink navy: the "night shift" backdrop
        ink: {
          950: "#0B1220",
          900: "#0F1A2E",
          800: "#16233D",
          700: "#22334F",
        },
        // Flare amber: the urgent "signal" color
        flare: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          400: "#FBA94C",
          500: "#F5940E",
          600: "#D97B06",
          700: "#B35F04",
        },
        // Rescue teal: success / match color
        rescue: {
          50: "#ECFDF9",
          100: "#CFFAF0",
          400: "#2DD4BF",
          500: "#0FA898",
          600: "#0C8A7D",
          700: "#0B6E63",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 26, 46, 0.06), 0 4px 16px rgba(15, 26, 46, 0.06)",
      },
      keyframes: {
        "signal-ping": {
          "75%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "signal-ping": "signal-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
