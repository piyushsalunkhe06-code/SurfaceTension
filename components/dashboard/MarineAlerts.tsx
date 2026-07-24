"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Clock, MapPin } from "lucide-react";

const ALERTS = [
  { id: "a1", type: "Coral Bleaching",        region: "Maldives Arc, Indian Ocean",    level: "Critical", time: "12:14 today",  detail: "Sea surface temperature 2.1°C above summer maximum. Risk of mass bleaching within 14 days. 80% of monitored reefs showing thermal stress.", coords: "4.17° N, 73.50° E",  color: "#FF6B6B" },
  { id: "a2", type: "Oil Contamination",       region: "Gulf of Mexico — Block 23",     level: "High",     time: "08:47 today",  detail: "Surface slick estimated at 2.3 km². Dispersal modeling indicates westward drift toward Louisiana coastline.", coords: "27.8° N, 89.4° W",   color: "#FF9F1C" },
  { id: "a3", type: "Microplastic Surge",      region: "North Atlantic Gyre",           level: "High",     time: "Yesterday",    detail: "34% concentration increase detected via satellite spectral analysis. Gyral accumulation reaching record density.", coords: "31.0° N, 38.0° W",   color: "#FF9F1C" },
  { id: "a4", type: "Sea Ice Reduction",       region: "Arctic Ocean — Beaufort Sea",   level: "Moderate", time: "Yesterday",    detail: "Multi-year ice sheet fracture detected. 420 km² calved. 18% below seasonal norm. Albedo feedback accelerating.", coords: "74.3° N, 140.0° W",  color: "#4ECDC4" },
  { id: "a5", type: "Harmful Algal Bloom",     region: "Baltic Sea — Gulf of Finland",  level: "Moderate", time: "2 days ago",   detail: "Cyanobacteria bloom covering 1,200 km². Oxygen depletion in lower water column. Fishery closures advised.", coords: "60.1° N, 25.2° E",   color: "#4ECDC4" },
];

export default function MarineAlerts() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="glass-ocean rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-coral" />
          <span className="font-mono text-[0.62rem] tracking-[0.2em] text-mist uppercase">Environmental Concerns</span>
        </div>
        <span className="text-[0.6rem] font-mono text-coral px-2 py-1 rounded-full border border-coral/30 bg-coral/10">
          {ALERTS.filter((a) => a.level === "Critical" || a.level === "High").length} Priority
        </span>
      </div>

      <div className="space-y-2.5">
        {ALERTS.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-xl overflow-hidden cursor-pointer"
            style={{ background: `${alert.color}0a`, border: `1px solid ${alert.color}28` }}
            onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.3 }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: alert.color, boxShadow: `0 0 6px ${alert.color}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-pearl text-sm">{alert.type}</span>
                  <span className="text-[0.56rem] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border" style={{ color: alert.color, borderColor: `${alert.color}40` }}>{alert.level}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-mist truncate">{alert.region}</span>
                  <span className="text-[0.6rem] text-mist/50 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{alert.time}</span>
                </div>
              </div>
              {expanded === alert.id ? <ChevronUp className="w-4 h-4 text-mist flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-mist flex-shrink-0" />}
            </div>
            <AnimatePresence>
              {expanded === alert.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-white/5">
                    <p className="text-sm text-mist leading-relaxed">{alert.detail}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-[0.58rem] text-mist/40"><MapPin className="w-2.5 h-2.5" />{alert.coords}</span>
                      <button className="flex items-center gap-1 text-[0.6rem] font-mono hover:text-pearl transition-colors" style={{ color: alert.color }}>View on Explorer <ExternalLink className="w-3 h-3" /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
