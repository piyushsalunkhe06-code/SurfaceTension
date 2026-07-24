"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Home, Waves, Compass, MapPin, Trees, Droplet, Copy, Check,
  Sparkles, Search, X, Heart, Thermometer, Trash2, Droplets,
  Diamond, Fish, Ship, ShieldCheck, AlertTriangle, AlertCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  ClickedCoordinateInfo,
  generateCoordinateData,
  latLonToVector3,
} from "@/components/explorer/OceanGlobe3D";

const OceanGlobe3D = dynamic(
  () => import("@/components/explorer/OceanGlobe3D").then((m) => ({ default: m.OceanGlobe3D })),
  { ssr: false }
);

// ─── YEARS ──────────────────────────────────────────────────────────────────
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

// ─── 24 GLOBAL HOTSPOTS ─────────────────────────────────────────────────────
const PRESET_COORDINATES = [
  { name: "Great Barrier Reef",            lat: -18.28, lon:  147.70, type: "ocean", region: "Coral Sea, Australia" },
  { name: "Mariana Hadal Trench",          lat:  11.35, lon:  142.20, type: "ocean", region: "Western Pacific Ocean" },
  { name: "Galápagos Marine Reserve",      lat:  -0.95, lon:  -90.96, type: "ocean", region: "Eastern Pacific Ocean" },
  { name: "Coral Triangle (Raja Ampat)",   lat:  -0.23, lon:  130.51, type: "ocean", region: "Indo-Pacific Basin" },
  { name: "Maldives Coral Atolls",         lat:   3.20, lon:   73.22, type: "ocean", region: "Central Indian Ocean" },
  { name: "Sargasso Sea Gyre",             lat:  25.00, lon:  -71.00, type: "ocean", region: "North Atlantic Gyre" },
  { name: "Hawaiian Humpback Reserve",     lat:  20.79, lon: -156.33, type: "ocean", region: "North Pacific Basin" },
  { name: "Mid-Atlantic Hydrothermal Vents",lat: 26.10, lon:  -44.80, type: "ocean", region: "Atlantic Ridge" },
  { name: "Southern Antarctic Current",    lat: -65.00, lon:  140.00, type: "ocean", region: "Southern Ocean" },
  { name: "Mesoamerican Barrier Reef",     lat:  17.31, lon:  -87.53, type: "ocean", region: "Caribbean Sea" },
  { name: "Monterey Bay Submarine Canyon", lat:  36.80, lon: -121.90, type: "ocean", region: "Pacific Coast, USA" },
  { name: "Red Sea Coral Reef System",     lat:  22.50, lon:   38.00, type: "ocean", region: "Red Sea Basin" },
  { name: "North Sea",                     lat:  56.00, lon:    3.00, type: "ocean", region: "NW European Shelf" },
  { name: "Bay of Bengal",                 lat:  14.00, lon:   88.00, type: "ocean", region: "Indian Ocean" },
  { name: "Amazon River Basin",            lat:  -3.46, lon:  -62.21, type: "river", region: "South America" },
  { name: "Nile River Corridor",           lat:  26.82, lon:   30.80, type: "river", region: "North Africa" },
  { name: "Mississippi Waterway",          lat:  35.00, lon:  -90.00, type: "river", region: "North America" },
  { name: "Yangtze River System",          lat:  30.50, lon:  114.30, type: "river", region: "East Asia" },
  { name: "Congo Equatorial Basin",        lat:  -0.78, lon:   17.55, type: "river", region: "Central Africa" },
  { name: "Ganges-Brahmaputra Delta",      lat:  22.10, lon:   89.20, type: "river", region: "South Asia" },
  { name: "Mekong River Delta",            lat:  10.25, lon:  105.96, type: "river", region: "Southeast Asia" },
  { name: "Himalayan Alpine Range",        lat:  28.00, lon:   86.90, type: "land",  region: "High Asia" },
  { name: "Madagascar Rainforest",         lat: -18.76, lon:   46.86, type: "land",  region: "Indian Ocean Island" },
  { name: "Australian Outback Shield",     lat: -25.27, lon:  133.77, type: "land",  region: "Australia" },
];

// ─── YEAR-VARYING DATASET ───────────────────────────────────────────────────
// Each hotspot has year-indexed metric deltas applied to a base value.
// Metrics: health, temp, plastic (mg/L), coralCover (%), biodiversity (index/100),
//          oilRisk (0-10), shippingDensity (vessels/day), protectedZone (km²)
type HotspotYearData = {
  health: number; temp: number; plastic: number; coralCover: number;
  biodiversity: number; oilRisk: number; shippingDensity: number; protectedZone: number;
  alert: { label: string; severity: "critical" | "high" | "moderate" | "low" } | null;
};

