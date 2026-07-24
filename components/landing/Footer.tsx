"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-abyss border-t border-white/5 py-16 px-6 text-mist text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-seafoam/30 bg-seafoam/10 flex items-center justify-center">
              <Waves className="w-4 h-4 text-seafoam" />
            </div>
            <span className="font-display font-bold text-pearl text-lg tracking-tight">DeepSea Guardian</span>
          </div>
          <p className="text-mist/60 text-xs leading-relaxed">
            An Ocean Intelligence Platform providing continuous environmental observations, biodiversity tracking, and predictive climate modeling for marine researchers and environmental organizations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 font-mono text-xs">
          <div className="space-y-3">
            <div className="text-pearl font-bold uppercase tracking-wider text-[0.65rem] text-foam/70">Navigation</div>
            <ul className="space-y-2 text-mist/60">
              <li><Link href="/" className="hover:text-pearl transition-colors">Home</Link></li>
              <li><Link href="/explorer" className="hover:text-pearl transition-colors">Ocean Explorer</Link></li>
              <li><Link href="/dashboard" className="hover:text-pearl transition-colors">Ocean Watch</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-pearl font-bold uppercase tracking-wider text-[0.65rem] text-foam/70">Observation</div>
            <ul className="space-y-2 text-mist/60">
              <li>Sea Surface Temp</li>
              <li>Acidification & pH</li>
              <li>Reef Vitality</li>
              <li>Biodiversity Index</li>
            </ul>
          </div>

          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="text-pearl font-bold uppercase tracking-wider text-[0.65rem] text-foam/70">Network</div>
            <p className="text-mist/50 text-[0.7rem] leading-relaxed">
              Connected to 2,318 active sensor arrays across Pacific, Atlantic, Indian, Southern, and Arctic Basins.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-mist/40 font-mono">
        <div>© 2026 DeepSea Guardian. All rights reserved.</div>
        <div className="mt-2 sm:mt-0">Earth Ocean Monitoring System</div>
      </div>
    </footer>
  );
}
