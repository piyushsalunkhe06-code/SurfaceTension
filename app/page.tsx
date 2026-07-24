"use client";

import Hero from "@/components/Hero";
import OceanPulse from "@/components/landing/OceanPulse";
import OceanCrisis from "@/components/landing/OceanCrisis";
import WhatWeMonitor from "@/components/landing/WhatWeMonitor";
import OceanDataPreview from "@/components/landing/OceanDataPreview";
import ProtectTheDeep from "@/components/landing/ProtectTheDeep";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-abyss text-pearl min-h-screen overflow-x-hidden">
      {/* SECTION 1: Space -> Earth -> Dive into ocean */}
      <Hero />

      {/* SECTION 2: Ocean Surface Pulse — living water simulation */}
      <OceanPulse />

      {/* SECTION 3: Ocean Crisis — underwater coral ecosystem & threat narration */}
      <OceanCrisis />

      {/* SECTION 4: Deep Ocean Monitoring — floating observation stream list */}
      <WhatWeMonitor />

      {/* SECTION 5: Ocean Intelligence Preview — magazine data editorial */}
      <OceanDataPreview />

      {/* SECTION 6: Call to Action — full bleed cinematic spread */}
      <ProtectTheDeep />

      {/* Footer */}
      <Footer />
    </div>
  );
}
