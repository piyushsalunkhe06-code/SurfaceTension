"use client";

import Hero from "@/components/Hero";
import OceanPulse from "@/components/landing/OceanPulse";
import OceanCrisis from "@/components/landing/OceanCrisis";
import WhatWeMonitor from "@/components/landing/WhatWeMonitor";
import OceanDataPreview from "@/components/landing/OceanDataPreview";
import ProtectTheDeep from "@/components/landing/ProtectTheDeep";
import Footer from "@/components/landing/Footer";
import DepthTransitionBridge from "@/components/landing/DepthTransitionBridge";

export default function Home() {
  return (
    <div className="bg-abyss text-pearl min-h-screen overflow-x-hidden relative">
      {/* SECTION 1: Space -> Earth -> Dive into ocean */}
      <Hero />

      {/* BRIDGE 1: Surface to Photics Zone */}
      <DepthTransitionBridge
        depthLabel="DEPTH 0M → 200M"
        fromZone="EPIPELAGIC"
        toZone="PHOTIC ZONE"
        narrative="Descending past the wave surface into the upper photic layer where 90% of marine life interacts with solar energy."
        accentColor="#85ECD4"
      />

      {/* SECTION 2: Ocean Surface Pulse — living water simulation */}
      <OceanPulse />

      {/* BRIDGE 2: Photics to Coral Reef Ecosystems */}
      <DepthTransitionBridge
        depthLabel="DEPTH 200M → 1,000M"
        fromZone="SUNLIGHT ZONE"
        toZone="MESOPELAGIC"
        narrative="Transitioning to twilight reef habitats facing record thermal pressure and ocean acidification."
        accentColor="#E8694A"
      />

      {/* SECTION 3: Ocean Crisis — underwater coral ecosystem & threat narration */}
      <OceanCrisis />

      {/* BRIDGE 3: Mesopelagic to Abyssal Sentinel Grid */}
      <DepthTransitionBridge
        depthLabel="DEPTH 1,000M → 4,000M"
        fromZone="TWILIGHT ZONE"
        toZone="ABYSSAL PLAIN"
        narrative="Plunging into total darkness where autonomous gliders and hydrophone arrays monitor deep thermohaline circulation."
        accentColor="#2EC4E0"
      />

      {/* SECTION 4: Deep Ocean Monitoring — floating observation stream list */}
      <WhatWeMonitor />

      {/* BRIDGE 4: Abyssal to Hadal Science Editorial */}
      <DepthTransitionBridge
        depthLabel="DEPTH 4,000M → 11,000M"
        fromZone="ABYSSAL"
        toZone="HADAL TRENCH"
        narrative="Synthesizing multi-spectral satellite radar and deep sea trench sensor feeds into predictive planetary intelligence."
        accentColor="#FF9F1C"
      />

      {/* SECTION 5: Ocean Intelligence Preview — magazine data editorial */}
      <OceanDataPreview />

      {/* BRIDGE 5: Planetary Shield */}
      <DepthTransitionBridge
        depthLabel="GLOBAL PLANETARY DEFENSE"
        fromZone="OBSERVATION"
        toZone="ACTION SHIELD"
        narrative="Uniting global marine science, autonomous robotics, and AI to safeguard Earth's ocean for generations."
        accentColor="#85ECD4"
      />

      {/* SECTION 6: Call to Action — full bleed cinematic spread */}
      <ProtectTheDeep />

      {/* Footer */}
      <Footer />
    </div>
  );
}
