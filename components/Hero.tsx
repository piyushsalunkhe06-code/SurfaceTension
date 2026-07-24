"use client";

import { Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";

const EarthV2 = dynamic(() => import("@/components/3d/EarthV2"), { ssr: false });

const STATS = [
  { value: "71%",    label: "of Earth is ocean" },
  { value: "3.8km",  label: "avg. ocean depth" },
  { value: "97%",    label: "of Earth's water" },
  { value: "80%",    label: "of life on Earth" },
];

export default function Hero() {
  const scrollRef      = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const containerRef   = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const opacity    = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.55], [0, -80]);

  // Keep scroll progress synced for Three.js
  scrollYProgress.on("change", v => { scrollProgress.current = Math.min(v * 1.6, 1); });

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "220vh" }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden" ref={scrollRef}>
        {/* 3D Earth canvas — full screen */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <EarthV2 scrollProgress={scrollProgress} />
          </Suspense>
        </div>

        {/* Radial vignette for depth */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(4,13,20,0.6) 80%, rgba(4,13,20,0.9) 100%)",
          }}
        />

        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 z-[2] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #040D14)" }}
        />

        {/* Hero text */}
        <motion.div
          style={{ opacity, y: translateY }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="section-eyebrow text-foam/60 mb-8"
          >
            Ocean Intelligence Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-pearl leading-none tracking-tight mb-6"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)" }}
          >
            The Ocean<br />
            <span className="gradient-text">Needs Watching.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-body text-mist max-w-lg leading-relaxed mb-14"
            style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)" }}
          >
            Real-time ocean intelligence for researchers, conservationists,
            and the organizations protecting our planet's most vital ecosystem.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center gap-8 md:gap-14 flex-wrap justify-center"
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="font-display font-bold text-pearl leading-none"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.03em" }}
                >
                  {s.value}
                </div>
                <div className="section-eyebrow mt-2 text-mist/50 justify-center">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="section-eyebrow text-mist/30">Scroll to dive</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-mist/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-foam/50" />
          </motion.div>
        </motion.div>

        {/* Depth indicator (cinematic sidebar) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-4">
          {["Surface", "50m", "200m", "Deep"].map((d, i) => (
            <div key={d} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-foam/30" />
              <span className="font-mono text-[0.55rem] text-mist/25 tracking-widest">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
