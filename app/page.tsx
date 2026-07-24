"use client";

import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";
import OceanStats from "@/components/landing/OceanStats";
import OceanCrisis from "@/components/landing/OceanCrisis";
import WhatWeMonitor from "@/components/landing/WhatWeMonitor";
import OceanDataPreview from "@/components/landing/OceanDataPreview";
import ProtectTheDeep from "@/components/landing/ProtectTheDeep";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <SmoothScroll>
        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease" }}>
          <Navbar />
          {/* 1. Hero with 3D Earth globe */}
          <Hero />
          {/* 2. Ocean Stats strip with 3D wave background */}
          <OceanStats />
          {/* 3. Crisis section with 3D bioluminescent deep */}
          <OceanCrisis />
          {/* 4. What We Monitor with 3D coral reef */}
          <WhatWeMonitor />
          {/* 5. Data charts with 3D wave bg */}
          <OceanDataPreview />
          {/* 6. Protect the Deep with 3D biolum bg */}
          <ProtectTheDeep />
          {/* 7. Footer */}
          <Footer />
        </div>
      </SmoothScroll>
    </>
  );
}
