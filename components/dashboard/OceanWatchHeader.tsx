"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Home, Bell, Search, Waves, User, Map } from "lucide-react";

export default function OceanWatchHeader() {
  const now = new Date();
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-seafoam/8 flex-shrink-0" style={{ background: "rgba(5,14,26,0.9)", backdropFilter: "blur(16px)" }}>
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border border-seafoam/60" style={{ boxShadow: "0 0 10px rgba(78,205,196,0.3)" }} />
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-seafoam to-shallow" />
          </div>
          <span className="font-display font-bold text-pearl text-sm">DeepSea Guardian</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/8">
          <Waves className="w-3.5 h-3.5 text-seafoam" />
          <span className="font-mono text-[0.62rem] tracking-widest text-mist uppercase">Ocean Watch</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 2.2 }} className="w-1.5 h-1.5 rounded-full bg-kelp" />
          <span className="font-mono text-[0.6rem] text-kelp tracking-widest uppercase">All Systems Active</span>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 bg-white/[0.02] w-60">
        <Search className="w-3.5 h-3.5 text-mist" />
        <input type="text" placeholder="Search reefs, species, regions..." className="bg-transparent text-xs text-pearl placeholder:text-mist/40 focus:outline-none w-full" />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <div className="text-[0.62rem] font-mono text-mist">{now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
          <div className="text-sm font-mono font-bold text-seafoam">{now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <button className="relative p-2 rounded-lg border border-white/8 text-mist hover:text-seafoam transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-coral" />
        </button>
        <Link href="/explorer" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/8 text-mist hover:text-seafoam hover:border-seafoam/40 text-xs transition-all">
          <Map className="w-3.5 h-3.5" /> Explorer
        </Link>
        <div className="w-8 h-8 rounded-full border border-seafoam/30 bg-seafoam/10 flex items-center justify-center">
          <User className="w-4 h-4 text-seafoam" />
        </div>
      </div>
    </div>
  );
}
