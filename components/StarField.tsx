"use client";

import { useEffect, useRef } from "react";

export default function StarField({ density = 160 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let w: number, h: number;
    let stars: { x: number; y: number; r: number; s: number; phase: number }[] = [];

    const size = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        s: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    size();
    window.addEventListener("resize", size);

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((st) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * st.s * 4 + st.phase);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248,250,252,${0.15 + twinkle * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
