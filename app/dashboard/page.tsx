"use client";

import dynamic from "next/dynamic";
import OceanWatchHeader from "@/components/dashboard/OceanWatchHeader";
import OceanMetrics from "@/components/dashboard/OceanMetrics";
import OceanCharts from "@/components/dashboard/OceanCharts";
import MarineAlerts from "@/components/dashboard/MarineAlerts";
import OceanInsights from "@/components/dashboard/OceanInsights";
import OceanTimeline from "@/components/dashboard/OceanTimeline";

const BiolumScene = dynamic(() => import("@/components/3d/BiolumScene"), { ssr: false });

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0A2440 0%, #050E1A 65%)" }}
    >
      {/* 3D bioluminescent ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <BiolumScene height="h-full" />
      </div>

      {/* Dashboard Header */}
      <div className="relative z-10">
        <OceanWatchHeader />
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 relative z-10 px-6 md:px-10 py-8 space-y-8 max-w-[1600px] mx-auto w-full">

        {/* ── Section 1: Global Health Metrics ───────────── */}
        <section>
          <div className="font-mono text-[0.6rem] tracking-[0.22em] text-mist uppercase mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-seafoam/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-seafoam" />
            </div>
            Global Ocean Health Metrics
          </div>
          <OceanMetrics />
        </section>

        {/* ── Section 2: Ocean Intelligence Charts ────────── */}
        <section>
          <div className="font-mono text-[0.6rem] tracking-[0.22em] text-mist uppercase mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-seafoam/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-seafoam" />
            </div>
            Ocean Science Overview
          </div>
          <OceanCharts />
        </section>

        {/* ── Section 3: Alerts + Timeline ────────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-7">
          <div>
            <div className="font-mono text-[0.6rem] tracking-[0.22em] text-mist uppercase mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-coral/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-coral" />
              </div>
              Environmental Concerns
            </div>
            <MarineAlerts />
          </div>
          <div>
            <div className="font-mono text-[0.6rem] tracking-[0.22em] text-mist uppercase mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-seafoam/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-seafoam" />
              </div>
              Today's Ocean Events
            </div>
            <OceanTimeline />
          </div>
        </section>

        {/* ── Section 4: Insights + Query ─────────────────── */}
        <section>
          <div className="font-mono text-[0.6rem] tracking-[0.22em] text-mist uppercase mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-seafoam/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-seafoam" />
            </div>
            Ocean Insights &amp; Query
          </div>
          <OceanInsights />
        </section>

        {/* Footer bar */}
        <div className="pt-5 pb-3 border-t border-white/5 flex items-center justify-between">
          <span className="font-mono text-[0.58rem] text-mist/35">
            DeepSea Guardian · Ocean Watch · All sensor streams active · Updated just now
          </span>
          <span className="font-mono text-[0.58rem] text-kelp/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-kelp" style={{ boxShadow: "0 0 5px #2ECC71" }} />
            Systems Nominal
          </span>
        </div>
      </main>
    </div>
  );
}
