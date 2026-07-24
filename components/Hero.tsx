"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";

const HeroEarth = dynamic(() => import("./HeroEarth"), { ssr: false });

export default function Hero() {
  const sectionRef    = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const [textOpacity, setTextOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect     = el.getBoundingClientRect();
      const total    = el.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / (total || 1)));
      scrollProgress.current = progress;
      setTextOpacity(Math.max(0, 1 - progress * 1.6));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[165vh]" style={{
      background: "radial-gradient(ellipse at 50% 20%, #0B2D50 0%, #050E1A 60%, #020810 100%)",
    }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Starfield SVG background */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width:  `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left:   `${Math.random() * 100}%`,
                top:    `${Math.random() * 60}%`,
                opacity: 0.2 + Math.random() * 0.5,
                animation: `pulse_glow ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* 3D Earth */}
        <div className="absolute inset-0">
          <HeroEarth scrollProgress={scrollProgress} />
        </div>

        {/* Text overlay */}
        <div
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ opacity: textOpacity, transition: "opacity 0.1s" }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex items-center gap-2 mb-7"
          >
            <div className="h-[1px] w-8 bg-seafoam/50" />
            <span className="font-mono text-[0.68rem] tracking-[0.25em] text-seafoam uppercase">
              Live Ocean Observation
            </span>
            <div className="h-[1px] w-8 bg-seafoam/50" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-pearl text-[clamp(2.4rem,6.5vw,5.2rem)] leading-[1.04] max-w-4xl tracking-tight"
          >
            The Ocean Is Speaking.
            <br />
            <span className="gradient-text">Are We Listening?</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-6 text-mist text-base md:text-lg max-w-xl leading-relaxed"
          >
            A living window into Earth's marine world — revealing the beauty, fragility, and urgency of our ocean ecosystems through immersive real-time visualization.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 items-center pointer-events-auto"
          >
            <Link
              href="/explorer"
              className="px-9 py-4 rounded-full font-bold text-sm text-abyss transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #0096B7)",
                boxShadow: "0 0 32px -6px rgba(78, 205, 196, 0.7)",
              }}
            >
              Dive Into the Ocean
            </Link>
            <Link
              href="/dashboard"
              className="px-9 py-4 rounded-full border border-seafoam/25 text-pearl text-sm hover:bg-seafoam/8 hover:border-seafoam/50 transition-all duration-300"
            >
              Ocean Watch →
            </Link>
          </motion.div>

          {/* Ocean Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-16 flex gap-10 flex-wrap justify-center"
          >
            {[
              { value: "71%",  label: "of Earth covered by ocean" },
              { value: "3.8km", label: "average ocean depth" },
              { value: "252K+", label: "known marine species" },
            ].map((s, i) => (
              <div key={i} className={`text-center ${i > 0 ? "pl-10 border-l border-white/8" : ""}`}>
                <div className="font-display font-bold text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-seafoam" style={{ textShadow: "0 0 20px rgba(78,205,196,0.4)" }}>
                  {s.value}
                </div>
                <div className="mt-1.5 text-[0.7rem] tracking-[0.12em] uppercase text-mist font-mono">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade to ocean */}
        <div
          className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent, rgba(0, 70, 100, 0.3) 50%, #050E1A)" }}
        />
      </div>
    </section>
  );
}
