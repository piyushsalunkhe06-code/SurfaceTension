"use client";

import { motion } from "framer-motion";
import { Satellite, Thermometer, Fish, AlertTriangle, Database, Droplets, Wind, Leaf } from "lucide-react";

const EVENTS = [
  { time: "08:12", title: "Oil Contamination Detected",      desc: "SAR imagery confirms 2.3 km² surface slick in Gulf of Mexico. Coastal monitoring activated.",       icon: <AlertTriangle className="w-3 h-3" />, color: "#FF6B6B" },
  { time: "09:30", title: "Coral Thermal Stress Update",     desc: "Maldives reef thermal stress report refreshed. 62% of monitored reefs above bleaching threshold.",  icon: <Droplets className="w-3 h-3" />,     color: "#FF9F1C" },
  { time: "10:20", title: "Satellite Data Sync Complete",    desc: "Sentinel-6 sea surface height and temperature pass ingested across all five ocean basins.",           icon: <Satellite className="w-3 h-3" />,    color: "#4ECDC4" },
  { time: "11:05", title: "Arctic Temperature Anomaly",      desc: "Beaufort Sea surface anomaly +1.8°C. Ice sheet fracture advisory issued. Coverage down 18%.",        icon: <Thermometer className="w-3 h-3" />,  color: "#FF9F1C" },
  { time: "12:10", title: "Bluefin Tuna Migration Shift",    desc: "Pacific Bluefin trajectory revised 120 km northward. Correlates with warm water expansion.",        icon: <Fish className="w-3 h-3" />,         color: "#4ECDC4" },
  { time: "13:48", title: "Ocean Health Forecast Updated",   desc: "2026 health projections recalculated. Three regions reclassified to 'Concerning'. Trends persist.", icon: <Database className="w-3 h-3" />,     color: "#7FFFD4" },
  { time: "14:25", title: "Seagrass Recovery Signal",        desc: "Mediterranean Posidonia beds show 4% recovery in protected zones. Positive conservation signal.",     icon: <Leaf className="w-3 h-3" />,        color: "#2ECC71" },
];

export default function OceanTimeline() {
  return (
    <div className="glass-ocean rounded-2xl p-5">
      <div className="font-mono text-[0.6rem] tracking-[0.2em] text-mist uppercase mb-5">
        Today's Ocean Events
      </div>

      <div className="relative pl-5">
        <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-white/5" />

        <div className="space-y-5">
          {EVENTS.map((ev, i) => (
            <motion.div
              key={ev.time}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="relative flex gap-4 group"
            >
              {/* Node */}
              <div
                className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}55`, color: ev.color }}
              >
                {ev.icon}
              </div>

              <div className="flex-1 space-y-1 pb-4 border-b border-white/[0.03] last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.62rem] font-bold" style={{ color: ev.color }}>{ev.time}</span>
                  <span className="text-sm font-semibold text-pearl">{ev.title}</span>
                </div>
                <p className="text-xs text-mist leading-relaxed">{ev.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
