"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const EarthV2 = dynamic(() => import("@/components/3d/EarthV2"), { ssr: false });

const STATS = [
  { value: "71%",    label: "of Earth is ocean" },
  { value: "3.8km",  label: "avg. ocean depth" },
  { value: "97%",    label: "of Earth's water" },
  { value: "80%",    label: "of life on Earth" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-abyss pt-24 pb-12">
      {/* 3D Earth background — full screen background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <EarthV2 />
        </Suspense>
      </div>

      {/* Subtle depth vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(4,13,20,0.65) 75%, rgba(4,13,20,0.95) 100%)",
        }}
      />

      {/* Top spacer for navbar */}
      <div className="relative z-10" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="section-eyebrow text-foam/70 mb-6"
        >
          Ocean Intelligence Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-pearl leading-none tracking-tight mb-6"
          style={{ fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)", letterSpacing: "-0.04em" }}
        >
          The Ocean<br />
          <span className="gradient-text">Needs Watching.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-mist max-w-xl text-lg leading-relaxed mb-10"
        >
          Real-time ocean intelligence for researchers, conservationists,
          and the organizations protecting our planet's most vital ecosystem.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <a
            href="/explorer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-semibold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #85ECD4, #4ECDC4)",
              color: "#040D14",
              boxShadow: "0 0 30px rgba(133,236,212,0.2)",
            }}
          >
            Explore 3D Globe →
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-medium text-sm border transition-all duration-300 hover:border-foam/40"
            style={{
              borderColor: "rgba(242,240,237,0.15)",
              color: "#F2F0ED",
            }}
          >
            Open Ocean Watch
          </a>
        </motion.div>

        {/* Global Key Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 pt-6 border-t border-white/10 w-full max-w-3xl"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display font-bold text-pearl leading-none"
                style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </div>
              <div className="section-eyebrow mt-1.5 text-mist/50 justify-center text-[0.55rem]">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade indicator straight into OceanPulse */}
      <div className="relative z-10 flex flex-col items-center gap-2 mt-6">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-4 h-7 rounded-full border border-mist/30 flex items-start justify-center pt-1"
        >
          <div className="w-1 h-1.5 rounded-full bg-foam" />
        </motion.div>
      </div>
    </section>
  );
}