const BASE_DATA: Record<string, { health: number; temp: number; plastic: number; coralCover: number; biodiversity: number; oilRisk: number; shippingDensity: number; protectedZone: number }> = {
  "Great Barrier Reef":            { health: 74, temp: 27.1, plastic: 0.42, coralCover: 55, biodiversity: 78, oilRisk: 2, shippingDensity: 45, protectedZone: 344400 },
  "Mariana Hadal Trench":          { health: 88, temp:  1.8, plastic: 0.12, coralCover:  0, biodiversity: 62, oilRisk: 1, shippingDensity:  8, protectedZone: 246608 },
  "Galápagos Marine Reserve":      { health: 82, temp: 23.5, plastic: 0.28, coralCover: 35, biodiversity: 91, oilRisk: 3, shippingDensity: 22, protectedZone: 133000 },
  "Coral Triangle (Raja Ampat)":   { health: 80, temp: 29.2, plastic: 0.55, coralCover: 68, biodiversity: 95, oilRisk: 4, shippingDensity: 60, protectedZone:  20000 },
  "Maldives Coral Atolls":         { health: 68, temp: 29.8, plastic: 0.63, coralCover: 42, biodiversity: 72, oilRisk: 2, shippingDensity: 35, protectedZone:  35000 },
  "Sargasso Sea Gyre":             { health: 60, temp: 22.4, plastic: 1.80, coralCover:  0, biodiversity: 55, oilRisk: 5, shippingDensity: 80, protectedZone:      0 },
  "Hawaiian Humpback Reserve":     { health: 76, temp: 25.6, plastic: 0.30, coralCover: 28, biodiversity: 73, oilRisk: 2, shippingDensity: 30, protectedZone:  19000 },
  "Mid-Atlantic Hydrothermal Vents":{ health: 90, temp:  2.2, plastic: 0.08, coralCover:  0, biodiversity: 58, oilRisk: 1, shippingDensity: 12, protectedZone: 380000 },
  "Southern Antarctic Current":    { health: 85, temp: -1.8, plastic: 0.15, coralCover:  0, biodiversity: 68, oilRisk: 1, shippingDensity:  5, protectedZone: 540000 },
  "Mesoamerican Barrier Reef":     { health: 62, temp: 28.4, plastic: 0.70, coralCover: 38, biodiversity: 76, oilRisk: 6, shippingDensity: 55, protectedZone: 110000 },
  "Monterey Bay Submarine Canyon": { health: 79, temp: 12.8, plastic: 0.35, coralCover:  5, biodiversity: 84, oilRisk: 3, shippingDensity: 90, protectedZone:  13120 },
  "Red Sea Coral Reef System":     { health: 71, temp: 30.2, plastic: 0.48, coralCover: 48, biodiversity: 69, oilRisk: 7, shippingDensity: 120, protectedZone: 6000 },
  "North Sea":                     { health: 62, temp: 10.2, plastic: 1.20, coralCover:  0, biodiversity: 52, oilRisk: 8, shippingDensity: 280, protectedZone: 95000 },
  "Bay of Bengal":                 { health: 58, temp: 28.6, plastic: 1.50, coralCover: 12, biodiversity: 60, oilRisk: 5, shippingDensity: 150, protectedZone: 12000 },
  "Amazon River Basin":            { health: 72, temp: 27.8, plastic: 0.80, coralCover:  0, biodiversity: 96, oilRisk: 4, shippingDensity: 30, protectedZone: 320000 },
  "Nile River Corridor":           { health: 55, temp: 24.5, plastic: 1.10, coralCover:  0, biodiversity: 48, oilRisk: 4, shippingDensity: 18, protectedZone: 12000 },
  "Mississippi Waterway":          { health: 51, temp: 18.2, plastic: 1.60, coralCover:  0, biodiversity: 45, oilRisk: 7, shippingDensity: 60, protectedZone: 8500 },
  "Yangtze River System":          { health: 44, temp: 16.5, plastic: 2.20, coralCover:  0, biodiversity: 40, oilRisk: 6, shippingDensity: 200, protectedZone: 16000 },
  "Congo Equatorial Basin":        { health: 78, temp: 26.0, plastic: 0.55, coralCover:  0, biodiversity: 88, oilRisk: 3, shippingDensity: 10, protectedZone: 190000 },
  "Ganges-Brahmaputra Delta":      { health: 42, temp: 28.0, plastic: 2.80, coralCover:  0, biodiversity: 52, oilRisk: 5, shippingDensity: 90, protectedZone: 6000 },
  "Mekong River Delta":            { health: 48, temp: 28.5, plastic: 1.90, coralCover:  0, biodiversity: 58, oilRisk: 4, shippingDensity: 70, protectedZone: 5500 },
  "Himalayan Alpine Range":        { health: 75, temp:  3.5, plastic: 0.18, coralCover:  0, biodiversity: 70, oilRisk: 1, shippingDensity:  0, protectedZone: 48000 },
  "Madagascar Rainforest":         { health: 65, temp: 24.0, plastic: 0.40, coralCover:  0, biodiversity: 86, oilRisk: 2, shippingDensity:  5, protectedZone: 22000 },
  "Australian Outback Shield":     { health: 70, temp: 32.0, plastic: 0.22, coralCover:  0, biodiversity: 60, oilRisk: 2, shippingDensity:  2, protectedZone: 380000 },
};

