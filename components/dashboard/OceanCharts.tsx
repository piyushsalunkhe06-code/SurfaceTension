"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";

const tempData = [
  { m: "Jan", v: 0.20 }, { m: "Feb", v: 0.28 }, { m: "Mar", v: 0.31 },
  { m: "Apr", v: 0.35 }, { m: "May", v: 0.40 }, { m: "Jun", v: 0.44 },
  { m: "Jul", v: 0.50 },
];
const oxygenData = [
  { r: "Pacific", v: 7.2 }, { r: "Atlantic", v: 6.4 },
  { r: "Indian",  v: 5.9 }, { r: "Southern", v: 9.8 },
  { r: "Arctic",  v: 11.2 }, { r: "Mediter.", v: 5.6 },
];
const radarData = [
  { s: "Reefs",       v: 62 }, { s: "Biodiversity", v: 74 },
  { s: "Currents",    v: 58 }, { s: "Water Purity", v: 40 },
  { s: "Sensors",     v: 81 }, { s: "pH Balance",   v: 65 },
];
const speciesData = [
  { name: "Cetaceans", v: 84 }, { name: "Coral",    v: 52 },
  { name: "Fish",      v: 71 }, { name: "Plankton",  v: 90 },
  { name: "Mollusks",  v: 63 }, { name: "Sharks",    v: 48 },
];

const tt = { contentStyle: { background: "#071A2F", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, fontSize: 10, color: "#E8F4FD" } };

function Widget({ title, subtitle, children, colSpan = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; colSpan?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`glass-ocean rounded-2xl p-5 overflow-hidden ${colSpan}`}
    >
      <div className="mb-4">
        <div className="text-[0.6rem] font-mono text-mist uppercase tracking-wider">{title}</div>
        {subtitle && <div className="text-[0.6rem] text-mist/50 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </motion.div>
  );
}

export default function OceanCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Temperature Anomaly — wide */}
      <Widget title="Sea Surface Temperature Anomaly" subtitle="°C above pre-industrial baseline" colSpan="xl:col-span-2">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={tempData}>
            <defs>
              <linearGradient id="ocTG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#FF9F1C" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF9F1C" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis dataKey="m" stroke="#94A3B840" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B840" fontSize={10} tickLine={false} axisLine={false} width={26} />
            <Tooltip {...tt} />
            <Area type="monotone" dataKey="v" stroke="#FF9F1C" fill="url(#ocTG)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Widget>

      {/* Biosphere Radar */}
      <Widget title="Global Biosphere Index">
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(78,205,196,0.08)" />
            <PolarAngleAxis dataKey="s" stroke="#94A3B880" fontSize={9} />
            <Radar dataKey="v" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.22} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </Widget>

      {/* Ocean Health Ring */}
      <Widget title="Global Ocean Health Score">
        <div className="flex flex-col items-center justify-center h-[180px] gap-3">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#hg)" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${(74 / 100) * 263.9} 263.9`} />
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4ECDC4" />
                  <stop offset="100%" stopColor="#0096B7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-2xl text-pearl">74</span>
              <span className="text-[0.58rem] text-mist font-mono">/100</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-seafoam">Moderate Health</div>
            <div className="text-[0.6rem] text-mist mt-0.5">Requires sustained conservation effort</div>
          </div>
        </div>
      </Widget>

      {/* Oxygen by Region */}
      <Widget title="Dissolved Oxygen by Region" subtitle="mg/L — optimal range 6–10" colSpan="xl:col-span-2">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={oxygenData} barSize={24}>
            <XAxis dataKey="r" stroke="#94A3B840" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B840" fontSize={9} tickLine={false} axisLine={false} width={22} domain={[0, 14]} />
            <Tooltip {...tt} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {oxygenData.map((entry, i) => (
                <Cell key={i} fill={entry.v >= 9 ? "#2ECC71" : entry.v >= 6.5 ? "#4ECDC4" : "#FF9F1C"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Widget>

      {/* Species Vitality */}
      <Widget title="Marine Species Group Vitality">
        <div className="space-y-3 mt-1">
          {speciesData.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[0.62rem] text-mist font-mono">{s.name}</span>
                <span className="text-[0.62rem] font-mono font-bold" style={{
                  color: s.v >= 80 ? "#2ECC71" : s.v >= 60 ? "#4ECDC4" : "#FF9F1C"
                }}>{s.v}%</span>
              </div>
              <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.v}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded"
                  style={{
                    background: s.v >= 80
                      ? "linear-gradient(90deg, #2ECC71, #4ECDC4)"
                      : s.v >= 60
                      ? "linear-gradient(90deg, #4ECDC4, #0096B7)"
                      : "linear-gradient(90deg, #FF9F1C, #FF6B6B)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {/* Ocean Current Activity */}
      <Widget title="Major Ocean Currents Activity">
        <div className="relative h-40 rounded-xl overflow-hidden border border-seafoam/8">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #0B2240, #020e1c)" }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160">
              {/* Gulf Stream */}
              <path d="M10,90 Q75,50 150,85 Q225,120 290,70" stroke="#4ECDC4" strokeWidth="1.5" fill="none" strokeDasharray="6 3" opacity="0.7" />
              {/* North Atlantic Drift */}
              <path d="M10,110 Q100,65 180,95 Q240,115 290,90" stroke="#0096B7" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.5" />
              {/* Kuroshio */}
              <path d="M220,130 Q240,80 260,50 Q270,30 290,40" stroke="#4ECDC4" strokeWidth="1" fill="none" strokeDasharray="5 5" opacity="0.45" />
              {/* Southern Ocean Circumpolar */}
              <path d="M0,135 Q150,145 300,135" stroke="#7FFFD4" strokeWidth="0.8" fill="none" strokeDasharray="3 6" opacity="0.4" />
              {/* Dots for current markers */}
              <circle cx="150" cy="85" r="4" fill="none" stroke="#4ECDC4" strokeWidth="1.2" opacity="0.8" />
              <circle cx="65"  cy="60" r="3" fill="#0096B7" opacity="0.7" />
              <circle cx="240" cy="75" r="3" fill="#2ECC71" opacity="0.7" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-2 text-[0.56rem] font-mono text-mist/35">
            Global thermohaline circulation
          </div>
        </div>
      </Widget>
    </div>
  );
}
