"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Fish, Satellite, Wind, Microscope } from "lucide-react";

const BiolumScene = dynamic(() => import("@/components/3d/BiolumScene"), { ssr: false });

const CAPABILITIES = [
  {
    icon: <Thermometer className="w-5 h-5" />,
    num: "01",
    title: "Sea Surface Temperature",
    body: "Daily satellite-derived surface temperature maps across all ocean basins with 1km resolution. Anomaly tracking from a 1961–1990 baseline.",
    stat: "1km", label: "resolution",
    color: "#E8694A",
  },
  {
    icon: <Droplets className="w-5 h-5" />,
    num: "02",
    title: "Ocean Acidification Monitoring",
    body: "Dissolved CO₂ and pH measurements from Argo float arrays. Tracks aragonite saturation critical for coral and shellfish formation.",
    stat: "3,000+", label: "Argo floats",
    color: "#FF9F1C",
  },
  {
    icon: <Fish className="w-5 h-5" />,
    num: "03",
    title: "Marine Biodiversity Index",
    body: "Acoustic and camera-based species surveys correlated with environmental conditions. Tracks population shifts across 4,200 monitored species.",
    stat: "4,200", label: "species tracked",
    color: "#4ECDC4",
  },
  {
    icon: <Wind className="w-5 h-5" />,
    num: "04",
    title: "Ocean Current Mapping",
    body: "Thermohaline circulation modelling from surface drifters and moored buoys. Identifies disruption patterns to major current systems.",
    stat: "850", label: "drifters active",
    color: "#85ECD4",
  },
  {
    icon: <Satellite className="w-5 h-5" />,
    num: "05",
    title: "Satellite Altimetry",
    body: "Sea surface height and anomaly detection from Sentinel-6 and TOPEX. Tracks sea level rise with millimetre-scale precision.",
    stat: "±3mm", label: "measurement precision",
    color: "#C9A882",
  },
  {
    icon: <Microscope className="w-5 h-5" />,
    num: "06",
    title: "Phytoplankton Biomass",
    body: "Chlorophyll-a satellite spectral analysis maps phytoplankton blooms — the foundation of oceanic food webs and climate carbon sequestration.",
    stat: "50%", label: "of Earth's oxygen",
    color: "#1F4D2C",
  },
];

export default function WhatWeMonitor() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #040D14 0%, #071829 50%, #040D14 100%)" }}
    >
      {/* Ambient biolum background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Suspense fallback={null}>
          <BiolumScene height="h-full" />
        </Suspense>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-36">
        {/* Header — left-aligned editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-24">
          <div>
            <div className="section-eyebrow text-foam/50 mb-6">How We Observe</div>
            <h2
              className="font-display font-bold text-pearl leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.03em" }}
            >
              Every layer<br />
              <span className="gradient-text">of the ocean.</span>
            </h2>
          </div>
          <p
            className="text-mist/50 max-w-sm leading-relaxed lg:text-right"
            style={{ fontSize: "0.95rem" }}
          >
            Six complementary observation streams provide a complete,
            multi-dimensional portrait of ocean health in near real-time.
          </p>
        </div>

        {/* Capabilities — editorial list, NOT identical cards */}
        <div className="space-y-0">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.06 }}
              className="group flex flex-col md:flex-row md:items-center gap-6 py-8 border-b last:border-0 cursor-default"
              style={{ borderColor: "rgba(133,236,212,0.06)" }}
            >
              {/* Number */}
              <div
                className="font-mono flex-shrink-0 w-8"
                style={{ color: cap.color, fontSize: "0.6rem", letterSpacing: "0.15em", opacity: 0.6 }}
              >
                {cap.num}
              </div>

              {/* Icon */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                style={{
                  background: `${cap.color}14`,
                  border: `1px solid ${cap.color}22`,
                  color: cap.color,
                }}
              >
                {cap.icon}
              </div>

              {/* Title + body */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-display font-semibold text-pearl mb-1 group-hover:text-foam transition-colors duration-400"
                  style={{ fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}
                >
                  {cap.title}
                </h3>
                <p className="text-mist/45 text-sm leading-relaxed max-w-xl">{cap.body}</p>
              </div>

              {/* Stat — appears on right */}
              <div className="flex-shrink-0 text-right hidden lg:block">
                <div
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)",
                    letterSpacing: "-0.04em",
                    color: cap.color,
                    opacity: 0.7,
                    transition: "opacity 0.3s",
                  }}
                >
                  {cap.stat}
                </div>
                <div className="font-mono mt-1" style={{ color: cap.color, opacity: 0.35, fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                  {cap.label.toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
