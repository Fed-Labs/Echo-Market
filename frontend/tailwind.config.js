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
      animation: {
        "gradient-shift": "gradient-shift 4s ease infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", boxShadow: "0 0 8px rgba(255, 107, 0, 0.4)" },
          "50%": { opacity: "1", boxShadow: "0 0 20px rgba(255, 107, 0, 0.6), 0 0 40px rgba(255, 107, 0, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};
