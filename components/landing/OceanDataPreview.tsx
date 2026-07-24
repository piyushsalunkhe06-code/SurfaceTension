"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const OceanWaveScene = dynamic(() => import("@/components/3d/OceanWaveScene"), { ssr: false });

const tempData = [
  { m: "2019", v: 0.18 }, { m: "2020", v: 0.24 }, { m: "2021", v: 0.28 },
  { m: "2022", v: 0.35 }, { m: "2023", v: 0.42 }, { m: "2024", v: 0.50 },
  { m: "2025", v: 0.58 },
];
const radarData = [
  { s: "Coral",       v: 62 }, { s: "Plankton",  v: 84 },
  { s: "Fish",        v: 73 }, { s: "Mammals",   v: 78 },
  { s: "Seagrass",    v: 55 }, { s: "Mangroves", v: 69 },
];

const ttStyle = { contentStyle: { background: "#071A2F", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, fontSize: 11, color: "#E8F4FD" } };

export default function OceanDataPreview() {
  return (
    <section className="relative py-28 overflow-hidden" style={{
      background: "radial-gradient(ellipse at 50% 50%, #0B2240 0%, #050E1A 70%)"
    }}>
      {/* 3D wave subtly in background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <OceanWaveScene height="h-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-[0.65rem] tracking-[0.25em] text-seafoam uppercase"
          >
            Ocean Intelligence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display font-bold text-pearl text-[clamp(1.9rem,4vw,3rem)] leading-tight"
          >
            Data That Tells the Ocean's Story
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Temperature Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-ocean rounded-2xl p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-pearl">Sea Surface Temperature Anomaly</h3>
                <p className="text-mist text-xs mt-1">°C above pre-industrial baseline</p>
              </div>
              <span className="font-mono text-coral text-xl font-bold" style={{ textShadow: "0 0 12px rgba(255,107,107,0.5)" }}>+0.58°C</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FF6B6B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#FF6B6B" fill="url(#tempGrad)" strokeWidth={2} />
                <Tooltip {...ttStyle} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Marine Biodiversity Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="glass-ocean rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-pearl mb-1">Marine Biodiversity</h3>
            <p className="text-mist text-xs mb-3">Species group vitality index</p>
            <ResponsiveContainer width="100%" height={188}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(78,205,196,0.1)" />
                <PolarAngleAxis dataKey="s" stroke="#94A3B8" fontSize={10} />
                <Radar dataKey="v" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.22} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Health Score + Mini Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-ocean rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-pearl mb-4">Global Ocean Health</h3>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#healthG)" strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={`${(74 / 100) * 263.9} 263.9`} />
                  <defs>
                    <linearGradient id="healthG" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#4ECDC4" />
                      <stop offset="100%" stopColor="#0096B7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-2xl text-pearl">74</span>
                  <span className="text-[0.6rem] text-mist font-mono">/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-seafoam">Moderate Health</div>
                <div className="text-xs text-mist leading-relaxed">
                  Ocean systems are under measurable stress. Conservation action can reverse current trends.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coral Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-ocean rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="font-display font-semibold text-pearl mb-5">Reef Health by Region</h3>
            <div className="space-y-4">
              {[
                { name: "Great Barrier Reef",   score: 62, color: "#FF9F1C" },
                { name: "Caribbean Reefs",      score: 45, color: "#FF6B6B" },
                { name: "Coral Triangle",       score: 71, color: "#4ECDC4" },
                { name: "Red Sea",              score: 79, color: "#4ECDC4" },
                { name: "Maldives",             score: 38, color: "#FF6B6B" },
              ].map((reef) => (
                <div key={reef.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-mist">{reef.name}</span>
                    <span className="font-mono font-bold" style={{ color: reef.color }}>{reef.score}%</span>
                  </div>
                  <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${reef.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2 }}
                      className="h-full rounded"
                      style={{ background: `linear-gradient(90deg, ${reef.color}, ${reef.color}88)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
