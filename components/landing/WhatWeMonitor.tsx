"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Waves, Thermometer, Fish, Shell, Map, Activity } from "lucide-react";

const CoralReefScene = dynamic(() => import("@/components/3d/CoralReefScene"), { ssr: false });

const CAPABILITIES = [
  { icon: <Thermometer className="w-5 h-5" />, title: "Sea Temperature",   body: "Track surface and deep-water temperature trends across every ocean basin, updated from satellite and buoy networks.", color: "#FF9F1C" },
  { icon: <Waves className="w-5 h-5" />,       title: "Ocean Currents",    body: "Visualize the planet's great ocean conveyor belts — the invisible rivers that regulate Earth's climate.",              color: "#4ECDC4" },
  { icon: <Fish className="w-5 h-5" />,         title: "Marine Species",    body: "Monitor migration patterns, population density, and habitat health for thousands of marine species.",                   color: "#7FFFD4" },
  { icon: <Shell className="w-5 h-5" />,        title: "Coral Reef Health", body: "Detect bleaching events early using thermal stress indices and spectral imaging from satellites.",                    color: "#FF6B6B" },
  { icon: <Map className="w-5 h-5" />,          title: "Habitat Mapping",   body: "High-resolution maps of seagrass meadows, mangroves, kelp forests, and deep-sea habitats.",                          color: "#2ECC71" },
  { icon: <Activity className="w-5 h-5" />,     title: "Ocean Vitality",    body: "A unified biosphere health score synthesized from oxygen levels, salinity, pH, and biodiversity indices.",           color: "#0096B7" },
];

export default function WhatWeMonitor() {
  return (
    <section id="coral" className="relative py-28 overflow-hidden" style={{
      background: "linear-gradient(180deg, #050E1A 0%, #041524 60%, #050E1A 100%)"
    }}>
      {/* Wave divider top */}
      <div className="wave-top pointer-events-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 70, width: "100%" }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" fill="#050E1A" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-[0.65rem] tracking-[0.25em] text-seafoam uppercase"
          >
            What We Observe
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mt-4 font-display font-bold text-pearl text-[clamp(2rem,4vw,3.2rem)] max-w-3xl mx-auto leading-tight"
          >
            A Complete Picture of Ocean Health
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-mist max-w-xl mx-auto leading-relaxed"
          >
            Every layer of the marine world — from sunlit surface waters to the cold, dark depths — observed and made accessible.
          </motion.p>
        </div>

        {/* 3D Coral Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden border border-seafoam/10 mb-14"
          style={{ background: "#021424", boxShadow: "0 0 60px -15px rgba(78,205,196,0.2)" }}
        >
          <CoralReefScene height="h-80 md:h-[480px]" />
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-[0.65rem] font-mono text-mist/50 text-center">
              Live 3D Coral Reef Scene — Rendered in real-time
            </p>
          </div>
        </motion.div>

        {/* Capability cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass-ocean rounded-2xl p-7 hover:scale-[1.02] transition-all duration-300 cursor-default"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${cap.color}18`, border: `1px solid ${cap.color}35`, color: cap.color }}
              >
                {cap.icon}
              </div>
              <h3 className="font-display font-semibold text-pearl text-lg mb-2">{cap.title}</h3>
              <p className="text-mist text-sm leading-relaxed">{cap.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Wave divider bottom */}
      <div className="wave-bottom pointer-events-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 70, width: "100%" }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" fill="#050E1A" />
        </svg>
      </div>
    </section>
  );
}
