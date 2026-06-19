import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1120px" },
    },
    extend: {
      colors: {
        // CSS-variable tokens consumed by index.css (@apply border-border) and shadcn UI primitives.
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: "hsl(var(--muted))",
        // Brand palette (from legacy index.html :root)
        teal: {
          DEFAULT: "#016352",
          deep: "#014439",
          light: "#0a8a74",
        },
        orange: {
          DEFAULT: "#f16e0b",
          soft: "#ff8a33",
        },
        foam: "#eaf6f3",
        sand: "#f7f1e7",
        ink: "#042b25",
      },
      fontFamily: {
        sans: ['"Poppins"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        bob: "bob 5s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
