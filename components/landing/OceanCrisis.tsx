"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const CoralReefScene = dynamic(() => import("@/components/3d/CoralReefScene"), { ssr: false });

const THREATS = [
  {
    id: "01",
    title: "Coral Bleaching",
    stat: "58%",
    statLabel: "of reefs under thermal stress",
    body: "Ocean temperatures 2°C above seasonal maximums trigger mass bleaching events. The Great Barrier Reef has experienced four mass bleaching events since 2016.",
    color: "#E8694A",
  },
  {
    id: "02",
    title: "Ocean Acidification",
    stat: "26%",
    statLabel: "pH reduction since pre-industrial",
    body: "As oceans absorb CO₂, seawater becomes more acidic — threatening the calcium carbonate structures of shellfish, corals, and plankton at the base of the food chain.",
    color: "#FF9F1C",
  },
  {
    id: "03",
    title: "Microplastic Accumulation",
    stat: "14M",
    statLabel: "tonnes of plastic enter oceans annually",
    body: "Gyral accumulation zones concentrate plastic fragments into marine deserts. Microplastics now appear in the deepest ocean trenches and Arctic sea ice cores.",
    color: "#7A8E9E",
  },
];

export default function OceanCrisis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #040D14 0%, #071020 40%, #040D14 100%)" }}
    >
      {/* 3D Coral Reef — ambient behind text */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Suspense fallback={null}>
          <CoralReefScene />
        </Suspense>
      </div>

      {/* Gradient overlays to blend reef into page */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,13,20,0.9) 0%, rgba(4,13,20,0.3) 40%, rgba(4,13,20,0.3) 60%, rgba(4,13,20,0.9) 100%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-36">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-24"
        >
          <div className="section-eyebrow text-coral/60 mb-6">State of the Ocean</div>
          <h2
            className="font-display font-bold text-pearl leading-none"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", letterSpacing: "-0.03em", maxWidth: "14ch" }}
          >
            What we risk<br />
            <span style={{ color: "#E8694A" }}>losing forever.</span>
          </h2>
        </motion.div>

        {/* Threat Panels — editorial asymmetric layout */}
        <div className="space-y-28">
          {THREATS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: 0.1 }}
              className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}
            >
              {/* Big stat */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: "clamp(5rem, 12vw, 10rem)",
                    letterSpacing: "-0.05em",
                    color: t.color,
                    textShadow: `0 0 80px ${t.color}40`,
                  }}
                >
                  {t.stat}
                </div>
                <div
                  className="font-mono mt-2"
                  style={{ color: `${t.color}80`, fontSize: "0.7rem", letterSpacing: "0.12em" }}
                >
                  {t.statLabel.toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 max-w-lg">
                <div
                  className="font-mono mb-3"
                  style={{ color: t.color, fontSize: "0.6rem", letterSpacing: "0.2em" }}
                >
                  {t.id} ──
                </div>
                <h3
                  className="font-display font-bold text-pearl mb-4"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.02em" }}
                >
                  {t.title}
                </h3>
                <p className="text-mist/60 leading-relaxed" style={{ fontSize: "1.05rem" }}>
                  {t.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
