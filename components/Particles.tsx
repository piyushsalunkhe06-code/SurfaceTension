"use client";

import { useMemo } from "react";

export default function Particles({
  count = 26,
  color = "#00E5FF",
  kind = "bubble",
}: {
  count?: number;
  color?: string;
  kind?: "bubble" | "glow";
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        dur: 8 + Math.random() * 10,
        size: kind === "bubble" ? 3 + Math.random() * 8 : 1 + Math.random() * 2,
      })),
    [count, kind]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-floatUp"
          style={{
            left: `${p.left}%`,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            background:
              kind === "bubble"
                ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(0,229,255,0.15))"
                : color,
            opacity: 0.55,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            boxShadow: kind === "glow" ? `0 0 6px 2px ${color}` : "none",
          }}
        />
      ))}
    </div>
  );
}
