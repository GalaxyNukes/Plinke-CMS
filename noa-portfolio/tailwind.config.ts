import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        dark: "var(--bg-dark)",
        light: "var(--bg-light)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "text-primary": "var(--text-primary)",
        "text-dark": "var(--text-dark)",
        "text-muted": "var(--text-muted)",
      },
      borderRadius: {
        card: "24px",
        sm: "14px",
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 251, 0, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201, 251, 0, 0)" },
        },
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
        "fade-up": "fadeUp 0.7s ease forwards",
        "pulse-accent": "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
