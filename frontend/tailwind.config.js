/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        echo: {
          bg: "#0a0a0a",
          surface: "#111111",
          border: "#1f1f1f",
          amber: "#f59e0b",
          cyan: "#06b6d4",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
          muted: "#737373",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0",
      },
    },
  },
  plugins: [],
};
