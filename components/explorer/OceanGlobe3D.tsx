"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { USDZLoader } from "three/examples/jsm/loaders/USDZLoader.js";

export type SurfaceType = "ocean" | "river" | "land";

export interface ClickedCoordinateInfo {
  lat: number;
  lon: number;
  latFormatted: string;
  lonFormatted: string;
  surfaceType: SurfaceType;
  locationName: string;
  elevationOrDepth: string;
  surfaceTemp: number;
  secondaryTemp?: number;
  salinityOrNDVI: string;
  oxygenOrMoisture: string;
  healthOrRiskScore: number;
  pollutionOrDeforestation: number;
  microplasticsOrFlowRate: string;
  speciesList: string[];
  telemetryStatus: string;
  aiSummary: string;
  point3D: [number, number, number];
}

// Convert Lat/Lon to 3D Vector on sphere radius R
export function latLonToVector3(lat: number, lon: number, radius = 2.02): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

// Convert 3D Point on sphere (radius R) to Latitude and Longitude
export function vector3ToLatLon(point: THREE.Vector3, radius = 2.0): { lat: number; lon: number } {
  const normalized = point.clone().normalize();
  const lat = Math.asin(normalized.y) * (180 / Math.PI);
  let lon = Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

// Helper to test if coordinate is Land, River, or Ocean
export function classifyCoordinate(lat: number, lon: number): { surfaceType: SurfaceType; name: string } {
  // 1. Major River Systems Check
  if (lat >= -12 && lat <= 4 && lon >= -75 && lon <= -48) {
    return { surfaceType: "river", name: "Amazon River & Basin System" };
  }
  if (lat >= 4 && lat <= 32 && lon >= 28 && lon <= 35) {
    return { surfaceType: "river", name: "Nile River Fluvial Corridor" };
  }
  if (lat >= 28 && lat <= 48 && lon >= -110 && lon <= -88) {
    return { surfaceType: "river", name: "Mississippi-Missouri River Watershed" };
  }
  if (lat >= 24 && lat <= 35 && lon >= 100 && lon <= 123) {
    return { surfaceType: "river", name: "Yangtze (Chang Jiang) River Waterway" };
  }
  if (lat >= 44 && lat <= 52 && lon >= 6 && lon <= 30) {
    return { surfaceType: "river", name: "Danube & Rhine European River Network" };
  }
  if (lat >= -10 && lat <= 6 && lon >= 12 && lon <= 30) {
    return { surfaceType: "river", name: "Congo Equatorial River System" };
  }
  if (lat >= 20 && lat <= 28 && lon >= 75 && lon <= 92) {
    return { surfaceType: "river", name: "Ganges-Brahmaputra River Delta" };
  }
  if (lat >= 23 && lat <= 36 && lon >= 67 && lon <= 76) {
    return { surfaceType: "river", name: "Indus River Fluvial Basin" };
  }
  if (lat >= 10 && lat <= 30 && lon >= 98 && lon <= 108) {
    return { surfaceType: "river", name: "Mekong River System" };
  }
  if (lat >= 45 && lat <= 60 && lon >= 38 && lon <= 55) {
    return { surfaceType: "river", name: "Volga River Basin" };
  }

  // 2. Continental Landmass Check
  const isAntarctica = lat < -60;
  const isGreenland = lat > 60 && lon > -70 && lon < -10;
  const isNorthAmerica = lat > 12 && lat < 75 && lon > -170 && lon < -50;
  const isSouthAmerica = lat > -56 && lat < 12 && lon > -82 && lon < -34;
  const isEurasia = lat > 5 && lat < 75 && lon > -10 && lon < 180;
  const isAfrica = lat > -35 && lat < 38 && lon > -18 && lon < 52;
  const isAustralia = lat > -45 && lat < -10 && lon > 110 && lon < 155;

  if (isAntarctica) return { surfaceType: "land", name: "Antarctic Ice Plateau" };
  if (isGreenland) return { surfaceType: "land", name: "Greenland Glacier Sheet" };
  if (isNorthAmerica) {
    if (lat > 35) return { surfaceType: "land", name: "North American Great Plains / Boreal" };
    return { surfaceType: "land", name: "Sierra Madre & Central Plateau" };
  }
  if (isSouthAmerica) {
    if (lat < -30) return { surfaceType: "land", name: "Patagonian Steppe & Andes" };
    return { surfaceType: "land", name: "Amazonian Continental Canopy" };
  }
  if (isAfrica) {
    if (lat > 15) return { surfaceType: "land", name: "Sahara Desert Arid Plateau" };
    return { surfaceType: "land", name: "Sub-Saharan Savannah & Highlands" };
  }
  if (isEurasia) {
    if (lat > 25 && lat < 38 && lon > 70 && lon < 100) return { surfaceType: "land", name: "Himalayan High Alpine Range" };
    if (lat > 15 && lat < 35 && lon > 35 && lon < 65) return { surfaceType: "land", name: "Arabian Peninsula Desert" };
    if (lat > 50) return { surfaceType: "land", name: "Siberian Taiga Boreal Zone" };
    return { surfaceType: "land", name: "Eurasian Steppe & Temperate Zone" };
  }
  if (isAustralia) {
    if (lon < 135) return { surfaceType: "land", name: "Australian Outback Arid Shield" };
    return { surfaceType: "land", name: "Great Dividing Range" };
  }

  // 3. Marine Ocean Basins
  if (lat > 65) return { surfaceType: "ocean", name: "Arctic Ocean Basin" };
  if (lat < -55) return { surfaceType: "ocean", name: "Southern Antarctic Ocean Current" };
  if (lon > 135 && lon < 155 && lat > 10 && lat < 25) return { surfaceType: "ocean", name: "Mariana Hadal Trench Sector" };
  if (lon > -180 && lon < -100) return { surfaceType: "ocean", name: "Pacific Ocean Gyre" };
  if (lon > -80 && lon < -10) return { surfaceType: "ocean", name: "North Atlantic Ridge Sector" };
  if (lon > 40 && lon < 110) return { surfaceType: "ocean", name: "Indian Ocean Basin" };
  if (lon > -10 && lon < 40 && lat > 30 && lat < 46) return { surfaceType: "ocean", name: "Mediterranean Sea Deep Basin" };

  return { surfaceType: "ocean", name: "Global Oceanic Trench & Abyssal Plain" };
}

// Generate realistic telemetric data based on exact SurfaceType (River vs Land vs Ocean)
export function generateCoordinateData(lat: number, lon: number, point3D: [number, number, number]): ClickedCoordinateInfo {
  const latFormatted = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonFormatted = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;

  const { surfaceType, name: locationName } = classifyCoordinate(lat, lon);

  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const hashFrac = hash - Math.floor(hash);

  if (surfaceType === "river") {
    const flowRates: Record<string, string> = {
      "Amazon River & Basin System": "209,000 m³/s",
      "Nile River Fluvial Corridor": "2,830 m³/s",
      "Mississippi-Missouri River Watershed": "16,700 m³/s",
      "Yangtze (Chang Jiang) River Waterway": "30,100 m³/s",
      "Danube & Rhine European River Network": "6,500 m³/s",
      "Congo Equatorial River System": "41,000 m³/s",
      "Ganges-Brahmaputra River Delta": "38,000 m³/s",
      "Indus River Fluvial Basin": "6,600 m³/s",
      "Mekong River System": "16,000 m³/s",
    };
    const flowRate = flowRates[locationName] || `${Math.floor(4000 + hashFrac * 12000)} m³/s`;
    const temp = parseFloat((22.4 + hashFrac * 6.5).toFixed(1));
    const elevation = `+${Math.floor(45 + hashFrac * 350)} m`;
    const health = Math.floor(55 + hashFrac * 30);

    const speciesMap: Record<string, string[]> = {
      "Amazon River & Basin System": ["Amazon River Dolphin (Boto)", "Arapaima (Pirarucu)", "Giant River Otter", "Electric Eel"],
      "Nile River Fluvial Corridor": ["Nile Crocodile", "Nile Perch", "African Softshell Turtle", "Papyrus Sedge"],
      "Mississippi-Missouri River Watershed": ["Alligator Gar", "American Paddlefish", "Snapping Turtle", "River Otter"],
      "Yangtze (Chang Jiang) River Waterway": ["Chinese Sturgeon", "Finless Porpoise", "Giant Salamander"],
      "Congo Equatorial River System": ["Goliath Tigerfish", "Congo Bichir", "African Manatee"],
      "Ganges-Brahmaputra River Delta": ["Ganges River Dolphin", "Gharial Crocodile", "Hilsa Shad"],
    };
    const speciesList = speciesMap[locationName] || ["Freshwater Otter", "Yellow Catfish", "Riparian Heron", "River Trout"];

    return {
      lat, lon, latFormatted, lonFormatted,
      surfaceType: "river",
      locationName,
      elevationOrDepth: elevation,
      surfaceTemp: temp,
      secondaryTemp: parseFloat((temp - 4.2).toFixed(1)),
      salinityOrNDVI: "< 0.2 PSU (Freshwater)",
      oxygenOrMoisture: `${(7.4 + hashFrac * 1.5).toFixed(1)} mg/L (O²)`,
      healthOrRiskScore: health,
      pollutionOrDeforestation: Math.floor(100 - health + hashFrac * 12),
      microplasticsOrFlowRate: flowRate,
      speciesList,
      telemetryStatus: "Active Fluvial Hydro-Stream & Discharge Gauge",
      aiSummary: `Fluvial Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Major river channel flow rate measured at ${flowRate}. Water temperature is ${temp}°C with ultra-low freshwater salinity (<0.2 PSU). Sediment runoff index is ${Math.floor(120 + hashFrac * 200)} mg/L. Key species present include ${speciesList.slice(0, 2).join(" and ")}.`,
      point3D,
    };
  }

  if (surfaceType === "land") {
    const isArid = locationName.includes("Desert") || locationName.includes("Outback");
    const isAlpine = locationName.includes("Alpine") || locationName.includes("Himalayan") || locationName.includes("Patagonian");
    const isPolar = locationName.includes("Antarctic") || locationName.includes("Greenland") || locationName.includes("Siberian");

    let temp = 26.8;
    let elevation = `+${Math.floor(150 + hashFrac * 600)} m`;
    let ndvi = "0.74 (Lush Canopy)";
    let moisture = "78% Soil Moisture";

    if (isArid) {
      temp = parseFloat((36.5 + hashFrac * 8.0).toFixed(1));
      elevation = `+${Math.floor(250 + hashFrac * 500)} m`;
      ndvi = "0.08 (Arid Sand / Rock)";
      moisture = "9% Soil Moisture";
    } else if (isAlpine) {
      temp = parseFloat((2.5 - hashFrac * 12.0).toFixed(1));
      elevation = `+${Math.floor(2800 + hashFrac * 3500)} m`;
      ndvi = "0.22 (Alpine Scrub)";
      moisture = "42% Glacial Moisture";
    } else if (isPolar) {
      temp = parseFloat((-18.5 - hashFrac * 15.0).toFixed(1));
      elevation = `+${Math.floor(1200 + hashFrac * 1800)} m`;
      ndvi = "0.01 (Ice Cap)";
      moisture = "98% Frozen Glacial Ice";
    }

    const health = Math.floor(60 + hashFrac * 32);

    const landSpecies: Record<string, string[]> = {
      "Amazonian Continental Canopy": ["Jaguar", "Harpy Eagle", "Howler Monkey", "Poison Dart Frog"],
      "Sahara Desert Arid Plateau": ["Fennec Fox", "Addax Antelope", "Horned Viper", "Dromedary Camel"],
      "Himalayan High Alpine Range": ["Snow Leopard", "Himalayan Monal", "Blue Sheep (Bharal)", "Red Panda"],
      "Antarctic Ice Plateau": ["Emperor Penguin", "Snow Petrel", "Weddell Seal (Coastal)"],
      "Australian Outback Arid Shield": ["Red Kangaroo", "Thorny Devil", "Wedge-tailed Eagle", "Perentie Monitor"],
    };
    const speciesList = landSpecies[locationName] || ["Gray Wolf", "Peregrine Falcon", "Red Deer", "Boreal Owl"];

    return {
      lat, lon, latFormatted, lonFormatted,
      surfaceType: "land",
      locationName,
      elevationOrDepth: elevation,
      surfaceTemp: temp,
      secondaryTemp: parseFloat((temp - 8.5).toFixed(1)),
      salinityOrNDVI: ndvi,
      oxygenOrMoisture: moisture,
      healthOrRiskScore: health,
      pollutionOrDeforestation: Math.floor(100 - health + hashFrac * 10),
      microplasticsOrFlowRate: `${Math.floor(15 + hashFrac * 40)}% Habitat Risk`,
      speciesList,
      telemetryStatus: "Active Satellite Vegetation & Land Thermal Scan",
      aiSummary: `Terrestrial Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Land elevation calculated at ${elevation}. Surface temperature registered at ${temp}°C with Normalized Difference Vegetation Index (NDVI) of ${ndvi}. Deforestation & habitat alteration risk score is ${Math.floor(100 - health)}/100. Primary fauna signatures match ${speciesList.slice(0, 2).join(" and ")}.`,
      point3D,
    };
  }

  // Ocean
  const depthMeters = Math.floor(-3200 - hashFrac * 3500);
  const temp = parseFloat((18.5 + hashFrac * 7.2).toFixed(1));
  const deepTemp = parseFloat((1.8 + hashFrac * 1.4).toFixed(1));
  const salinity = `${(34.8 + hashFrac * 1.1).toFixed(1)} PSU (Marine)`;
  const oxygen = `${(5.4 + hashFrac * 1.6).toFixed(1)} mg/L (O²)`;
  const health = Math.floor(62 + hashFrac * 30);
  const microplastics = `${Math.floor(900 + hashFrac * 3200)} /m³`;

  const oceanSpecies: Record<string, string[]> = {
    "Mariana Hadal Trench Sector": ["Mariana Snailfish", "Giant Amphipod", "Xenophyophore"],
    "Pacific Ocean Gyre": ["Sperm Whale", "Pacific Bluefin Tuna", "Manta Ray"],
    "North Atlantic Ridge Sector": ["North Atlantic Right Whale", "Hydrothermal Vent Flora", "Deep Sea Coral"],
    "Southern Antarctic Ocean Current": ["Blue Whale", "Antarctic Krill", "Colossal Squid"],
  };
  const speciesList = oceanSpecies[locationName] || ["Lanternfish", "Pelagic Shark", "Phytoplankton", "Sea Turtle"];

  return {
    lat, lon, latFormatted, lonFormatted,
    surfaceType: "ocean",
    locationName,
    elevationOrDepth: `${Math.abs(depthMeters)} m (Depth)`,
    surfaceTemp: temp,
    secondaryTemp: deepTemp,
    salinityOrNDVI: salinity,
    oxygenOrMoisture: oxygen,
    healthOrRiskScore: health,
    pollutionOrDeforestation: Math.floor(100 - health),
    microplasticsOrFlowRate: microplastics,
    speciesList,
    telemetryStatus: "Active Bathymetric Radar & Deep AUG Sentinel Stream",
    aiSummary: `Oceanic Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Sea floor bathymetry depth at ${Math.abs(depthMeters)}m. Sea surface temperature is ${temp}°C (Abyssal: ${deepTemp}°C) with ocean salinity of ${salinity}. Microplastic concentration is estimated at ${microplastics}. Primary marine species present include ${speciesList.slice(0, 2).join(" and ")}.`,
    point3D,
  };
}

// REAL GEOGRAPHIC CONTINENT POLYGON PATHS (True Earth geography, no ovals/ellipses!)
const CONTINENT_POLYGONS: { points: [number, number][]; color: string; shelfColor: string }[] = [
  // North America
  {
    color: "#27482D",
    shelfColor: "#10637A",
    points: [
      [-168, 65], [-160, 71], [-140, 69], [-120, 75], [-90, 78], [-75, 73], [-60, 60],
      [-55, 48], [-65, 44], [-75, 35], [-80, 25], [-90, 16], [-100, 16], [-105, 20],
      [-118, 32], [-124, 40], [-130, 50], [-150, 60], [-168, 65]
    ],
  },
  // South America
  {
    color: "#224A2A",
    shelfColor: "#0F5F78",
    points: [
      [-78, 12], [-70, 12], [-60, 8], [-50, -2], [-35, -5], [-37, -15], [-48, -28],
      [-65, -42], [-75, -52], [-74, -45], [-72, -30], [-78, -15], [-81, -5], [-78, 12]
    ],
  },
  // Africa
  {
    color: "#2B472E",
    shelfColor: "#126882",
    points: [
      [-17, 32], [10, 37], [25, 32], [32, 31], [34, 27], [43, 12], [51, 11],
      [42, -5], [36, -20], [33, -33], [25, -34], [18, -34], [12, -15], [9, 4],
      [-15, 12], [-17, 21], [-17, 32]
    ],
  },
  // Europe
  {
    color: "#2C4C30",
    shelfColor: "#14708A",
    points: [
      [-10, 36], [-10, 43], [-2, 44], [-5, 48], [4, 52], [0, 58], [5, 62],
      [15, 56], [25, 60], [30, 70], [45, 68], [55, 60], [40, 45], [25, 40],
      [15, 38], [5, 43], [-10, 36]
    ],
  },
  // Asia
  {
    color: "#305033",
    shelfColor: "#157792",
    points: [
      [55, 60], [70, 72], [100, 77], [130, 72], [170, 66], [180, 65], [160, 55],
      [140, 50], [130, 40], [120, 30], [110, 20], [105, 10], [98, 10], [90, 22],
      [78, 8], [72, 20], [60, 25], [50, 30], [45, 40], [55, 60]
    ],
  },
  // Australia
  {
    color: "#334D35",
    shelfColor: "#136A84",
    points: [
      [114, -22], [125, -14], [136, -12], [142, -11], [150, -22], [153, -28],
      [150, -37], [138, -35], [130, -32], [116, -35], [114, -22]
    ],
  },
  // Greenland
  {
    color: "#E2EEF2",
    shelfColor: "#7AB0C4",
    points: [
      [-55, 60], [-40, 65], [-20, 70], [-20, 82], [-50, 83], [-70, 76], [-55, 60]
    ],
  },
];

// PHOTOREALISTIC EARTH TEXTURE ENGINE (True Satellite Imagery Simulation)
function buildPhotorealisticEarthTex(): { map: THREE.CanvasTexture; specular: THREE.CanvasTexture } {
  const W = 2048;
  const H = 1024;

  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = W; mapCanvas.height = H;
  const mapCtx = mapCanvas.getContext("2d")!;

  const specCanvas = document.createElement("canvas");
  specCanvas.width = W; specCanvas.height = H;
  const specCtx = specCanvas.getContext("2d")!;

  const gx = (lon: number) => ((lon + 180) / 360) * W;
  const gy = (lat: number) => ((90 - lat) / 180) * H;

  // 1. Ocean Depth Bathymetry Gradient
  const oceanGrad = mapCtx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0.0, "#010A17");
  oceanGrad.addColorStop(0.2, "#021836");
  oceanGrad.addColorStop(0.5, "#03284E");
  oceanGrad.addColorStop(0.8, "#021531");
  oceanGrad.addColorStop(1.0, "#010714");
  mapCtx.fillStyle = oceanGrad;
  mapCtx.fillRect(0, 0, W, H);

  // Ocean Specular Map (White = Highly Reflective Water Surface)
  specCtx.fillStyle = "#FFFFFF";
  specCtx.fillRect(0, 0, W, H);

  // 2. Render True Geographic Landmass Polygons
  CONTINENT_POLYGONS.forEach((cont) => {
    // Coastal Shallow Bathymetry Shelf Glow
    mapCtx.fillStyle = cont.shelfColor;
    mapCtx.filter = "blur(14px)";
    mapCtx.beginPath();
    cont.points.forEach(([lon, lat], i) => {
      if (i === 0) mapCtx.moveTo(gx(lon), gy(lat));
      else mapCtx.lineTo(gx(lon), gy(lat));
    });
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.filter = "none";

    // Main Continental Landmass
    mapCtx.fillStyle = cont.color;
    mapCtx.beginPath();
    cont.points.forEach(([lon, lat], i) => {
      if (i === 0) mapCtx.moveTo(gx(lon), gy(lat));
      else mapCtx.lineTo(gx(lon), gy(lat));
    });
    mapCtx.closePath();
    mapCtx.fill();

    // Specular Map: Land is Matte Black
    specCtx.fillStyle = "#000000";
    specCtx.beginPath();
    cont.points.forEach(([lon, lat], i) => {
      if (i === 0) specCtx.moveTo(gx(lon), gy(lat));
      else specCtx.lineTo(gx(lon), gy(lat));
    });
    specCtx.closePath();
    specCtx.fill();
  });

  // 3. Render Arid Desert Zones (Sahara, Gobi, Australian Outback, Arabia)
  mapCtx.fillStyle = "#B39562";
  const drawDesert = (pts: [number, number][]) => {
    mapCtx.beginPath();
    pts.forEach(([lon, lat], i) => {
      if (i === 0) mapCtx.moveTo(gx(lon), gy(lat));
      else mapCtx.lineTo(gx(lon), gy(lat));
    });
    mapCtx.closePath();
    mapCtx.fill();
  };
  // Sahara & Arabia
  drawDesert([[-15, 30], [35, 30], [55, 25], [50, 15], [35, 12], [10, 15], [-15, 30]]);
  // Gobi
  drawDesert([[80, 45], [110, 48], [115, 40], [85, 38], [80, 45]]);
  // Australian Outback
  drawDesert([[118, -20], [140, -22], [138, -32], [118, -30], [118, -20]]);

  // 4. Render Major Fluvial Rivers (Amazon, Nile, Mississippi, Yangtze, Rhine, Congo, Ganges)
  mapCtx.strokeStyle = "#4ECDC4";
  mapCtx.lineWidth = 3.5;
  const drawRiver = (pts: [number, number][]) => {
    mapCtx.beginPath();
    pts.forEach(([lon, lat], i) => {
      if (i === 0) mapCtx.moveTo(gx(lon), gy(lat));
      else mapCtx.lineTo(gx(lon), gy(lat));
    });
    mapCtx.stroke();
  };
  drawRiver([[-75, -3], [-65, -3], [-54, -1]]); // Amazon
  drawRiver([[31, 3], [31, 15], [31, 31]]); // Nile
  drawRiver([[-94, 46], [-90, 38], [-89, 29]]); // Mississippi
  drawRiver([[100, 33], [112, 31], [121, 31]]); // Yangtze
  drawRiver([[8, 48], [12, 50], [18, 48], [28, 45]]); // Danube
  drawRiver([[15, -4], [22, -1], [25, 4]]); // Congo
  drawRiver([[78, 30], [85, 26], [90, 23]]); // Ganges

  // 5. Polar Ice Sheets
  mapCtx.fillStyle = "#F0F7F9";
  mapCtx.fillRect(0, 0, W, gy(72)); // Arctic
  mapCtx.fillRect(0, gy(-65), W, H - gy(-65)); // Antarctica
  specCtx.fillStyle = "#222222";
  specCtx.fillRect(0, 0, W, gy(72));
  specCtx.fillRect(0, gy(-65), W, H - gy(-65));

  const mapTex = new THREE.CanvasTexture(mapCanvas);
  const specTex = new THREE.CanvasTexture(specCanvas);

  return { map: mapTex, specular: specTex };
}