// Year multipliers — applied cumulatively from 2018 baseline
const YEAR_DELTAS: Record<number, { health: number; temp: number; plastic: number; coralCover: number; biodiversity: number; oilRisk: number }> = {
  2018: { health:  2, temp: -0.20, plastic: -0.15, coralCover:  3, biodiversity:  2, oilRisk: -0.5 },
  2019: { health:  1, temp: -0.10, plastic: -0.08, coralCover:  1, biodiversity:  1, oilRisk: -0.3 },
  2020: { health:  0, temp:  0.00, plastic:  0.00, coralCover:  0, biodiversity:  0, oilRisk:  0.0 },
  2021: { health: -1, temp:  0.08, plastic:  0.05, coralCover: -1, biodiversity: -1, oilRisk:  0.2 },
  2022: { health: -2, temp:  0.18, plastic:  0.12, coralCover: -2, biodiversity: -2, oilRisk:  0.4 },
  2023: { health: -4, temp:  0.30, plastic:  0.22, coralCover: -4, biodiversity: -3, oilRisk:  0.6 },
  2024: { health: -6, temp:  0.42, plastic:  0.35, coralCover: -6, biodiversity: -5, oilRisk:  0.9 },
  2025: { health: -8, temp:  0.55, plastic:  0.50, coralCover: -8, biodiversity: -7, oilRisk:  1.2 },
  2026: { health:-11, temp:  0.70, plastic:  0.68, coralCover:-10, biodiversity: -9, oilRisk:  1.5 },
  2027: { health:-14, temp:  0.88, plastic:  0.90, coralCover:-13, biodiversity:-12, oilRisk:  1.9 },
  2028: { health:-17, temp:  1.08, plastic:  1.15, coralCover:-16, biodiversity:-15, oilRisk:  2.3 },
  2029: { health:-20, temp:  1.30, plastic:  1.45, coralCover:-20, biodiversity:-18, oilRisk:  2.8 },
  2030: { health:-24, temp:  1.55, plastic:  1.80, coralCover:-24, biodiversity:-22, oilRisk:  3.3 },
};

const ALERTS: Record<string, Record<number, { label: string; severity: "critical" | "high" | "moderate" | "low" } | null>> = {
  "Great Barrier Reef": {
    2018: null, 2019: { label: "Thermal Stress Warning", severity: "moderate" },
    2020: { label: "Mass Bleaching Event", severity: "critical" },
    2021: { label: "Coral Recovery Monitored", severity: "moderate" },
    2022: { label: "Storm Damage — Cyclone", severity: "high" },
    2023: { label: "Record Bleaching Season", severity: "critical" },
    2024: { label: "5th Mass Bleaching Confirmed", severity: "critical" },
    2025: { label: "Reef Mortality Escalating", severity: "critical" },
    2026: { label: "Southern Sectors Critical", severity: "critical" },
    2027: { label: "30% Coverage Loss Projected", severity: "critical" },
    2028: { label: "UNESCO Endangerment Review", severity: "critical" },
    2029: { label: "Emergency Conservation Act", severity: "critical" },
    2030: { label: "Irreversible Damage Zone", severity: "critical" },
  },
  "North Sea": {
    2018: null, 2019: null,
    2020: { label: "Oil Spill Detected", severity: "high" },
    2021: { label: "Plastic Bloom Accumulation", severity: "moderate" },
    2022: { label: "Offshore Rig Leak", severity: "high" },
    2023: { label: "Coral Bleaching Event", severity: "high" },
    2024: { label: "Oil Spill — Shipping Incident", severity: "critical" },
    2025: { label: "Plastic Surge +18%", severity: "high" },
    2026: { label: "Thermal Stratification Break", severity: "high" },
    2027: { label: "Cod Population Collapse", severity: "critical" },
    2028: { label: "Anoxic Dead Zone Expanding", severity: "critical" },
    2029: { label: "Industrial Discharge Alert", severity: "high" },
    2030: { label: "Marine Protected Area Breach", severity: "critical" },
  },
  "Amazon River Basin": {
    2018: null, 2019: { label: "Deforestation Surge", severity: "high" },
    2020: { label: "Record Flood Season", severity: "moderate" },
    2021: { label: "Drought & Low Flow Warning", severity: "high" },
    2022: { label: "Mercury Contamination — Mining", severity: "critical" },
    2023: { label: "Worst Drought on Record", severity: "critical" },
    2024: { label: "Pink Dolphin Population Decline", severity: "high" },
    2025: { label: "Deforestation +32% (5yr)", severity: "critical" },
    2026: { label: "River Fever Outbreak", severity: "high" },
    2027: { label: "Sediment Load Critical", severity: "high" },
    2028: { label: "Aquifer Contamination", severity: "critical" },
    2029: { label: "UNESCO Emergency Status", severity: "critical" },
    2030: { label: "Tipping Point Threshold", severity: "critical" },
  },
  "Mesoamerican Barrier Reef": {
    2018: null, 2019: null,
    2020: { label: "Coral Bleaching E...", severity: "critical" },
    2021: { label: "Sargassum Bloom — Beach Closure", severity: "high" },
    2022: { label: "Oil Spill Detected", severity: "high" },
    2023: { label: "Hurricane Damage Survey", severity: "moderate" },
    2024: { label: "Bleaching Season — 3rd Year", severity: "critical" },
    2025: { label: "Plastics Influx +44%", severity: "high" },
    2026: { label: "Dead Zone Expanding", severity: "critical" },
    2027: { label: "Species Loss Accelerating", severity: "critical" },
    2028: { label: "Nitrogen Runoff Alert", severity: "high" },
    2029: { label: "Anchor Damage — Shipping Lane", severity: "moderate" },
    2030: { label: "30% Reef Area Degraded", severity: "critical" },
  },
  "Yangtze River System": {
    2018: null, 2019: { label: "Heavy Metal Discharge", severity: "high" },
    2020: { label: "Microplastic Surge", severity: "moderate" },
    2021: { label: "Record Flood Levels", severity: "high" },
    2022: { label: "Baiji Dolphin Confirmed Extinct", severity: "critical" },
    2023: { label: "Algal Bloom — Wuhan Sector", severity: "high" },
    2024: { label: "Industrial Effluent Alert", severity: "critical" },
    2025: { label: "Sediment Dam Impact", severity: "high" },
    2026: { label: "Fish Kill Detected", severity: "critical" },
    2027: { label: "Drinking Water Risk — 3 Cities", severity: "critical" },
    2028: { label: "Aquifer Drawdown Critical", severity: "critical" },
    2029: { label: "Delta Erosion Accelerating", severity: "high" },
    2030: { label: "Estuary Dead Zone — 4200 km²", severity: "critical" },
  },
};

