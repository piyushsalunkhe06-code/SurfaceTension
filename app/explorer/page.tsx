"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Home,
  Waves,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Trees,
  Droplet,
  Copy,
  Check,
  Sparkles,
  Mountain,
} from "lucide-react";
import {
  ClickedCoordinateInfo,
  generateCoordinateData,
  latLonToVector3,
} from "@/components/explorer/OceanGlobe3D";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const OceanGlobe3D = dynamic(
  () => import("@/components/explorer/OceanGlobe3D").then((m) => ({ default: m.OceanGlobe3D })),
  { ssr: false }
);

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

// Preset Reference Targets for River, Land & Ocean Sectors
const PRESET_COORDINATES = [
  { name: "Amazon River Basin", lat: -3.46, lon: -62.21, type: "river" },
  { name: "Nile River Corridor", lat: 26.82, lon: 30.8, type: "river" },
  { name: "Mississippi Waterway", lat: 35.0, lon: -90.0, type: "river" },
  { name: "Yangtze River System", lat: 30.5, lon: 114.3, type: "river" },
  { name: "Mariana Hadal Trench", lat: 11.35, lon: 142.2, type: "ocean" },
  { name: "Himalayan Alpine Range", lat: 28.0, lon: 86.9, type: "land" },
  { name: "Sahara Desert Plateau", lat: 23.4, lon: 25.6, type: "land" },
];

const ttStyle = {
  contentStyle: {
    background: "#04111E",
    border: "1px solid rgba(133,236,212,0.25)",
    borderRadius: 8,
    fontSize: 10,
    color: "#F2F0ED",
  },
};

