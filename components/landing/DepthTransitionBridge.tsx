"use client";

import { motion } from "framer-motion";
import { ChevronDown, Waves, Compass, ShieldCheck } from "lucide-react";

interface DepthBridgeProps {
  fromZone: string;
  toZone: string;
  depthLabel: string;
  narrative: string;
  accentColor?: string;
}

export default function DepthTransitionBridge({
  fromZone,
  toZone,
  depthLabel,
  narrative,
  accentColor = "#85ECD4",
}: DepthBridgeProps) {
  return (
    <div className="relative w-full py-16 px-6 overflow-hidden pointer-events-none select-none z-10">
      {/* Background depth blend gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${accentColor}10 0%, transparent 80%)`,
        }}
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
        {/* Vertical laser depth connector line */}
        <div className="relative w-px h-14 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <motion.div
            animate={{ y: [0, 48, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-1 h-3 rounded-full -left-[1.5px] relative"
            style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />
        </div>

        {/* Depth Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-abyss/80 backdrop-blur-md shadow-2xl"
        >
          <Compass className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="font-mono text-[0.65rem] tracking-[0.25em] text-pearl/90 uppercase font-semibold">
            {depthLabel}
          </span>
          <div className="w-1 h-1 rounded-full" style={{ background: accentColor }} />
          <span className="font-mono text-[0.6rem] text-mist/60 uppercase">
            {fromZone} → {toZone}
          </span>
        </motion.div>

        {/* Narrative phrase */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-3 text-xs md:text-sm text-mist/70 max-w-lg leading-relaxed font-light tracking-wide"
        >
          {narrative}
        </motion.p>
      </div>
    </div>
  );
}
