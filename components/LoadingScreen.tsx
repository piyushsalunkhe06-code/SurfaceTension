"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FACTS = [
  "🐋 Blue whales — the largest animals on Earth — live in our oceans.",
  "🌊 The ocean produces 50% of Earth's oxygen through marine plants.",
  "🐚 97% of Earth's water is held in the ocean.",
  "🪸 Coral reefs cover less than 1% of the ocean but support 25% of all marine species.",
  "🐬 The ocean depths remain more unexplored than the surface of the Moon.",
];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress,   setProgress]   = useState(0);
  const [factIndex,  setFactIndex]  = useState(0);
  const [leaving,    setLeaving]    = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); return 100; }
        return p + Math.random() * 4 + 1;
      });
    }, 60);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => { setLeaving(true); setTimeout(onDone, 800); }, 300);
    }
  }, [progress, onDone]);

  useEffect(() => {
    const iv = setInterval(() => setFactIndex((i) => (i + 1) % FACTS.length), 2400);
    return () => clearInterval(iv);
  }, []);

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 40%, #0B2240 0%, #050E1A 70%)" }}
        >
          {/* Floating bubbles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                width:  `${4 + Math.random() * 12}px`,
                height: `${4 + Math.random() * 12}px`,
                left:   `${Math.random() * 100}%`,
                bottom: `-20px`,
                animationDuration: `${6 + Math.random() * 10}s`,
                animationDelay:    `${Math.random() * 6}s`,
              }}
            />
          ))}

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Ocean orb */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="relative w-20 h-20"
            >
              <div className="absolute inset-0 rounded-full" style={{
                background: "radial-gradient(circle at 35% 30%, #7FFFD4 0%, #4ECDC4 35%, #0096B7 65%, #0B2240 100%)",
                boxShadow: "0 0 40px rgba(78,205,196,0.5), 0 0 80px rgba(0,150,183,0.25)",
              }} />
              <div className="absolute inset-[3px] rounded-full border border-white/20" />
            </motion.div>

            <div className="text-center space-y-1">
              <h1 className="font-display font-bold text-pearl text-2xl tracking-tight">DeepSea Guardian</h1>
              <p className="text-mist text-sm font-mono">Connecting to ocean data streams...</p>
            </div>

            {/* Ocean fact */}
            <div className="mt-2 h-10 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={factIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-mist/70 text-xs text-center max-w-xs"
                >
                  {FACTS[factIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-56">
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: "linear-gradient(90deg, #4ECDC4, #0096B7, #7FFFD4)",
                    boxShadow: "0 0 10px rgba(78,205,196,0.6)",
                    transition: "width 0.1s ease",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[0.6rem] font-mono text-mist/40">Loading ocean systems</span>
                <span className="text-[0.6rem] font-mono text-seafoam">{Math.min(Math.round(progress), 100)}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
