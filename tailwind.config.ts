import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Natural ocean depth palette
        abyss:    "#050E1A",
        deep:     "#0B1E35",
        ocean:    "#0F2D4E",
        tide:     "#1A4A7A",
        wave:     "#2E7DD1",
        shallow:  "#0096B7",
        seafoam:  "#4ECDC4",
        biolum:   "#7FFFD4",
        coral:    "#FF6B6B",
        kelp:     "#2ECC71",
        sand:     "#E8C9A0",
        pearl:    "#E8F4FD",
        mist:     "#94A3B8",
        // Alias for backwards compat
        navy:     "#050E1A",
        cyan:     "#4ECDC4",
        soft:     "#E8F4FD",
        muted:    "#94A3B8",
        marine:   "#2ECC71",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body:    ["'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        floatUp: {
          "0%":   { transform: "translateY(0) translateX(0)",    opacity: "0"   },
          "10%":  { opacity: "0.6" },
          "100%": { transform: "translateY(-110vh) translateX(20px)", opacity: "0" },
        },
        drift: {
          "0%":   { transform: "translate(0,0) rotate(0deg)"   },
          "33%":  { transform: "translate(8px,-12px) rotate(2deg)"  },
          "66%":  { transform: "translate(-6px,-8px) rotate(-1deg)" },
          "100%": { transform: "translate(0,0) rotate(0deg)"   },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center"  },
        },
        pulse_glow: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)"    },
          "50%":     { opacity: "1",   transform: "scale(1.06)" },
        },
        sway: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%":     { transform: "rotate(3deg)"  },
        },
        bubble_rise: {
          "0%":   { transform: "translateY(0) scale(1)",  opacity: "0.7" },
          "100%": { transform: "translateY(-100vh) scale(1.3)", opacity: "0" },
        },
      },
      animation: {
        floatUp:    "floatUp 14s ease-in infinite",
        drift:      "drift 8s ease-in-out infinite",
        shimmer:    "shimmer 3s linear infinite",
        pulse_glow: "pulse_glow 3s ease-in-out infinite",
        sway:       "sway 4s ease-in-out infinite",
        bubble:     "bubble_rise 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
