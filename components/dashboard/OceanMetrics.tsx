"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const METRICS = [
  { label: "Ocean Health Index",      value: "74",    unit: "/100",  trend: "down" as const, note: "−3 pts this week",    color: "#4ECDC4",  spark: [82,80,79,77,78,75,74],  status: "warn" as const  },
  { label: "Average Ocean pH",        value: "8.05",  unit: "",      trend: "down" as const, note: "−0.02 since 2020",    color: "#FF9F1C",  spark: [8.12,8.1,8.09,8.08,8.07,8.06,8.05], status: "warn" as const  },
  { label: "Coral Reef Coverage",     value: "58",    unit: "%",     trend: "down" as const, note: "−6% from baseline",   color: "#FF6B6B",  spark: [70,68,65,63,62,59,58],  status: "crit" as const  },
  { label: "Marine Biodiversity",     value: "71",    unit: "%",     trend: "stable" as const, note: "Stable since March", color: "#2ECC71", spark: [68,70,71,70,72,71,71],  status: "good" as const  },
  { label: "Surface Temp. Anomaly",   value: "+1.4",  unit: "°C",    trend: "up" as const,   note: "+0.2°C above avg.",   color: "#FF9F1C",  spark: [0.8,0.9,1.0,1.1,1.2,1.35,1.4], status: "warn" as const  },
  { label: "Active Ocean Sensors",    value: "2,318", unit: "",      trend: "up" as const,   note: "+14 added today",     color: "#4ECDC4",  spark: [2240,2260,2275,2290,2300,2310,2318], status: "good" as const  },
];

const statusDot = { good: "#2ECC71", warn: "#FF9F1C", crit: "#FF6B6B" } as const;

export default function OceanMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          className="group relative glass-ocean rounded-2xl p-4 overflow-hidden hover:border-seafoam/20 transition-all duration-300"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at 30% 20%, ${m.color}15, transparent 65%)` }} />
          <div className="relative z-10 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-[0.58rem] font-mono tracking-wide text-mist uppercase leading-snug">{m.label}</span>
              <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: statusDot[m.status], boxShadow: `0 0 4px ${statusDot[m.status]}` }} />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-bold text-2xl leading-none" style={{ color: m.color, textShadow: `0 0 10px ${m.color}44` }}>{m.value}</span>
              {m.unit && <span className="text-xs text-mist font-mono">{m.unit}</span>}
            </div>
            {/* Sparkline */}
            <ResponsiveContainer width="100%" height={32}>
              <LineChart data={m.spark.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke={m.color} strokeWidth={1.5} dot={false} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
            {/* Trend */}
            <div className="flex items-center gap-1">
              {m.trend === "up"     && <TrendingUp   className="w-3 h-3 text-orange-400" />}
              {m.trend === "down"   && <TrendingDown  className="w-3 h-3 text-red-400"    />}
              {m.trend === "stable" && <Minus         className="w-3 h-3 text-emerald-400" />}
              <span className="text-[0.58rem] text-mist/70">{m.note}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
