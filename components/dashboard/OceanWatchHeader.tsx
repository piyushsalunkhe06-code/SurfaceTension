"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Waves, Home, Compass } from "lucide-react";

export default function OceanWatchHeader() {
  return (
    <header className="border-b border-white/5 bg-abyss/90 backdrop-blur-xl px-6 py-4">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-mist hover:text-pearl transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg border border-seafoam/30 bg-seafoam/10 flex items-center justify-center">
              <Waves className="w-3.5 h-3.5 text-seafoam" />
            </div>
            <div>
              <h1 className="font-display font-bold text-pearl text-base tracking-tight leading-none">Ocean Watch</h1>
              <p className="text-[0.58rem] font-mono text-mist/50 mt-0.5">Real-Time Marine Observation Suite</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[0.62rem] text-mist/50">
            <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-foam" />
            <span>2,318 Sensor Streams Active</span>
          </div>

          <Link
            href="/explorer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs font-display font-medium text-pearl hover:border-seafoam/40 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-seafoam" />
            Open 3D Explorer
          </Link>
        </div>
      </div>
    </header>
  );
}
