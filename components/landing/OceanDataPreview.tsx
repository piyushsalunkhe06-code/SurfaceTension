"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip,
} from "recharts";

const WaterSurface = dynamic(() => import("@/components/3d/WaterSurface"), { ssr: false });

const tempData = [
  { m: "2018", v: 0.22 }, { m: "2019", v: 0.28 }, { m: "2020", v: 0.33 },
  { m: "2021", v: 0.31 }, { m: "2022", v: 0.38 }, { m: "2023", v: 0.45 },
  { m: "2024", v: 0.50 }, { m: "2025", v: 0.54 }, { m: "2026", v: 0.60 },
];

const healthData = [
  { s: "Temperature", v: 58 }, { s: "Acidity",     v: 44 },
  { s: "Oxygen",      v: 72 }, { s: "Biodiversity",v: 67 },
  { s: "Currents",    v: 78 }, { s: "Pollution",   v: 35 },
];

const tt = {
  contentStyle: {
    background: "#071829", border: "1px solid rgba(133,236,212,0.15)",
    borderRadius: 8, fontSize: 11, color: "#F2F0ED",
  },
};

export default function OceanDataPreview() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#040D14", minHeight: "80vh" }}
    >
      {/* Subtle water bg at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 z-0 opacity-15">
        <Suspense fallback={null}>
          <WaterSurface height="h-full" />
        </Suspense>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-64 z-[1] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #040D14, transparent)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        {/* Header — large editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <div>
            <div className="section-eyebrow text-foam/50 mb-6">Data Intelligence</div>
            <h2
              className="font-display font-bold text-pearl leading-none"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)", letterSpacing: "-0.03em" }}
            >
              The ocean<br />
              <span className="gradient-text">in numbers.</span>
            </h2>
          </div>

          {/* Right — mini stat block */}
          <div className="flex gap-12">
            {[
              { val: "74",  unit: "/100", label: "Global Health Score" },
              { val: "8.05",unit: "pH",   label: "Ocean pH This Month" },
            ].map(s => (
              <div key={s.label}>
                <div
                  className="font-display font-bold text-pearl leading-none"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.04em" }}
                >
                  {s.val}
                  <span className="font-mono text-foam/40 ml-1" style={{ fontSize: "0.9rem" }}>
                    {s.unit}
                  </span>
                </div>
                <div className="section-eyebrow mt-2 text-mist/40 justify-start">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Magazine-style chart layout — asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Large area chart — 3/5 width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-3"
          >
            <div className="mb-4">
              <div className="font-mono text-mist/40 text-xs tracking-widest uppercase mb-1">
                Sea Surface Temperature Anomaly
              </div>
              <div className="text-mist/30 text-xs">°C above 1961–1990 baseline</div>
            </div>
            <div
              className="rounded-2xl overflow-hidden p-6"
              style={{ background: "rgba(7,24,41,0.4)", border: "1px solid rgba(133,236,212,0.06)" }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={tempData}>
                  <defs>
                    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#E8694A" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#E8694A" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone" dataKey="v"
                    stroke="#E8694A" strokeWidth={2}
                    fill="url(#tg)"
                  />
                  <Tooltip {...tt} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar chart — 2/5 width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="mb-4">
              <div className="font-mono text-mist/40 text-xs tracking-widest uppercase mb-1">
                Ocean Biosphere Index
              </div>
              <div className="text-mist/30 text-xs">6-dimension health assessment</div>
            </div>
            <div
              className="rounded-2xl overflow-hidden p-4"
              style={{ background: "rgba(7,24,41,0.4)", border: "1px solid rgba(133,236,212,0.06)" }}
            >
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={healthData}>
                  <PolarGrid stroke="rgba(133,236,212,0.07)" />
                  <PolarAngleAxis dataKey="s" stroke="#7A8E9E" fontSize={10} />
                  <Radar
                    dataKey="v" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.18} strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA — understated, premium */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-16 gap-6"
        >
          <p className="text-mist/40 max-w-sm text-sm leading-relaxed">
            Full historical datasets, predictive models, and real-time API access available
            to verified researchers and partner organisations.
          </p>
          <div className="flex gap-4">
            <a
              href="/explorer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0E6B8A, #1A5276)",
                color: "#F2F0ED",
              }}
            >
              Explore the Globe
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-medium text-sm border transition-all duration-300 hover:border-foam/30"
              style={{
                border: "1px solid rgba(133,236,212,0.15)",
                color: "#7A8E9E",
              }}
            >
              Ocean Watch →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
