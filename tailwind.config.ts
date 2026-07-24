import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Natural Ocean Depth Palette ──────────────────────
        abyss:    "#040D14",  // true midnight ocean
        deep:     "#071829",  // deep ocean
        ocean:    "#0B2340",  // mid ocean
        slate:    "#0E3A5C",  // slate blue
        tide:     "#1A5276",  // tide blue
        surface:  "#0E6B8A",  // ocean surface
        foam:     "#85ECD4",  // soft bioluminescent aqua
        seafoam:  "#4ECDC4",  // seafoam teal
        kelp:     "#1F4D2C",  // kelp forest
        sand:     "#C9A882",  // wet sand
        sandDark: "#8B6914",  // dry sand/desert
        coral:    "#E8694A",  // muted coral (not neon)
        coralSoft:"#F2A58E",  // soft coral pink
        pearl:    "#F2F0ED",  // warm white
        mist:     "#7A8E9E",  // deep water mist
        stone:    "#3D5566",  // ocean stone

        // backward compat
        navy:   "#040D14",
        biolum: "#85ECD4",
        cyan:   "#4ECDC4",
        soft:   "#F2F0ED",
        muted:  "#7A8E9E",
        marine: "#1F4D2C",
        wave:   "#1A5276",
        shallow:"#0E6B8A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body:    ["'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
        serif:   ["'Georgia'", "serif"],
      },
      fontSize: {
        "giant": ["clamp(4rem,10vw,9rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "cinema": ["clamp(2.8rem,6.5vw,6rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "headline": ["clamp(2rem,4vw,3.8rem)", { lineHeight: "1.06", letterSpacing: "-0.02em" }],
      },
      keyframes: {
        floatUp: {
          "0%":   { transform: "translateY(0) translateX(0)", opacity: "0" },
          "8%":   { opacity: "0.7" },
          "100%": { transform: "translateY(-120vh) translateX(12px)", opacity: "0" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)",    opacity: "0.6" },
          "50%":     { transform: "scale(1.08)", opacity: "1"   },
        },
        drift: {
          "0%":   { transform: "translate(0,0)" },
          "33%":  { transform: "translate(6px,-10px)" },
          "66%":  { transform: "translate(-4px,-6px)" },
          "100%": { transform: "translate(0,0)" },
        },
        shimmerText: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center"  },
        },
        revealUp: {
          "0%":   { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)"  },
        },
      },
      animation: {
        floatUp:    "floatUp 16s ease-in infinite",
        breathe:    "breathe 4s ease-in-out infinite",
        drift:      "drift 10s ease-in-out infinite",
        shimmerText:"shimmerText 4s linear infinite",
        revealUp:   "revealUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
        scanline:   "scanline 3s linear infinite",
      },
      backgroundImage: {
        "ocean-depth": "linear-gradient(180deg, #040D14 0%, #071829 30%, #0B2340 60%, #040D14 100%)",
        "surface-glow": "radial-gradient(ellipse at 50% 0%, #0E3A5C 0%, #040D14 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
