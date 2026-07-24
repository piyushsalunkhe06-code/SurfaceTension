"use client";

import dynamic from "next/dynamic";
import GlassCard from "./ui/GlassCard";
import Particles from "./Particles";

const UnderwaterScene = dynamic(() => import("./UnderwaterScene"), { ssr: false });

const layers = [
  {
    tag: "Layer 01",
    title: "Coral & Reef Health",
    body: "Real-time bleaching risk from thermal stress models across every mapped reef system.",
    glow: "#00D084",
  },
  {
    tag: "Layer 02",
    title: "Marine Migration",
    body: "Whale, turtle, and fish population movement tracked and forecast from acoustic and satellite tags.",
    glow: "#00E5FF",
  },
  {
    tag: "Layer 03",
    title: "Currents & Circulation",
    body: "Ocean current simulation reveals heat transport and nutrient cycling at planetary scale.",
    glow: "#0A4D8C",
  },
];

export default function DiveSection() {
  return (
    <section
      className="relative min-h-[160vh] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #031B34 0%, #005F73 35%, #012a3a 70%, #031B34 100%)",
      }}
    >
      <div className="sticky top-0 h-screen">
        <UnderwaterScene />
      </div>

      <Particles count={34} kind="bubble" />
      <Particles count={16} kind="glow" color="#00D084" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(0,229,255,0.05) 0 2px, transparent 2px 40px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-40 px-6 -mt-[100vh] pt-24">
        {layers.map((l, i) => (
          <GlassCard key={l.tag} glow={l.glow} className="max-w-xl text-left" delay={i * 0.1}>
            <div className="font-mono text-[0.7rem] text-marine tracking-[0.2em] mb-2.5">
              {l.tag}
            </div>
            <h3 className="font-display text-2xl text-soft mb-2.5">{l.title}</h3>
            <p className="text-muted text-[0.95rem] leading-relaxed">{l.body}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
