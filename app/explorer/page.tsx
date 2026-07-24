"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Home, Waves, RotateCcw, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { getRegionDataForYear } from "@/lib/oceanData";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const OceanGlobe3D = dynamic(
  () => import("@/components/explorer/OceanGlobe3D").then((m) => ({ default: m.OceanGlobe3D })),
  { ssr: false }
);

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const STATUS_COLORS = { good: "#85ECD4", warn: "#FF9F1C", crit: "#E8694A" } as const;
type StatusKey = keyof typeof STATUS_COLORS;
const threatToStatus = (t: string): StatusKey => t === "Low" ? "good" : t === "Critical" ? "crit" : "warn";
const statusLabel = (score: number) => score >= 70 ? "Good" : score >= 50 ? "Moderate" : score >= 35 ? "Concerning" : "Critical";

const REGIONS = [
  { id: "pacific",       name: "Pacific Ocean",    score: 82, status: "good" as const },
  { id: "atlantic",      name: "Atlantic Ocean",   score: 61, status: "warn" as const },
  { id: "indian",        name: "Indian Ocean",     score: 58, status: "warn" as const },
  { id: "southern",      name: "Southern Ocean",   score: 90, status: "good" as const },
  { id: "arctic",        name: "Arctic Ocean",     score: 34, status: "crit" as const },
  { id: "mediterranean", name: "Mediterranean Sea",score: 41, status: "crit" as const },
  { id: "southchina",    name: "S. China Sea",     score: 55, status: "warn" as const },
  { id: "northsea",      name: "North Sea",        score: 62, status: "warn" as const },
];

const ttStyle = { contentStyle: { background: "#071829", border: "1px solid rgba(133,236,212,0.15)", borderRadius: 8, fontSize: 10, color: "#F2F0ED" } };

export default function ExplorerPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [year, setYear]         = useState(2024);
  const yearIdx = YEARS.indexOf(year);

  const data = selected ? getRegionDataForYear(selected, year) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-abyss text-pearl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0" style={{ background: "rgba(4,13,20,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-mist hover:text-pearl transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-foam" />
            <span className="font-display font-semibold text-pearl text-sm tracking-tight">Global Ocean Explorer</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-foam" />
            <span className="font-mono text-[0.6rem] text-foam/80 tracking-widest uppercase">Telemetry Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-mono text-mist hover:text-foam transition-colors">
            Ocean Watch →
          </Link>
        </div>
      </div>

      {/* Main 3-column area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT: Region selector */}
        <div className="w-60 flex-shrink-0 border-r border-white/5 p-4 overflow-y-auto scrollbar-thin" style={{ background: "rgba(4,13,20,0.75)" }}>
          <div className="font-mono text-[0.58rem] tracking-[0.2em] text-mist/60 uppercase mb-3">Select Basin</div>
          <div className="space-y-1.5">
            {REGIONS.map((r) => {
              const active = selected === r.id;
              const col = STATUS_COLORS[r.status];
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(active ? null : r.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200"
                  style={{
                    background: active ? `${col}12` : "rgba(255,255,255,0.015)",
                    borderColor: active ? `${col}40` : "rgba(255,255,255,0.04)",
                  }}
                >
                  <div>
                    <div className="text-xs font-semibold text-pearl">{r.name}</div>
                    <div className="text-[0.58rem] font-mono text-mist/50 mt-0.5">{statusLabel(r.score)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold" style={{ color: col }}>{r.score}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: 3D Interactive Globe */}
        <div className="flex-1 relative">
          <OceanGlobe3D onSelect={(id) => setSelected(id)} selected={selected} />

          {/* Hint overlay */}
          {!selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center">
              <span className="font-mono text-[0.62rem] text-mist/40 tracking-widest uppercase bg-abyss/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                Drag to rotate globe · Click any region pin
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Region detail panel */}
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-white/5 p-5 overflow-y-auto scrollbar-thin" style={{ background: "rgba(4,13,20,0.85)" }}>
          <AnimatePresence mode="wait">
            {!data ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center mb-4">
                  <Waves className="w-5 h-5 text-mist/40" />
                </div>
                <p className="text-mist/50 text-xs max-w-[160px] leading-relaxed">
                  Select an ocean basin on the globe or list to inspect real-time observations
                </p>
              </motion.div>
            ) : (
              <motion.div key={data.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <h2 className="font-display font-bold text-pearl text-lg">{data.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full border" style={{
                      color: STATUS_COLORS[threatToStatus(data.threatLevel)],
                      borderColor: `${STATUS_COLORS[threatToStatus(data.threatLevel)]}40`,
                      background: `${STATUS_COLORS[threatToStatus(data.threatLevel)]}0f`,
                    }}>
                      {statusLabel(data.healthScore)}
                    </span>
                    <span className="text-[0.6rem] font-mono text-mist/50">Score: {data.healthScore}/100</span>
                  </div>
                </div>

                <p className="text-xs text-mist/70 leading-relaxed border-t border-white/5 pt-3">
                  {data.aiSummary}
                </p>

                {/* Key Telemetry */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  {[
                    { label: "Surface Temp", val: `${data.temperature}°C` },
                    { label: "Salinity",     val: `${data.salinity} PSU` },
                    { label: "Dissolved O₂", val: `${data.oxygen} mg/L` },
                    { label: "Pollution",   val: `${data.pollutionIndex}/100` },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.015]">
                      <div className="text-[0.55rem] font-mono text-mist/40 uppercase">{m.label}</div>
                      <div className="font-mono text-sm font-semibold text-pearl mt-0.5">{m.val}</div>
                    </div>
                  ))}
                </div>

                {/* Temp Trend Chart */}
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[0.58rem] font-mono text-mist/40 uppercase mb-2">Temperature Anomaly Trend</div>
                  <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={data.tempTrend}>
                      <Area type="monotone" dataKey="v" stroke="#85ECD4" fill="#85ECD4" fillOpacity={0.12} strokeWidth={1.5} />
                      <Tooltip {...ttStyle} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar breakdown */}
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[0.58rem] font-mono text-mist/40 uppercase mb-1">Health Breakdown</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <RadarChart data={data.radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" stroke="#7A8E9E" fontSize={9} />
                      <Radar dataKey="value" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Timeline bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-t border-white/5 flex-shrink-0 font-mono text-xs" style={{ background: "rgba(4,13,20,0.92)" }}>
        <div className="text-mist/50 text-[0.62rem] uppercase tracking-wider">Predictive Timeline</div>
        <div className="flex items-center gap-2">
          <button onClick={() => yearIdx > 0 && setYear(YEARS[yearIdx - 1])} disabled={yearIdx === 0} className="p-1 text-mist/60 hover:text-pearl disabled:opacity-30">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            {YEARS.map((y) => (
              <button key={y} onClick={() => setYear(y)} className={`px-2 py-0.5 rounded text-[0.62rem] ${year === y ? "bg-foam/20 text-foam border border-foam/30" : "text-mist/40 hover:text-mist"}`}>
                {y}
              </button>
            ))}
          </div>
          <button onClick={() => yearIdx < YEARS.length - 1 && setYear(YEARS[yearIdx + 1])} disabled={yearIdx === YEARS.length - 1} className="p-1 text-mist/60 hover:text-pearl disabled:opacity-30">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={() => { setYear(2024); setSelected(null); }} className="flex items-center gap-1 text-[0.6rem] text-mist/40 hover:text-pearl transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </div>
  );
}
