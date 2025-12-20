import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["'Cinzel'", "serif"],
        inter: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        cosmic: {
          dark: "#020617",
          deep: "#0f0d1a",
          mid: "#1e1b4b",
        },
        accent: {
          gold: "#d4af37",
          rose: "#f472b6",
          indigo: "#818cf8",
          violet: "#a78bfa",
          cyan: "#22d3ee",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cosmic-gradient": "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #0f0d1a 100%)",
        "aurora-gradient": "linear-gradient(180deg, transparent 0%, rgba(129, 140, 248, 0.05) 30%, rgba(167, 139, 250, 0.08) 50%, rgba(244, 114, 182, 0.05) 70%, transparent 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(129, 140, 248, 0.3)",
        "glow-md": "0 0 30px rgba(129, 140, 248, 0.4)",
        "glow-lg": "0 0 50px rgba(129, 140, 248, 0.5)",
        "glow-gold": "0 0 30px rgba(212, 175, 55, 0.4)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;