function getHotspotData(name: string, year: number): HotspotYearData {
  const base = BASE_DATA[name] ?? BASE_DATA["North Sea"];
  const delta = YEAR_DELTAS[year] ?? YEAR_DELTAS[2024];
  const alertMap = ALERTS[name];
  return {
    health:          Math.max(10, Math.min(100, Math.round(base.health + delta.health))),
    temp:            Math.round((base.temp + delta.temp) * 10) / 10,
    plastic:         Math.round((base.plastic + delta.plastic) * 100) / 100,
    coralCover:      Math.max(0, Math.round(base.coralCover + delta.coralCover)),
    biodiversity:    Math.max(10, Math.min(100, Math.round(base.biodiversity + delta.biodiversity))),
    oilRisk:         Math.max(0, Math.min(10, Math.round((base.oilRisk + delta.oilRisk) * 10) / 10)),
    shippingDensity: base.shippingDensity,
    protectedZone:   base.protectedZone,
    alert:           alertMap ? (alertMap[year] ?? null) : null,
  };
}

// ─── LAYER CONTROLS ──────────────────────────────────────────────────────────
const LAYERS = [
  { id: "oceanHealth",    label: "Ocean Health",       icon: Heart,        color: "#2ECC71", defaultOn: true  },
  { id: "waterTemp",      label: "Water Temperature",  icon: Thermometer,  color: "#E8694A", defaultOn: true  },
  { id: "plastic",        label: "Plastic Pollution",  icon: Trash2,       color: "#FF9F1C", defaultOn: true  },
  { id: "oilSpills",      label: "Oil Spills",         icon: Droplets,     color: "#7A8E9E", defaultOn: false },
  { id: "coralHealth",    label: "Coral Health",       icon: Diamond,      color: "#E91E8C", defaultOn: true  },
  { id: "biodiversity",   label: "Marine Biodiversity",icon: Fish,         color: "#4ECDC4", defaultOn: true  },
  { id: "shipping",       label: "Shipping Routes",    icon: Ship,         color: "#6C8EBD", defaultOn: false },
  { id: "protected",      label: "Protected Areas",    icon: ShieldCheck,  color: "#2ECC71", defaultOn: true  },
];

