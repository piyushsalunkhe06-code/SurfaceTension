"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const BiolumScene = dynamic(() => import("@/components/3d/BiolumScene"), { ssr: false });

export default function ProtectTheDeep() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, #040D14 0%, #071829 50%, #040D14 100%)" }}>
      {/* 3D Ambient Bioluminescent background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Suspense fallback={null}>
          <BiolumScene height="h-full" />
        </Suspense>
      </div>

      {/* Depth vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(4,13,20,0.85) 85%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-eyebrow text-foam/60 mb-8"
        >
          The Living Ocean
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-display font-bold text-pearl leading-none tracking-tight mb-8"
          style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", letterSpacing: "-0.04em" }}
        >
          We cannot protect<br />
          <span className="gradient-text">what we cannot see.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-body text-mist/70 max-w-2xl text-lg leading-relaxed mb-12"
        >
          DeepSea Guardian bridges science, technology, and global policy — turning billions of ocean data points into actionable insights for Earth's final frontier.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href="/explorer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-semibold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #85ECD4, #4ECDC4)",
              color: "#040D14",
              boxShadow: "0 0 35px rgba(133,236,212,0.25)",
            }}
          >
            Launch Interactive Explorer →
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-semibold text-sm border transition-all duration-300 hover:border-foam/40"
            style={{
              borderColor: "rgba(242,240,237,0.15)",
              color: "#F2F0ED",
            }}
          >
            Open Ocean Watch
          </a>
        </motion.div>
      </div>
    </section>
  );
}