// Model & Sphere Loader Component with USDZ Support & High-Res Texture Fallback
function PhotorealisticEarth({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const [usdzGroup, setUsdzGroup] = useState<THREE.Object3D | null>(null);

  const { map, specular } = useMemo(() => buildPhotorealisticEarthTex(), []);

  // Attempt to load Earth_1_12756.usdz model from public folder
  useEffect(() => {
    const loader = new USDZLoader();
    loader.load(
      "/Earth_1_12756.usdz",
      (usdzScene) => {
        usdzScene.scale.set(0.002, 0.002, 0.002);
        setUsdzGroup(usdzScene);
      },
      undefined,
      (err) => {
        console.log("USDZ Model fallback to procedural texture planet:", err);
      }
    );
  }, []);

  useFrame((_, delta) => {
    if (cloudMeshRef.current) {
      cloudMeshRef.current.rotation.y += delta * 0.02;
    }
    if (earthGroupRef.current && !activeCoord) {
      earthGroupRef.current.rotation.y += delta * 0.03;
    }
  });

  const atmoVert = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const atmoFrag = `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
      gl_FragColor = vec4(0.12, 0.68, 0.88, 1.0) * intensity;
    }
  `;

  const handleSphereClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!e.point) return;
    const localPoint = e.object.worldToLocal(e.point.clone());
    const { lat, lon } = vector3ToLatLon(localPoint, 2.0);
    const coordInfo = generateCoordinateData(lat, lon, [e.point.x, e.point.y, e.point.z]);
    onCoordinateClick(coordInfo);
  };

  const beaconColor = activeCoord
    ? activeCoord.surfaceType === "river"
      ? "#4ECDC4"
      : activeCoord.surfaceType === "land"
      ? "#2ECC71"
      : "#85ECD4"
    : "#85ECD4";

  return (
    <group ref={earthGroupRef}>
      {/* Primary Photorealistic Earth Mesh */}
      <mesh onClick={handleSphereClick}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshPhongMaterial
          map={map}
          specularMap={specular}
          specular={new THREE.Color("#2EC4E0")}
          shininess={30}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudMeshRef} scale={1.018}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Atmosphere Glow */}
      <mesh scale={1.22}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Active Clicked Coordinate 3D Beacon Pin */}
      {activeCoord && (
        <group position={latLonToVector3(activeCoord.lat, activeCoord.lon, 2.04)}>
          {/* Beacon Core */}
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color={beaconColor}
              emissive={beaconColor}
              emissiveIntensity={2.8}
            />
          </mesh>

          {/* Pulse Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.08, 32]} />
            <meshBasicMaterial color={beaconColor} side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>

          {/* HTML Label */}
          <Html center distanceFactor={5.0}>
            <div
              className="pointer-events-none whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.68rem] font-mono font-bold flex items-center gap-2 shadow-2xl"
              style={{
                background: "rgba(3,14,26,0.95)",
                border: `1px solid ${beaconColor}`,
                color: beaconColor,
                boxShadow: `0 0 20px ${beaconColor}66`,
              }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: beaconColor }} />
              <span className="uppercase">{activeCoord.surfaceType} · {activeCoord.latFormatted}, {activeCoord.lonFormatted}</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// Background Starfield
function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 25 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#FFFFFF" transparent opacity={0.6} />
    </points>
  );
}

export function OceanGlobe3D({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={2.2} color="#F0F8FF" />
      <pointLight position={[-4, -2, -2]} intensity={0.6} color="#0096B7" />

      <Starfield />

      <PhotorealisticEarth
        onCoordinateClick={onCoordinateClick}
        activeCoord={activeCoord}
      />

      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={9.5}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
        autoRotate={!activeCoord}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
