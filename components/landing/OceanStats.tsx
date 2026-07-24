"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const OceanWaveScene = dynamic(() => import("@/components/3d/OceanWaveScene"), { ssr: false });

const FACTS = [
  { label: "Ocean Temperature Rise",  value: "+1.4°C",  color: "#FF9F1C" },
  { label: "Coral Reefs Bleached",    value: "58%",     color: "#FF6B6B" },
  { label: "Marine Species Monitored",value: "252K+",   color: "#4ECDC4" },
  { label: "Ocean Sensors Active",    value: "2,318",   color: "#7FFFD4" },
  { label: "Ocean Area Monitored",    value: "361M km²",color: "#4ECDC4" },
  { label: "Plastic in Ocean",        value: "170T+",   color: "#FF6B6B" },
];

export default function OceanStats() {
  return (
    <section className="relative bg-abyss overflow-hidden -mt-1">
      {/* 3D Wave scene */}
      <div className="absolute inset-0 opacity-50">
        <OceanWaveScene height="h-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-ocean rounded-2xl px-4 py-5 text-center"
            >
              <div
                className="font-display font-bold text-2xl leading-none mb-1.5"
                style={{ color: f.color, textShadow: `0 0 16px ${f.color}55` }}
              >
                {f.value}
              </div>
              <div className="text-[0.62rem] font-mono text-mist/70 uppercase tracking-wider leading-tight">
                {f.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
