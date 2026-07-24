"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";

const BiolumScene = dynamic(() => import("@/components/3d/BiolumScene"), { ssr: false });

const CRISES = [
  {
    title: "Coral Bleaching",
    body: "Rising sea temperatures are triggering mass bleaching events. In 2024, over 58% of the world's reefs experienced thermal stress — the highest ever recorded.",
    color: "#FF6B6B",
    emoji: "🪸",
  },
  {
    title: "Plastic Pollution",
    body: "An estimated 11 million metric tons of plastic enter the ocean every year. Microplastics are now found in the deepest trenches and in marine organisms at every level of the food chain.",
    color: "#FF9F1C",
    emoji: "🌊",
  },
  {
    title: "Ocean Acidification",
    body: "As the ocean absorbs CO₂ from the atmosphere, seawater becomes more acidic. Ocean pH has dropped by 0.1 units since pre-industrial times — a 30% increase in acidity.",
    color: "#4ECDC4",
    emoji: "🐚",
  },
];

export default function OceanCrisis() {
  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050E1A 0%, #071A2F 50%, #050E1A 100%)" }}
    >
      {/* 3D bioluminescent background */}
      <div className="absolute inset-0 opacity-40">
        <BiolumScene height="h-full" />
      </div>

      {/* Floating bubbles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            width:  `${3 + Math.random() * 8}px`,
            height: `${3 + Math.random() * 8}px`,
            left:   `${Math.random() * 100}%`,
            bottom: "-10px",
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay:    `${Math.random() * 8}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 justify-center mb-6"
        >
          <AlertTriangle className="w-4 h-4 text-coral" />
          <span className="font-mono text-[0.65rem] tracking-[0.25em] text-coral uppercase">
            The Ocean Is Under Threat
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display font-bold text-pearl text-center text-[clamp(2rem,4.5vw,3.5rem)] leading-tight max-w-3xl mx-auto mb-4"
        >
          Every Second Counts for Our Oceans
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-mist text-center max-w-xl mx-auto mb-16 leading-relaxed"
        >
          Marine ecosystems that took millions of years to form are deteriorating faster than at any other point in recorded history.
        </motion.p>

        {/* Crisis cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {CRISES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="glass-ocean rounded-3xl p-8 group hover:scale-[1.02] transition-transform duration-300"
              style={{ borderColor: `${c.color}25` }}
            >
              <div className="text-4xl mb-5">{c.emoji}</div>
              <h3 className="font-display font-bold text-pearl text-xl mb-3" style={{ color: c.color }}>
                {c.title}
              </h3>
              <p className="text-mist text-sm leading-relaxed">{c.body}</p>
              <div
                className="mt-5 h-0.5 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ background: c.color }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
