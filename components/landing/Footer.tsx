"use client";

import Link from "next/link";
import { ExternalLink, Share2, Globe } from "lucide-react";

const LINKS = {
  Explore: ["Ocean Explorer", "Live Ocean Watch", "Coral Reef Map", "Species Tracker"],
  Science: ["Data Methodology", "Research Partners", "Publications", "Open Data"],
  Organization: ["About Us", "Press", "Conservation Partners", "Contact"],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-seafoam/8 bg-abyss">
      {/* Gentle wave top */}
      <div className="pointer-events-none -mt-1">
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,0 L0,0 Z" fill="#041524" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 rounded-full border border-seafoam/60" style={{ boxShadow: "0 0 10px rgba(78,205,196,0.3)" }} />
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-seafoam to-shallow" />
              </div>
              <span className="font-display font-bold text-pearl tracking-tight text-sm">DeepSea Guardian</span>
            </div>
            <p className="text-mist text-sm leading-relaxed max-w-xs">
              A global ocean observation platform built for marine scientists, conservation organizations, and environmental policymakers.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[Globe, ExternalLink, Share2].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-mist hover:text-seafoam hover:border-seafoam/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-3 gap-8">
            {Object.entries(LINKS).map(([cat, items]) => (
              <div key={cat} className="space-y-4">
                <h4 className="font-mono text-[0.62rem] tracking-[0.2em] text-mist uppercase">{cat}</h4>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <span className="text-sm text-mist/60 hover:text-pearl transition-colors duration-200 cursor-pointer">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.7rem] font-mono text-mist/40">© 2026 DeepSea Guardian. Protecting Earth's Oceans.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Data License"].map((i) => (
              <span key={i} className="text-[0.68rem] text-mist/35 hover:text-mist transition-colors cursor-pointer">{i}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