export default function ExplorerPage() {
  const [activeCoord, setActiveCoord] = useState<ClickedCoordinateInfo | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<string>("Amazon River Basin");
  const [year, setYear]                   = useState(2024);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all"|"ocean"|"river"|"land">("all");
  const [copied, setCopied]               = useState(false);
  const [aiAnalyzing, setAiAnalyzing]     = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [layers, setLayers]               = useState<Record<string, boolean>>(
    () => Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOn]))
  );

  const [leftPanelTab, setLeftPanelTab] = useState<"hotspots" | "layers" | "alerts">("hotspots");

  // Hotspot data for selected location + year
  const hotspotData = useMemo(() => getHotspotData(activeHotspot, year), [activeHotspot, year]);

  // Global alert list across all hotspots for this year
  const globalAlerts = useMemo(() => {
    return PRESET_COORDINATES
      .map((p) => {
        const d = getHotspotData(p.name, year);
        return d.alert ? { name: p.name, region: p.region, alert: d.alert } : null;
      })
      .filter(Boolean) as { name: string; region: string; alert: { label: string; severity: "critical"|"high"|"moderate"|"low" } }[];
  }, [year]);

  // Filtered hotspot list
  const filteredHotspots = useMemo(() => {
    return PRESET_COORDINATES.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q))
        && (selectedFilter === "all" || s.type === selectedFilter);
    });
  }, [searchQuery, selectedFilter]);

  // Initialise globe
  useEffect(() => {
    const pt = generateCoordinateData(-3.46, -62.21, latLonToVector3(-3.46, -62.21), false);
    setActiveCoord(pt);
  }, []);

  const handleSelectHotspot = (preset: typeof PRESET_COORDINATES[0]) => {
    const pt = generateCoordinateData(preset.lat, preset.lon, latLonToVector3(preset.lat, preset.lon), preset.type === "ocean");
    setActiveCoord(pt);
    setActiveHotspot(preset.name);
    setAiAnalysisResult(null);
  };

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
          prompt: `Analyze ${activeCoord.surfaceType.toUpperCase()} at ${activeCoord.locationName} for year ${year}. Health Score: ${hotspotData.health}/100, Temp: ${hotspotData.temp}°C, Plastic: ${hotspotData.plastic}mg/L, Biodiversity: ${hotspotData.biodiversity}/100. Provide a 3-sentence environmental outlook.`,
          context: activeCoord,
        }),
      });
      const json = await res.json();
      setAiAnalysisResult(json.text || "Telemetry synchronized.");
    } catch {
      setAiAnalysisResult(`Gemini AI (${year}): Environmental baseline for ${activeCoord.locationName} shows ${hotspotData.health < 50 ? "deteriorating" : "stable"} conditions with thermal anomaly at +${hotspotData.temp}°C.`);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const toggleLayer = (id: string) =>
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  const getSurfaceBadge = (type: string) => {
    if (type === "river") return { label: "River System",   icon: <Droplet className="w-3.5 h-3.5" />, color: "#4ECDC4", bg: "rgba(78,205,196,0.15)",   border: "rgba(78,205,196,0.4)" };
    if (type === "land")  return { label: "Terrestrial Land",icon: <Trees  className="w-3.5 h-3.5" />, color: "#2ECC71", bg: "rgba(46,204,113,0.15)",   border: "rgba(46,204,113,0.4)" };
    return                       { label: "Ocean Sector",    icon: <Waves  className="w-3.5 h-3.5" />, color: "#85ECD4", bg: "rgba(133,236,212,0.15)", border: "rgba(133,236,212,0.4)" };
  };

  const healthColor = (h: number) =>
    h >= 75 ? "#2ECC71" : h >= 55 ? "#FF9F1C" : h >= 35 ? "#E8694A" : "#E91E8C";

  const severityColor = (s: string) =>
    s === "critical" ? "#E91E8C" : s === "high" ? "#E8694A" : s === "moderate" ? "#FF9F1C" : "#4ECDC4";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-abyss text-pearl">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-abyss/95 backdrop-blur-xl px-6 py-2.5 flex-shrink-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg border border-seafoam/30 bg-seafoam/10 flex items-center justify-center">
              <Compass className="w-4 h-4 text-seafoam" />
            </div>
            <div>
              <h1 className="font-display font-bold text-pearl text-sm tracking-tight leading-none group-hover:text-seafoam transition-colors">
                DeepSea Guardian
              </h1>
              <p className="text-[0.52rem] font-mono text-mist/50 mt-0.5">Ocean Intelligence System</p>
            </div>
          </Link>
          <div className="w-px h-5 bg-white/10 hidden sm:block" />
          <nav className="flex items-center gap-1.5 font-display text-xs">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-mist hover:text-pearl hover:bg-white/5 transition-all">
              <Home className="w-3.5 h-3.5" /><span>Home</span>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-seafoam/15 border border-seafoam/30 text-seafoam font-semibold">
              <Compass className="w-3.5 h-3.5" /><span>Explorer</span>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-mist hover:text-pearl hover:bg-white/5 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-seafoam" /><span>Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Year Scrubber */}
        <div className="flex items-center gap-3">
          <button onClick={() => setYear(y => Math.max(2018, y - 1))} className="p-1 rounded-lg hover:bg-white/5 text-mist hover:text-pearl transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="font-mono font-bold text-pearl text-lg leading-none">{year}</div>
            <div className="text-[0.52rem] font-mono text-mist/50 uppercase tracking-wider">Timeline</div>
          </div>
          <button onClick={() => setYear(y => Math.min(2030, y + 1))} className="p-1 rounded-lg hover:bg-white/5 text-mist hover:text-pearl transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          <input
            type="range" min={2018} max={2030} value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="w-28 accent-seafoam cursor-pointer"
          />
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-seafoam/25 bg-seafoam/5 font-mono text-[0.6rem] text-seafoam">
          <span className="w-1.5 h-1.5 rounded-full bg-seafoam animate-pulse" />
          <span>Click Hotspot → Earth Rotates to Exact Spot</span>
        </div>
      </header>

      {/* ── 3-COLUMN BODY ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">

        {/* LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-r border-white/5 z-10 flex flex-col min-h-0"
          style={{ background: "rgba(3,13,24,0.92)" }}>

          {/* Sidebar Header + Health Score */}
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-seafoam/20 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5 text-seafoam" />
              </div>
              <div>
                <div className="text-[0.65rem] font-bold text-pearl leading-tight truncate max-w-[120px]">{activeHotspot}</div>
                <div className="text-[0.5rem] font-mono text-mist/50 uppercase tracking-wider">Target Hotspot</div>
              </div>
            </div>
            {/* Health pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-mono font-bold flex-shrink-0"
              style={{ background: `${healthColor(hotspotData.health)}22`, color: healthColor(hotspotData.health), border: `1px solid ${healthColor(hotspotData.health)}44` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: healthColor(hotspotData.health) }} />
              Health {hotspotData.health}
            </div>
          </div>

          {/* Sidebar Tab Navigation Bar */}
          <div className="grid grid-cols-3 border-b border-white/5 p-1 bg-white/[0.02] text-[0.6rem] font-mono flex-shrink-0">
            <button
              onClick={() => setLeftPanelTab("hotspots")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition-all ${
                leftPanelTab === "hotspots"
                  ? "bg-seafoam/15 text-seafoam border border-seafoam/30"
                  : "text-mist hover:text-pearl hover:bg-white/5"
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Hotspots ({PRESET_COORDINATES.length})</span>
            </button>

            <button
              onClick={() => setLeftPanelTab("layers")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition-all ${
                leftPanelTab === "layers"
                  ? "bg-seafoam/15 text-seafoam border border-seafoam/30"
                  : "text-mist hover:text-pearl hover:bg-white/5"
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Layers</span>
            </button>

            <button
              onClick={() => setLeftPanelTab("alerts")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 font-semibold transition-all relative ${
                leftPanelTab === "alerts"
                  ? "bg-seafoam/15 text-seafoam border border-seafoam/30"
                  : "text-mist hover:text-pearl hover:bg-white/5"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Alerts</span>
              {globalAlerts.length > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-coral text-white text-[0.45rem] font-bold flex items-center justify-center ml-0.5">
                  {globalAlerts.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: HOTSPOTS (100% Scrollable space, no overlap) */}
          {leftPanelTab === "hotspots" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Search */}
              <div className="px-3 pt-3 flex-shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-mist/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 24 global hotspots..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-7 py-2 text-xs font-mono text-pearl placeholder:text-mist/40 focus:outline-none focus:border-seafoam/40 transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mist/40 hover:text-pearl">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter pills */}
              <div className="px-3 py-2 flex items-center gap-1 text-[0.6rem] font-mono border-b border-white/5 flex-shrink-0">
                {(["all","ocean","river","land"] as const).map((cat) => (
                  <button key={cat} onClick={() => setSelectedFilter(cat)}
                    className="px-2.5 py-1 rounded-lg uppercase transition-all"
                    style={{
                      background: selectedFilter === cat ? "rgba(133,236,212,0.15)" : "rgba(255,255,255,0.02)",
                      color: selectedFilter === cat ? "#85ECD4" : "rgba(242,240,237,0.45)",
                      border: selectedFilter === cat ? "1px solid rgba(133,236,212,0.3)" : "1px solid transparent",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Full scrollable hotspots list */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
                {filteredHotspots.length === 0
                  ? <p className="text-center py-6 text-[0.62rem] text-mist/40 font-mono">No matches for "{searchQuery}"</p>
                  : filteredHotspots.map((preset) => {
                      const isActive = preset.name === activeHotspot;
                      const d = getHotspotData(preset.name, year);
                      const hc = healthColor(d.health);
                      return (
                        <button key={preset.name} onClick={() => handleSelectHotspot(preset)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-150 group"
                          style={{
                            background: isActive ? "rgba(133,236,212,0.12)" : "rgba(255,255,255,0.02)",
                            borderColor: isActive ? "rgba(133,236,212,0.4)" : "rgba(255,255,255,0.05)",
                          }}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">
                              {preset.type === "river" && <Droplet className="w-3.5 h-3.5 text-seafoam" />}
                              {preset.type === "land"  && <Trees   className="w-3.5 h-3.5 text-kelp" />}
                              {preset.type === "ocean" && <Waves   className="w-3.5 h-3.5 text-foam" />}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-pearl truncate group-hover:text-seafoam transition-colors">{preset.name}</div>
                              <div className="text-[0.54rem] font-mono text-mist/50 uppercase truncate">{preset.region}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <span className="font-mono text-[0.65rem] font-bold" style={{ color: hc }}>{d.health}</span>
                            <MapPin className={`w-3 h-3 transition-opacity ${isActive ? "text-seafoam opacity-100" : "text-mist/30 opacity-0 group-hover:opacity-100"}`} />
                          </div>
                        </button>
                      );
                    })}
              </div>
            </div>
          )}

          {/* TAB 2: LAYER CONTROLS */}
          {leftPanelTab === "layers" && (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin">
              <div className="text-[0.55rem] font-mono text-mist/50 uppercase tracking-widest px-1 mb-1">Interactive Ocean Layers</div>
              {LAYERS.map(({ id, label, icon: Icon, color, defaultOn: _ }) => (
                <div key={id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-pearl">{label}</div>
                      <div className="text-[0.5rem] font-mono text-mist/40">{layers[id] ? "ACTIVE LAYER" : "HIDDEN"}</div>
                    </div>
                  </div>
                  <button onClick={() => toggleLayer(id)} className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ background: layers[id] ? color : "rgba(255,255,255,0.08)" }}>
                    <span className="absolute top-0.5 transition-all duration-200 w-4 h-4 rounded-full bg-white shadow"
                      style={{ left: layers[id] ? "calc(100% - 18px)" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ENVIRONMENTAL ALERTS */}
          {leftPanelTab === "alerts" && (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin">
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="text-[0.55rem] font-mono text-mist/50 uppercase tracking-widest">Global Risk Scan — {year}</div>
                <span className="text-[0.55rem] font-mono text-seafoam font-bold uppercase">{globalAlerts.length} Active</span>
              </div>
              {globalAlerts.length === 0
                ? <p className="text-[0.62rem] text-mist/40 font-mono py-8 text-center">No high-risk environmental alerts logged for {year}</p>
                : globalAlerts.map(({ name, alert }) => (
                    <button key={name} onClick={() => {
                      const p = PRESET_COORDINATES.find(x => x.name === name);
                      if (p) handleSelectHotspot(p);
                    }}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:bg-white/[0.04] group"
                      style={{ background: `${severityColor(alert.severity)}10`, borderColor: `${severityColor(alert.severity)}30` }}>
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${severityColor(alert.severity)}22` }}>
                        {alert.severity === "critical"
                          ? <AlertCircle  className="w-3.5 h-3.5" style={{ color: severityColor(alert.severity) }} />
                          : <AlertTriangle className="w-3.5 h-3.5" style={{ color: severityColor(alert.severity) }} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-pearl group-hover:text-seafoam transition-colors truncate">{alert.label}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: severityColor(alert.severity) }} />
                          <span className="text-[0.54rem] font-mono text-mist/70 truncate">{name}</span>
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
          )}

          {/* Quick Footer indicator */}
          <div className="px-3 py-2 border-t border-white/5 bg-white/[0.01] text-[0.58rem] font-mono text-mist/50 flex items-center justify-between flex-shrink-0">
            <span>24 Biodiversity Reserves</span>
            <span className="text-seafoam">Year {year}</span>
          </div>

        </div>

        {/* CENTER COLUMN ───────────────────────────── */}
        <div className="flex-1 relative bg-abyss">
          <OceanGlobe3D
            onCoordinateClick={(coord) => {
              setActiveCoord(coord);
              setAiAnalysisResult(null);
            }}
            activeCoord={activeCoord}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="font-mono text-[0.62rem] text-pearl/90 tracking-widest uppercase bg-abyss/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-seafoam/40 shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-seafoam animate-ping" />
              <span>Click Globe or Hotspot • Use ← → or Slider to Change Year</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN ────────────────────────────── */}
        <div className="w-80 xl:w-96 flex-shrink-0 border-l border-white/5 p-5 overflow-y-auto scrollbar-thin z-10"
          style={{ background: "rgba(3,13,24,0.92)" }}>
          <AnimatePresence mode="wait">
            {!activeCoord ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20">
                <Compass className="w-8 h-8 text-mist/30 mb-3" />
                <p className="text-mist/50 text-xs max-w-[180px] leading-relaxed">Click a hotspot or the 3D globe to inspect telemetry.</p>
              </motion.div>
            ) : (
              <motion.div key={`${activeHotspot}-${year}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className="space-y-4">

                {/* Badge + year */}
                {(() => {
                  const badge = getSurfaceBadge(activeCoord.surfaceType);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[0.6rem] font-mono font-bold uppercase flex items-center gap-1.5 border"
                          style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}>
                          {badge.icon}{badge.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 rounded-lg font-mono text-[0.62rem] font-bold"
                            style={{ background: "rgba(133,236,212,0.1)", color: "#85ECD4", border: "1px solid rgba(133,236,212,0.2)" }}>
                            {year}
                          </div>
                          <button onClick={handleCopyCoord}
                            className="flex items-center gap-1 text-[0.6rem] font-mono text-mist hover:text-foam transition-colors px-2 py-1 rounded bg-white/5 border border-white/5">
                            {copied ? <Check className="w-3 h-3 text-seafoam" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <h2 className="font-mono font-bold text-pearl text-base tracking-tight">{activeHotspot}</h2>
                      <div className="text-[0.62rem] font-mono text-mist/60 mt-0.5">{activeCoord.latFormatted} · {activeCoord.lonFormatted}</div>
                    </div>
                  );
                })()}

                {/* Active alert for this hotspot + year */}
                {hotspotData.alert && (
                  <div className="p-3 rounded-xl flex items-start gap-2.5 border"
                    style={{ background: `${severityColor(hotspotData.alert.severity)}10`, borderColor: `${severityColor(hotspotData.alert.severity)}30` }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: severityColor(hotspotData.alert.severity) }} />
                    <div>
                      <div className="text-xs font-semibold text-pearl">{hotspotData.alert.label}</div>
                      <div className="text-[0.58rem] font-mono uppercase mt-0.5" style={{ color: severityColor(hotspotData.alert.severity) }}>
                        {hotspotData.alert.severity}
                      </div>
                    </div>
                  </div>
                )}

                {/* Health score with animated bar */}
                <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[0.55rem] font-mono text-mist/50 uppercase">Ecosystem Health Score — {year}</div>
                    <div className="font-mono font-bold text-lg" style={{ color: healthColor(hotspotData.health) }}>
                      {hotspotData.health}<span className="text-xs text-mist/40">/100</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${hotspotData.health}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ background: `linear-gradient(90deg, ${healthColor(hotspotData.health)}, ${healthColor(hotspotData.health)}99)` }} />
                  </div>
                </div>

                {/* Year-varying metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Water Temp", value: `${hotspotData.temp}°C`, color: "#E8694A", show: layers.waterTemp },
                    { label: "Plastic mg/L", value: `${hotspotData.plastic}`, color: "#FF9F1C", show: layers.plastic },
                    { label: "Coral Cover", value: `${hotspotData.coralCover}%`, color: "#E91E8C", show: layers.coralHealth },
                    { label: "Biodiversity", value: `${hotspotData.biodiversity}/100`, color: "#4ECDC4", show: layers.biodiversity },
                    { label: "Oil Risk", value: `${hotspotData.oilRisk}/10`, color: "#7A8E9E", show: layers.oilSpills },
                    { label: "Ships/Day", value: `${hotspotData.shippingDensity}`, color: "#6C8EBD", show: layers.shipping },
                    { label: "Protected km²", value: `${hotspotData.protectedZone.toLocaleString()}`, color: "#2ECC71", show: layers.protected },
                    { label: "Ocean Health", value: `${hotspotData.health}/100`, color: "#2ECC71", show: layers.oceanHealth },
                  ].filter(m => m.show).map((m) => (
                    <div key={m.label} className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                      <div className="text-[0.52rem] font-mono text-mist/50 uppercase">{m.label}</div>
                      <div className="font-mono text-sm font-semibold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Year trend mini chart */}
                <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
                  <div className="text-[0.55rem] font-mono text-mist/50 uppercase mb-3">Health Score Trend 2018 – 2030</div>
                  <div className="flex items-end gap-1 h-12">
                    {YEARS.map((y) => {
                      const d = getHotspotData(activeHotspot, y);
                      const pct = d.health / 100;
                      const isSelected = y === year;
                      return (
                        <button key={y} onClick={() => setYear(y)}
                          className="flex-1 rounded-sm transition-all hover:opacity-80"
                          style={{
                            height: `${Math.max(8, pct * 100)}%`,
                            background: isSelected ? healthColor(d.health) : `${healthColor(d.health)}55`,
                            boxShadow: isSelected ? `0 0 6px ${healthColor(d.health)}80` : "none",
                          }}
                          title={`${y}: ${d.health}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1.5 text-[0.48rem] font-mono text-mist/30">
                    <span>2018</span><span>2024</span><span>2030</span>
                  </div>
                </div>

                {/* Species list */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.015] space-y-2">
                  <div className="text-[0.55rem] font-mono text-mist/50 uppercase">
                    Monitored Indicator Species ({activeCoord.speciesList.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCoord.speciesList.map((sp) => (
                      <span key={sp} className="px-2 py-0.5 rounded-md text-[0.6rem] font-mono border border-white/10 bg-white/5 text-mist">{sp}</span>
                    ))}
                  </div>
                </div>

                {/* Gemini scan */}
                <div className="p-4 rounded-xl border border-seafoam/20 bg-seafoam/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-seafoam">
                      <Sparkles className="w-3.5 h-3.5 text-seafoam" />
                      Gemini AI · {year} Forecast
                    </div>
                    <button onClick={handleRunGeminiScan} disabled={aiAnalyzing}
                      className="px-3 py-1 rounded-lg bg-seafoam text-abyss font-mono text-[0.62rem] font-bold hover:brightness-110 disabled:opacity-50 transition-all">
                      {aiAnalyzing ? "Analyzing..." : "Analyze"}
                    </button>
                  </div>
                  {aiAnalysisResult
                    ? <p className="text-xs text-pearl leading-relaxed font-light border-t border-seafoam/20 pt-2">{aiAnalysisResult}</p>
                    : <p className="text-[0.65rem] text-mist/60 leading-relaxed font-light">Run Gemini AI analysis for {activeHotspot} in {year}.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
