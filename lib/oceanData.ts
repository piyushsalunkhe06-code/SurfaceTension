export interface RegionData {
  id: string;
  name: string;
  temperature: number;
  salinity: number;
  oxygen: number;
  pollutionIndex: number;
  coralHealth: number;
  biodiversity: number;
  threatLevel: "Low" | "Moderate" | "High" | "Critical";
  healthScore: number;
  aiSummary: string;
  tempTrend: { m: string; v: number }[];
  radarData: { subject: string; value: number }[];
}

const baseTempTrend = (base: number) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
    m,
    v: parseFloat((base + i * 0.04 + Math.sin(i) * 0.05).toFixed(2)),
  }));

const radarForRegion = (r: number, b: number, s: number, p: number, c: number) => [
  { subject: "Reef", value: r },
  { subject: "Biodiverse", value: b },
  { subject: "Stability", value: s },
  { subject: "Purity", value: p },
  { subject: "Coverage", value: c },
];

export const REGION_DATA: Record<string, RegionData> = {
  pacific: {
    id: "pacific",
    name: "Pacific Ocean",
    temperature: 26.3,
    salinity: 35.1,
    oxygen: 7.2,
    pollutionIndex: 28,
    coralHealth: 74,
    biodiversity: 82,
    threatLevel: "Low",
    healthScore: 82,
    aiSummary:
      "Stable conditions across major circulation gyres. Coral systems show minor thermal stress in equatorial regions.",
    tempTrend: baseTempTrend(0.18),
    radarData: radarForRegion(74, 82, 78, 72, 80),
  },
  atlantic: {
    id: "atlantic",
    name: "Atlantic Ocean",
    temperature: 24.1,
    salinity: 36.4,
    oxygen: 6.4,
    pollutionIndex: 52,
    coralHealth: 56,
    biodiversity: 61,
    threatLevel: "Moderate",
    healthScore: 61,
    aiSummary:
      "Elevated microplastic concentration near the North Atlantic Gyre. Gulf Stream thermal anomaly continues.",
    tempTrend: baseTempTrend(0.28),
    radarData: radarForRegion(56, 61, 55, 48, 65),
  },
  indian: {
    id: "indian",
    name: "Indian Ocean",
    temperature: 28.6,
    salinity: 35.8,
    oxygen: 5.9,
    pollutionIndex: 61,
    coralHealth: 50,
    biodiversity: 58,
    threatLevel: "Moderate",
    healthScore: 58,
    aiSummary:
      "Warming trend persists in the Arabian Sea. Multiple bleaching zones reported near the Maldives Arc.",
    tempTrend: baseTempTrend(0.35),
    radarData: radarForRegion(50, 58, 52, 39, 60),
  },
  southern: {
    id: "southern",
    name: "Southern Ocean",
    temperature: 3.2,
    salinity: 34.2,
    oxygen: 9.8,
    pollutionIndex: 15,
    coralHealth: 88,
    biodiversity: 90,
    threatLevel: "Low",
    healthScore: 90,
    aiSummary:
      "Pristine biome. Krill populations remain stable. Ice sheet monitoring indicates seasonal variance.",
    tempTrend: baseTempTrend(0.08),
    radarData: radarForRegion(88, 90, 92, 85, 91),
  },
  arctic: {
    id: "arctic",
    name: "Arctic Ocean",
    temperature: -1.2,
    salinity: 30.5,
    oxygen: 11.2,
    pollutionIndex: 38,
    coralHealth: 22,
    biodiversity: 34,
    threatLevel: "Critical",
    healthScore: 34,
    aiSummary:
      "Rapid ice loss ongoing. Summer sea-ice extent is 40% below 2000 baseline. Permafrost methane release accelerating.",
    tempTrend: baseTempTrend(0.52),
    radarData: radarForRegion(22, 34, 28, 62, 40),
  },
  mediterranean: {
    id: "mediterranean",
    name: "Mediterranean Sea",
    temperature: 21.8,
    salinity: 38.2,
    oxygen: 5.6,
    pollutionIndex: 74,
    coralHealth: 38,
    biodiversity: 41,
    threatLevel: "Critical",
    healthScore: 41,
    aiSummary:
      "Heavily impacted by coastal runoff, overfishing, and shipping routes. Posidonia meadows under significant pressure.",
    tempTrend: baseTempTrend(0.42),
    radarData: radarForRegion(38, 41, 40, 26, 55),
  },
  southchina: {
    id: "southchina",
    name: "South China Sea",
    temperature: 29.4,
    salinity: 33.7,
    oxygen: 6.1,
    pollutionIndex: 66,
    coralHealth: 48,
    biodiversity: 55,
    threatLevel: "Moderate",
    healthScore: 55,
    aiSummary:
      "High fishing pressure and coastal development reducing habitat area. Coral recovery limited by elevated temperatures.",
    tempTrend: baseTempTrend(0.38),
    radarData: radarForRegion(48, 55, 44, 34, 60),
  },
  north: {
    id: "north",
    name: "North Sea",
    temperature: 14.3,
    salinity: 35.0,
    oxygen: 7.8,
    pollutionIndex: 49,
    coralHealth: 60,
    biodiversity: 62,
    threatLevel: "Moderate",
    healthScore: 62,
    aiSummary:
      "Industrial activity and shipping routes create moderate stress. Cold-water coral habitats showing partial recovery.",
    tempTrend: baseTempTrend(0.22),
    radarData: radarForRegion(60, 62, 65, 51, 70),
  },
};

// Adjust healthScore based on year (forecast degrades for future years if threat is high)
export function getRegionDataForYear(id: string, year: number): RegionData {
  const base = REGION_DATA[id];
  if (!base) return base;
  const delta = year - 2024;
  const factor = base.threatLevel === "Critical" ? 2.2 : base.threatLevel === "High" ? 1.4 : 0.6;
  const adjusted = Math.max(10, Math.round(base.healthScore - delta * factor));
  const adjCoral = Math.max(5, Math.round(base.coralHealth - delta * factor * 1.1));
  return { ...base, healthScore: adjusted, coralHealth: adjCoral };
}
