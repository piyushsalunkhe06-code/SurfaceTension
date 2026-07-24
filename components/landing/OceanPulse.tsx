"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const WaterSurface = dynamic(() => import("@/components/3d/WaterSurface"), { ssr: false });

const DATA = [
  { value: "0.9°C",  label: "Avg. surface warming since 1880",   color: "#E8694A" },
  { value: "26%",    label: "Ocean acidity increase since 1850",  color: "#FF9F1C" },
  { value: "2,318",  label: "Active monitoring sensors",          color: "#85ECD4" },
  { value: "58%",    label: "Coral reefs under thermal stress",   color: "#E8694A" },
  { value: "8.1",    label: "Current average ocean pH",           color: "#4ECDC4" },
  { value: "96km²",  label: "Daily microplastic ingestion zone",  color: "#7A8E9E" },
];

export default function OceanPulse() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Full-section water simulation */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <WaterSurface height="h-full" />
        </Suspense>
      </div>

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,13,20,0.85) 0%, rgba(4,13,20,0.4) 40%, rgba(4,13,20,0.6) 75%, rgba(4,13,20,0.95) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-32">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-eyebrow text-foam/50 mb-10"
        >
          Ocean Pulse — Live Readings
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-display font-bold text-pearl text-center mb-4 max-w-3xl leading-none"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)", letterSpacing: "-0.03em" }}
        >
          What the data<br />
          <span className="gradient-text">reveals today</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-mist/60 text-center max-w-md mb-20 leading-relaxed"
          style={{ fontSize: "1.05rem" }}
        >
          Global sensor streams aggregated across 5 ocean basins,
          updated continuously from 2,318 marine monitoring stations.
        </motion.p>

        {/* Stats — float up from the water surface */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-12 max-w-4xl mx-auto">
          {DATA.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div
                className="font-display font-bold leading-none mb-2"
                style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                  letterSpacing: "-0.04em",
                  color: d.color,
                  textShadow: `0 0 40px ${d.color}50`,
                }}
              >
                {d.value}
              </div>
              <div
                className="font-mono text-mist/45 leading-snug"
                style={{ fontSize: "0.62rem", letterSpacing: "0.06em" }}
              >
                {d.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full"
            style={{ background: "#85ECD4", boxShadow: "0 0 8px #85ECD4" }}
          />
          <span className="font-mono text-mist/35 text-xs tracking-widest uppercase">
            Live sensor feed — updated every 90 seconds
          </span>
        </motion.div>
      </div>
    </section>
  );
}
