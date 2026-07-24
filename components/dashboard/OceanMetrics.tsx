"use client";

import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const METRICS = [
  { label: "Ocean Health Index",      value: "74",    unit: "/100", note: "−3 pts this week",    color: "#85ECD4", spark: [82,80,79,77,78,75,74],  status: "warn" as const  },
  { label: "Average Ocean pH",        value: "8.05",  unit: "",     note: "−0.02 since 2020",    color: "#FF9F1C", spark: [8.12,8.1,8.09,8.08,8.07,8.06,8.05], status: "warn" as const  },
  { label: "Coral Reef Coverage",     value: "58",    unit: "%",    note: "−6% from baseline",   color: "#E8694A", spark: [70,68,65,63,62,59,58],  status: "crit" as const  },
  { label: "Marine Biodiversity",     value: "71",    unit: "%",    note: "Stable since March", color: "#85ECD4", spark: [68,70,71,70,72,71,71],  status: "good" as const  },
  { label: "Surface Temp. Anomaly",   value: "+1.4",  unit: "°C",   note: "+0.2°C above avg.",   color: "#FF9F1C", spark: [0.8,0.9,1.0,1.1,1.2,1.35,1.4], status: "warn" as const  },
  { label: "Active Ocean Sensors",    value: "2,318", unit: "",     note: "+14 added today",     color: "#85ECD4", spark: [2240,2260,2275,2290,2300,2310,2318], status: "good" as const  },
];

const statusDot = { good: "#85ECD4", warn: "#FF9F1C", crit: "#E8694A" } as const;

export default function OceanMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="group relative rounded-2xl p-4 overflow-hidden border transition-all duration-300"
          style={{ background: "rgba(4,13,20,0.6)", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="relative z-10 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-[0.58rem] font-mono tracking-wide text-mist/60 uppercase leading-snug">{m.label}</span>
              <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: statusDot[m.status], boxShadow: `0 0 6px ${statusDot[m.status]}` }} />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-bold text-2xl leading-none" style={{ color: m.color }}>{m.value}</span>
              {m.unit && <span className="text-xs text-mist/60 font-mono">{m.unit}</span>}
            </div>
            <div className="h-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.spark.map((v, idx) => ({ idx, v }))}>
                  <Line type="monotone" dataKey="v" stroke={m.color} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[0.56rem] font-mono text-mist/40">{m.note}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