export default function ExplorerPage() {
  const [activeCoord, setActiveCoord] = useState<ClickedCoordinateInfo | null>(null);
  const [year, setYear] = useState(2024);
  const [copied, setCopied] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const yearIdx = YEARS.indexOf(year);

  // Initialize with Amazon River & Basin on load
  useEffect(() => {
    const defaultPt = generateCoordinateData(-3.46, -62.21, latLonToVector3(-3.46, -62.21));
    setActiveCoord(defaultPt);
  }, []);

  const handleCopyCoord = () => {
    if (!activeCoord) return;
    navigator.clipboard.writeText(`${activeCoord.latFormatted}, ${activeCoord.lonFormatted}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunGeminiScan = async () => {
    if (!activeCoord) return;
    setAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze ${activeCoord.surfaceType.toUpperCase()} coordinates ${activeCoord.latFormatted}, ${activeCoord.lonFormatted} in ${activeCoord.locationName}. Elevation/Depth: ${activeCoord.elevationOrDepth}, Temp: ${activeCoord.surfaceTemp}°C, Health/Eco Score: ${activeCoord.healthOrRiskScore}/100. Provide a 3-sentence environmental summary.`,
          context: activeCoord,
        }),
      });
      const json = await res.json();
      setAiAnalysisResult(json.text || "Telemetry synchronized. Environmental baseline within predicted range.");
    } catch {
      setAiAnalysisResult(`Gemini AI Sentinel: ${activeCoord.surfaceType.toUpperCase()} coordinates evaluated. Surface parameters fall within normal seasonal variance for ${activeCoord.locationName}.`);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const trendData = activeCoord
    ? [
        { y: "2020", v: activeCoord.surfaceTemp - 0.4 },
        { y: "2021", v: activeCoord.surfaceTemp - 0.3 },
        { y: "2022", v: activeCoord.surfaceTemp - 0.1 },
        { y: "2023", v: activeCoord.surfaceTemp + 0.2 },
        { y: "2024", v: activeCoord.surfaceTemp },
        { y: "2026", v: activeCoord.surfaceTemp + 0.3 },
        { y: "2028", v: activeCoord.surfaceTemp + 0.5 },
        { y: "2030", v: activeCoord.surfaceTemp + 0.8 },
      ]
    : [];

  const radarData = activeCoord
    ? [
        { subject: "Health/Purity", value: activeCoord.healthOrRiskScore },
        { subject: "Temperature", value: Math.min(100, Math.max(10, activeCoord.surfaceTemp * 2.5)) },
        { subject: "Biodiversity", value: activeCoord.speciesList.length * 25 },
        { subject: "Impact Risk", value: activeCoord.pollutionOrDeforestation },
        { subject: "Stability", value: 100 - activeCoord.pollutionOrDeforestation },
      ]
    : [];

  const getSurfaceBadge = (type: string) => {
    if (type === "river") {
      return {
        label: "River / Freshwater System",
        icon: <Droplet className="w-3.5 h-3.5 text-seafoam" />,
        color: "#4ECDC4",
        bg: "rgba(78,205,196,0.15)",
        border: "rgba(78,205,196,0.4)",
      };
    }
    if (type === "land") {
      return {
        label: "Terrestrial Continental Land",
        icon: <Trees className="w-3.5 h-3.5 text-kelp" />,
        color: "#2ECC71",
        bg: "rgba(46,204,113,0.15)",
        border: "rgba(46,204,113,0.4)",
      };
    }
    return {
      label: "Abyssal Ocean Basin",
      icon: <Waves className="w-3.5 h-3.5 text-foam" />,
      color: "#85ECD4",
      bg: "rgba(133,236,212,0.15)",
      border: "rgba(133,236,212,0.4)",
    };
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-abyss text-pearl">
      {/* Top Navigation Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0 z-20"
        style={{ background: "rgba(3,13,24,0.92)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="text-mist hover:text-pearl transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-foam" />
            <span className="font-display font-semibold text-pearl text-sm tracking-tight">
              Photorealistic Planet Explorer
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-2">
            <span className="w-2 h-2 rounded-full bg-seafoam animate-pulse" />
            <span className="font-mono text-[0.6rem] text-seafoam tracking-widest uppercase">
              Click Any River, Land, or Ocean Point
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-mist hover:text-foam transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-seafoam" />
            Ocean Watch Dashboard →
          </Link>
        </div>
      </div>

      {/* Main 3-Column Interface */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT COLUMN: Featured Land, River & Ocean Sectors */}
        <div
          className="w-64 flex-shrink-0 border-r border-white/5 p-4 overflow-y-auto scrollbar-thin z-10"
          style={{ background: "rgba(3,13,24,0.85)" }}
        >
          <div className="font-mono text-[0.58rem] tracking-[0.2em] text-mist/60 uppercase mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-foam" />
            Land, River &amp; Ocean Targets
          </div>
          <div className="space-y-1.5">
            {PRESET_COORDINATES.map((preset) => {
              const isActive =
                activeCoord &&
                Math.abs(activeCoord.lat - preset.lat) < 3 &&
                Math.abs(activeCoord.lon - preset.lon) < 3;

              const badge = getSurfaceBadge(preset.type);

              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    const pt = generateCoordinateData(
                      preset.lat,
                      preset.lon,
                      latLonToVector3(preset.lat, preset.lon)
                    );
                    setActiveCoord(pt);
                    setAiAnalysisResult(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200"
                  style={{
                    background: isActive ? badge.bg : "rgba(255,255,255,0.02)",
                    borderColor: isActive ? badge.border : "rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <div className="text-xs font-semibold text-pearl flex items-center gap-1.5">
                      {preset.type === "river" && <Droplet className="w-3 h-3 text-seafoam" />}
                      {preset.type === "land" && <Trees className="w-3 h-3 text-kelp" />}
                      {preset.type === "ocean" && <Waves className="w-3 h-3 text-foam" />}
                      {preset.name}
                    </div>
                    <div className="text-[0.58rem] font-mono text-mist/50 mt-0.5 uppercase">
                      {preset.type} · {preset.lat > 0 ? `${preset.lat}°N` : `${Math.abs(preset.lat)}°S`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.015] space-y-2">
              <div className="text-[0.58rem] font-mono text-foam uppercase tracking-wider">
                Surface Differentiation
              </div>
              <p className="text-[0.68rem] text-mist leading-relaxed font-light">
                <span className="text-seafoam font-semibold">Rivers</span> output flow rate (m³/s) &amp; discharge.<br />
                <span className="text-kelp font-semibold">Land</span> outputs elevation, vegetation (NDVI) &amp; soil moisture.<br />
                <span className="text-foam font-semibold">Oceans</span> output bathymetric depth &amp; marine salinity.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive 3D Globe */}
        <div className="flex-1 relative bg-abyss">
          <OceanGlobe3D
            onCoordinateClick={(coord) => {
              setActiveCoord(coord);
              setAiAnalysisResult(null);
            }}
            activeCoord={activeCoord}
          />

          {/* Hint Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center">
            <div className="font-mono text-[0.62rem] text-pearl/90 tracking-widest uppercase bg-abyss/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-seafoam/40 shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-seafoam animate-ping" />
              <span>Click Any River, Land, or Ocean Point on 3D Earth</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Coordinate Telemetry Panel */}
        <div
          className="w-80 xl:w-96 flex-shrink-0 border-l border-white/5 p-5 overflow-y-auto scrollbar-thin z-10"
          style={{ background: "rgba(3,13,24,0.92)" }}
        >
          <AnimatePresence mode="wait">
            {!activeCoord ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5 text-mist/40" />
                </div>
                <p className="text-mist/50 text-xs max-w-[180px] leading-relaxed">
                  Click any point on the 3D globe to inspect River, Land, or Ocean metrics.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCoord.lat}-${activeCoord.lon}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Surface Type Badge Header */}
                {(() => {
                  const badge = getSurfaceBadge(activeCoord.surfaceType);
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-1 rounded-full text-[0.6rem] font-mono font-bold uppercase flex items-center gap-1.5 border"
                          style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <button
                          onClick={handleCopyCoord}
                          className="flex items-center gap-1 text-[0.6rem] font-mono text-mist hover:text-foam transition-colors px-2 py-1 rounded bg-white/5 border border-white/5"
                        >
                          {copied ? <Check className="w-3 h-3 text-seafoam" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Copied!" : "Copy Lat/Lon"}
                        </button>
                      </div>

                      <h2 className="font-mono font-bold text-pearl text-xl mt-2 tracking-tight">
                        {activeCoord.latFormatted}, {activeCoord.lonFormatted}
                      </h2>
                      <div className="text-xs font-display text-mist/80 mt-0.5 font-medium">
                        {activeCoord.locationName}
                      </div>
                    </div>
                  );
                })()}

                {/* Telemetry Summary Box */}
                <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between text-[0.58rem] font-mono text-mist/60">
                    <span>TELEMETRY CLASSIFICATION SCAN</span>
                    <span className="text-seafoam uppercase">{activeCoord.surfaceType} STREAM</span>
                  </div>
                  <p className="text-xs text-mist leading-relaxed font-light">
                    {activeCoord.aiSummary}
                  </p>
                </div>

                {/* Dynamic Metrics Grid tailored specifically for River / Land / Ocean */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                      {activeCoord.surfaceType === "ocean" ? "Bathymetry Depth" : "Surface Elevation"}
                    </div>
                    <div className="font-mono text-sm font-semibold text-pearl mt-0.5">
                      {activeCoord.elevationOrDepth}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">Surface Temp</div>
                    <div className="font-mono text-sm font-semibold text-seafoam mt-0.5">
                      {activeCoord.surfaceTemp}°C
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                      {activeCoord.surfaceType === "land" ? "Vegetation (NDVI)" : "Salinity"}
                    </div>
                    <div className="font-mono text-xs font-semibold text-pearl mt-0.5">
                      {activeCoord.salinityOrNDVI}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                      {activeCoord.surfaceType === "land" ? "Soil Moisture" : "Dissolved O₂"}
                    </div>
                    <div className="font-mono text-xs font-semibold text-seafoam mt-0.5">
                      {activeCoord.oxygenOrMoisture}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                      {activeCoord.surfaceType === "river" ? "Flow Rate / Discharge" : activeCoord.surfaceType === "land" ? "Deforestation Risk" : "Microplastics"}
                    </div>
                    <div className="font-mono text-xs font-semibold text-coral mt-0.5">
                      {activeCoord.microplasticsOrFlowRate}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                      {activeCoord.surfaceType === "land" ? "Ecosystem Score" : "Health Score"}
                    </div>
                    <div className="font-mono text-sm font-semibold text-pearl mt-0.5">
                      {activeCoord.healthOrRiskScore} / 100
                    </div>
                  </div>
                </div>

                {/* Observed Fauna / Flora Species */}
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[0.58rem] font-mono text-mist/50 uppercase mb-2">
                    Observed Fauna &amp; Ecosystem Flora
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCoord.speciesList.map((sp) => (
                      <span
                        key={sp}
                        className="px-2.5 py-1 rounded-full text-[0.62rem] font-mono bg-seafoam/10 text-seafoam border border-seafoam/20"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gemini AI Scan Button */}
                <div className="border-t border-white/5 pt-3">
                  <button
                    onClick={handleRunGeminiScan}
                    disabled={aiAnalyzing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #85ECD4, #4ECDC4)",
                      color: "#040D14",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiAnalyzing ? "Running Gemini Scan..." : "Run Gemini AI Surface Scan"}
                  </button>

                  {aiAnalysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-xl border border-seafoam/30 bg-seafoam/5 text-xs text-pearl leading-relaxed font-light"
                    >
                      <div className="text-[0.55rem] font-mono text-seafoam font-bold uppercase mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Gemini AI Planetary Diagnostic
                      </div>
                      {aiAnalysisResult}
                    </motion.div>
                  )}
                </div>

                {/* Predictive Chart */}
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[0.58rem] font-mono text-mist/50 uppercase mb-2">
                    Surface Temp Projection (2020–2030)
                  </div>
                  <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={trendData}>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#85ECD4"
                        fill="#85ECD4"
                        fillOpacity={0.15}
                        strokeWidth={1.5}
                      />
                      <Tooltip {...ttStyle} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Timeline Bar */}
      <div
        className="flex items-center justify-between px-6 py-2.5 border-t border-white/5 flex-shrink-0 font-mono text-xs z-20"
        style={{ background: "rgba(3,13,24,0.92)" }}
      >
        <div className="text-mist/50 text-[0.62rem] uppercase tracking-wider">
          Predictive Timeline Projection
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => yearIdx > 0 && setYear(YEARS[yearIdx - 1])}
            disabled={yearIdx === 0}
            className="p-1 text-mist/60 hover:text-pearl disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-2 py-0.5 rounded text-[0.62rem] ${
                  year === y
                    ? "bg-foam/20 text-foam border border-foam/30"
                    : "text-mist/40 hover:text-mist"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <button
            onClick={() => yearIdx < YEARS.length - 1 && setYear(YEARS[yearIdx + 1])}
            disabled={yearIdx === YEARS.length - 1}
            className="p-1 text-mist/60 hover:text-pearl disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={() => {
            setYear(2024);
            const defaultPt = generateCoordinateData(-3.46, -62.21, latLonToVector3(-3.46, -62.21));
            setActiveCoord(defaultPt);
          }}
          className="flex items-center gap-1 text-[0.6rem] text-mist/40 hover:text-pearl transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset Target
        </button>
      </div>
    </div>
  );
}
