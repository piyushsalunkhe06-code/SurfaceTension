"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Home, Waves, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { getRegionDataForYear } from "@/lib/oceanData";
import { AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const OceanGlobe3D = dynamic(
  () => import("@/components/explorer/OceanGlobe3D").then((m) => ({ default: m.OceanGlobe3D })),
  { ssr: false }
);

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const STATUS_COLORS = { good: "#4ECDC4", warn: "#FF9F1C", crit: "#FF6B6B" } as const;
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

const ttStyle = { contentStyle: { background: "#071A2F", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, fontSize: 10, color: "#E8F4FD" } };

export default function ExplorerPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [year, setYear]         = useState(2024);
  const yearIdx = YEARS.indexOf(year);

  const data = selected ? getRegionDataForYear(selected, year) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-abyss">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-seafoam/8 flex-shrink-0" style={{ background: "rgba(5,14,26,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-mist hover:text-pearl transition-colors"><Home className="w-4 h-4" /></Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-seafoam" />
            <span className="font-display font-semibold text-pearl text-sm">Ocean Explorer</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-kelp" />
            <span className="font-mono text-[0.62rem] text-kelp tracking-wider">Live Data</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelected(null); setYear(2024); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-mist hover:text-seafoam hover:border-seafoam/40 text-xs transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-xs font-bold text-abyss" style={{ background: "linear-gradient(135deg, #4ECDC4, #0096B7)" }}>
            Ocean Watch
          </Link>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT: Region list */}
        <div className="w-56 xl:w-64 flex-shrink-0 border-r border-seafoam/8 p-4 overflow-y-auto scrollbar-thin" style={{ background: "rgba(5,14,26,0.7)" }}>
          <h3 className="font-mono text-[0.6rem] tracking-[0.2em] text-mist uppercase mb-4">Ocean Regions</h3>
          <div className="space-y-1.5">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: selected === r.id ? `${STATUS_COLORS[r.status]}12` : "transparent",
                  border: selected === r.id ? `1px solid ${STATUS_COLORS[r.status]}35` : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[r.status], boxShadow: `0 0 5px ${STATUS_COLORS[r.status]}` }} />
                  <span className="text-xs text-pearl">{r.name}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: STATUS_COLORS[r.status] }}>{r.score}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: 3D Globe */}
        <div className="flex-1 min-w-0 relative">
          <OceanGlobe3D onSelect={setSelected} selected={selected} />
          {!selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-mist/50 font-mono pointer-events-none">
              Click a glowing marker to explore a region
            </div>
          )}
        </div>

        {/* RIGHT: Region detail */}
        <div className="w-64 xl:w-72 flex-shrink-0 border-l border-seafoam/8 p-4 overflow-y-auto scrollbar-thin" style={{ background: "rgba(5,14,26,0.7)" }}>
          <AnimatePresence mode="wait">
            {!data ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl border border-seafoam/20 bg-seafoam/5 flex items-center justify-center mb-4">
                  <Waves className="w-6 h-6 text-seafoam/40" />
                </div>
                <p className="text-mist/50 text-xs max-w-[150px]">Select an ocean region on the globe to explore its health data</p>
              </motion.div>
            ) : (
              <motion.div key={data.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="font-display font-bold text-pearl text-base">{data.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full border" style={{
                      color: STATUS_COLORS[threatToStatus(data.threatLevel)],
                      borderColor: `${STATUS_COLORS[threatToStatus(data.threatLevel)]}40`,
                      background: `${STATUS_COLORS[threatToStatus(data.threatLevel)]}0f`,
                    }}>
                      {statusLabel(data.healthScore)}
                    </span>
                    <span className="text-xs text-mist font-mono">{data.healthScore}/100</span>
                  </div>
                </div>

                {/* Health gauge */}
                <div className="glass-ocean rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#4ECDC4" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={`${(data.healthScore / 100) * 138.2} 138.2`}
                        style={{ filter: "drop-shadow(0 0 4px #4ECDC4)" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-[0.65rem] font-bold text-seafoam">{data.healthScore}</span>
                    </div>
                  </div>
                  <p className="text-xs text-mist leading-relaxed">{data.aiSummary}</p>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Temperature", value: `${data.temperature}°C`, color: "#FF9F1C" },
                    { label: "Salinity",    value: `${data.salinity} PSU`,  color: "#4ECDC4" },
                    { label: "Oxygen",      value: `${data.oxygen} mg/L`,  color: "#4ECDC4" },
                    { label: "Pollution",   value: `${data.pollutionIndex}/100`, color: "#FF6B6B" },
                  ].map((m) => (
                    <div key={m.label} className="glass-ocean rounded-xl p-3">
                      <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider">{m.label}</div>
                      <div className="text-sm font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Temp trend */}
                <div className="glass-ocean rounded-xl p-3">
                  <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider mb-2">Temperature Trend</div>
                  <ResponsiveContainer width="100%" height={60}>
                    <AreaChart data={data.tempTrend}>
                      <defs>
                        <linearGradient id="exTG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF9F1C" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#FF9F1C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#FF9F1C" fill="url(#exTG)" strokeWidth={1.5} />
                      <Tooltip {...ttStyle} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar */}
                <div className="glass-ocean rounded-xl p-3">
                  <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider mb-1">Ecosystem Radar</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <RadarChart data={data.radarData}>
                      <PolarGrid stroke="rgba(78,205,196,0.1)" />
                      <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
                      <Radar dataKey="value" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.2} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Biodiversity + Coral bars */}
                {[
                  { label: "Biodiversity", value: data.biodiversity, color: "#4ECDC4" },
                  { label: "Coral Health", value: data.coralHealth, color: data.coralHealth > 60 ? "#4ECDC4" : "#FF9F1C" },
                ].map((b) => (
                  <div key={b.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-mist font-mono">{b.label}</span>
                      <span className="font-bold" style={{ color: b.color }}>{b.value}%</span>
                    </div>
                    <div className="h-1.5 rounded bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.value}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded"
                        style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}66)` }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom timeline */}
      <div className="flex-shrink-0 border-t border-seafoam/8 px-6 py-3.5" style={{ background: "rgba(5,14,26,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-seafoam" style={{ boxShadow: "0 0 6px #4ECDC4" }} />
            <span className="font-mono text-[0.6rem] text-mist uppercase tracking-wider">Timeline</span>
          </div>
          <button onClick={() => yearIdx > 0 && setYear(YEARS[yearIdx - 1])} disabled={yearIdx === 0} className="p-1 rounded-lg border border-white/10 text-mist hover:text-seafoam transition-all disabled:opacity-30">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 relative">
            <div className="h-[2px] bg-white/8 rounded" />
            <div className="absolute top-0 h-[2px] rounded transition-all duration-500" style={{ width: `${(yearIdx / (YEARS.length - 1)) * 100}%`, background: "linear-gradient(90deg, #4ECDC4, #0096B7)", boxShadow: "0 0 6px rgba(78,205,196,0.5)" }} />
            <div className="flex items-center justify-between mt-2.5">
              {YEARS.map((y) => (
                <button key={y} onClick={() => setYear(y)} className="flex flex-col items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full transition-all duration-200" style={{
                    background: y === year ? "#4ECDC4" : y < year ? "#0096B7" : "rgba(255,255,255,0.15)",
                    boxShadow: y === year ? "0 0 7px #4ECDC4" : "none",
                    transform: y === year ? "scale(1.4)" : "scale(1)",
                  }} />
                  <span className="text-[0.58rem] font-mono" style={{ color: y === year ? "#4ECDC4" : "rgba(148,163,184,0.4)" }}>{y}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => yearIdx < YEARS.length - 1 && setYear(YEARS[yearIdx + 1])} disabled={yearIdx === YEARS.length - 1} className="p-1 rounded-lg border border-white/10 text-mist hover:text-seafoam transition-all disabled:opacity-30">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-seafoam" style={{ textShadow: "0 0 12px rgba(78,205,196,0.4)" }}>{year}</span>
            {year > 2026 && <span className="text-[0.58rem] font-mono px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">Forecast</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
