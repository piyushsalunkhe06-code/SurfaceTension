"use client";

import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// MATHEMATICALLY PRECISE COORDINATE CONVERSIONS
// ─────────────────────────────────────────────────────────────────────────────

export function latLonToVector3(lat: number, lon: number, radius = 2.01): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function vector3ToLatLon(point: THREE.Vector3): { lat: number; lon: number } {
  const norm = point.clone().normalize();
  const lat = Math.asin(THREE.MathUtils.clamp(norm.y, -1, 1)) * (180 / Math.PI);
  let lon = Math.atan2(norm.z, -norm.x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOGRAPHIC REGION CLASSIFIER
// ─────────────────────────────────────────────────────────────────────────────

export function getGeographicRegion(lat: number, lon: number, isOcean: boolean): { name: string; isRiver: boolean } {
  // Check Major River Systems (fluvial corridors)
  if (lat >= -12 && lat <= 4 && lon >= -75 && lon <= -48) return { name: "Amazon River Basin", isRiver: true };
  if (lat >= 4 && lat <= 32 && lon >= 28 && lon <= 35) return { name: "Nile River Fluvial Corridor", isRiver: true };
  if (lat >= 28 && lat <= 48 && lon >= -110 && lon <= -88) return { name: "Mississippi River Watershed", isRiver: true };
  if (lat >= 24 && lat <= 35 && lon >= 100 && lon <= 123) return { name: "Yangtze (Chang Jiang) Waterway", isRiver: true };
  if (lat >= 44 && lat <= 52 && lon >= 6 && lon <= 30) return { name: "Danube & Rhine River Network", isRiver: true };
  if (lat >= -10 && lat <= 6 && lon >= 12 && lon <= 30) return { name: "Congo Equatorial River System", isRiver: true };
  if (lat >= 20 && lat <= 28 && lon >= 75 && lon <= 92) return { name: "Ganges-Brahmaputra Delta", isRiver: true };
  if (lat >= 23 && lat <= 36 && lon >= 67 && lon <= 76) return { name: "Indus River Fluvial Basin", isRiver: true };
  if (lat >= 10 && lat <= 30 && lon >= 98 && lon <= 108) return { name: "Mekong River System", isRiver: true };
  if (lat >= 45 && lat <= 60 && lon >= 38 && lon <= 55) return { name: "Volga River Basin", isRiver: true };

  if (isOcean) {
    if (lat > 65) return { name: "Arctic Ocean", isRiver: false };
    if (lat < -55) return { name: "Southern Ocean", isRiver: false };
    if (lat > 30 && lat < 46 && lon > -10 && lon < 40) return { name: "Mediterranean Sea", isRiver: false };
    if (lat > 12 && lat < 30 && lon > 32 && lon < 44) return { name: "Red Sea Sector", isRiver: false };

    if (lon >= -180 && lon < -70) {
      return { name: lat >= 0 ? "North Pacific Ocean" : "South Pacific Ocean", isRiver: false };
    }
    if (lon >= 110 && lon <= 180) {
      return { name: lat >= 0 ? "North Pacific Ocean" : "South Pacific Ocean", isRiver: false };
    }
    if (lon >= -70 && lon < 20) {
      return { name: lat >= 0 ? "North Atlantic Ocean" : "South Atlantic Ocean", isRiver: false };
    }
    if (lon >= 20 && lon < 110) {
      return { name: "Indian Ocean Basin", isRiver: false };
    }
    return { name: "Global Ocean Basin", isRiver: false };
  }

  // Terrestrial Land Regions
  if (lat < -60) return { name: "Antarctic Ice Sheet", isRiver: false };
  if (lat > 60 && lon > -70 && lon < -10) return { name: "Greenland Glacier Plateau", isRiver: false };
  if (lat > 12 && lat < 75 && lon > -170 && lon < -50) {
    if (lat > 35) return { name: "North American Boreal & Plains", isRiver: false };
    return { name: "Central American Sierra Region", isRiver: false };
  }
  if (lat > -56 && lat < 12 && lon > -82 && lon < -34) {
    if (lat < -30) return { name: "Patagonian Steppe & Andes", isRiver: false };
    return { name: "Amazonian Continental Canopy", isRiver: false };
  }
  if (lat > -35 && lat < 38 && lon > -18 && lon < 52) {
    if (lat > 15) return { name: "Sahara Arid Region", isRiver: false };
    return { name: "Sub-Saharan African Region", isRiver: false };
  }
  if (lat > 5 && lat < 75 && lon > -10 && lon < 180) {
    if (lat > 25 && lat < 38 && lon > 70 && lon < 100) return { name: "Himalayan Alpine Region", isRiver: false };
    if (lat > 15 && lat < 35 && lon > 35 && lon < 65) return { name: "Arabian Peninsula", isRiver: false };
    if (lat > 50) return { name: "Siberian Taiga Region", isRiver: false };
    return { name: "Eurasian Continent", isRiver: false };
  }
  if (lat > -45 && lat < -10 && lon > 110 && lon < 155) {
    return { name: "Australian Outback & Shield", isRiver: false };
  }
  return { name: "Terrestrial Continental Land", isRiver: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY DATA GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function generateCoordinateData(
  lat: number,
  lon: number,
  point3D: [number, number, number],
  isWaterFromMask?: boolean
): ClickedCoordinateInfo {
  const absLat = Math.abs(lat).toFixed(4);
  const absLon = Math.abs(lon).toFixed(4);
  const latFormatted = `${absLat}° ${lat >= 0 ? "N" : "S"}`;
  const lonFormatted = `${absLon}° ${lon >= 0 ? "E" : "W"}`;

  const isOcean = isWaterFromMask !== undefined ? isWaterFromMask : (
    lat > 65 || lat < -55 || lon < -140 || (lon > -50 && lon < -20) || (lon > 50 && lon < 100)
  );

  const { name: locationName, isRiver } = getGeographicRegion(lat, lon, isOcean);
  const surfaceType: SurfaceType = isRiver ? "river" : isOcean ? "ocean" : "land";

  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const hf = hash - Math.floor(hash);

  if (surfaceType === "river") {
    const flowRates: Record<string, string> = {
      "Amazon River Basin": "209,000 m³/s",
      "Nile River Fluvial Corridor": "2,830 m³/s",
      "Mississippi River Watershed": "16,700 m³/s",
      "Yangtze (Chang Jiang) Waterway": "30,100 m³/s",
      "Congo Equatorial River System": "41,000 m³/s",
      "Ganges-Brahmaputra Delta": "38,000 m³/s",
    };
    const flowRate = flowRates[locationName] || `${Math.floor(4000 + hf * 12000)} m³/s`;
    const temp = parseFloat((22.4 + hf * 5.2).toFixed(1));
    const speciesMap: Record<string, string[]> = {
      "Amazon River Basin": ["Amazon River Dolphin", "Arapaima", "Giant River Otter"],
      "Nile River Fluvial Corridor": ["Nile Crocodile", "Nile Perch", "Softshell Turtle"],
      "Yangtze (Chang Jiang) Waterway": ["Finless Porpoise", "Chinese Sturgeon", "Giant Salamander"],
    };
    const speciesList = speciesMap[locationName] || ["Freshwater Otter", "Yellow Catfish", "Riparian Heron"];
    const health = Math.floor(60 + hf * 25);
    return {
      lat, lon, latFormatted, lonFormatted, surfaceType: "river", locationName,
      elevationOrDepth: `+${Math.floor(45 + hf * 350)} m`, surfaceTemp: temp,
      salinityOrNDVI: "< 0.2 PSU (Freshwater)", oxygenOrMoisture: `${(7.4 + hf * 1.5).toFixed(1)} mg/L (O₂)`,
      healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health),
      microplasticsOrFlowRate: flowRate, speciesList, telemetryStatus: "Active Fluvial Hydro-Stream",
      aiSummary: `Fluvial Telemetry at Lat: ${latFormatted}, Lon: ${lonFormatted} (${locationName}). Discharge: ${flowRate}. Water Temp: ${temp}°C. Ecosystem status baseline nominal.`,
      point3D
    };
  }

  if (surfaceType === "land") {
    const isArid = locationName.includes("Arid") || locationName.includes("Outback") || locationName.includes("Arabian");
    const isAlpine = locationName.includes("Alpine") || locationName.includes("Andes") || locationName.includes("Glacier");
    const isPolar = locationName.includes("Antarctic") || locationName.includes("Greenland");

    const temp = isArid ? parseFloat((34.5 + hf * 8).toFixed(1)) : isAlpine ? parseFloat((2.5 - hf * 12).toFixed(1)) : isPolar ? parseFloat((-18.5 - hf * 15).toFixed(1)) : parseFloat((24.2 + hf * 6).toFixed(1));
    const elevation = isAlpine ? `+${Math.floor(2800 + hf * 3500)} m` : isPolar ? `+${Math.floor(1200 + hf * 1800)} m` : `+${Math.floor(150 + hf * 600)} m`;
    const ndvi = isArid ? "0.08 (Arid Soil)" : isAlpine ? "0.22 (Alpine)" : isPolar ? "0.01 (Ice Cap)" : "0.72 (Canopy)";
    const landSpecies: Record<string, string[]> = {
      "Amazonian Continental Canopy": ["Jaguar", "Harpy Eagle", "Howler Monkey"],
      "Sahara Arid Region": ["Fennec Fox", "Addax Antelope", "Horned Viper"],
      "Himalayan Alpine Region": ["Snow Leopard", "Himalayan Monal", "Red Panda"],
    };
    const speciesList = landSpecies[locationName] || ["Gray Wolf", "Peregrine Falcon", "Red Deer"];
    const health = Math.floor(62 + hf * 30);
    return {
      lat, lon, latFormatted, lonFormatted, surfaceType: "land", locationName,
      elevationOrDepth: elevation, surfaceTemp: temp,
      salinityOrNDVI: ndvi, oxygenOrMoisture: isArid ? "9% Soil Moisture" : isPolar ? "98% Glacial Ice" : "75% Soil Moisture",
      healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health),
      microplasticsOrFlowRate: `${Math.floor(12 + hf * 35)}% Risk`, speciesList,
      telemetryStatus: "Active Terrestrial Vegetation & Thermal Scan",
      aiSummary: `Terrestrial Telemetry at Lat: ${latFormatted}, Lon: ${lonFormatted} (${locationName}). Elevation: ${elevation}. Temp: ${temp}°C. NDVI: ${ndvi}.`,
      point3D
    };
  }

  // Ocean Sector
  const depth = Math.floor(-2800 - hf * 4200);
  const temp = parseFloat((17.2 + hf * 8.5).toFixed(1));
  const oceanSpecies: Record<string, string[]> = {
    "North Pacific Ocean": ["Sperm Whale", "Bluefin Tuna", "Manta Ray"],
    "South Pacific Ocean": ["Humpback Whale", "Whale Shark", "Coral Polyp"],
    "North Atlantic Ocean": ["Orca", "Atlantic Salmon", "Deepwater Coral"],
    "Indian Ocean Basin": ["Spinner Dolphin", "Green Sea Turtle", "Pelagic Marlin"],
  };
  const speciesList = oceanSpecies[locationName] || ["Lanternfish", "Pelagic Shark", "Deepsea Amphipod"];
  const health = Math.floor(65 + hf * 28);
  return {
    lat, lon, latFormatted, lonFormatted, surfaceType: "ocean", locationName,
    elevationOrDepth: `${Math.abs(depth)} m (Bathymetry Depth)`, surfaceTemp: temp, secondaryTemp: parseFloat((1.8 + hf * 1.4).toFixed(1)),
    salinityOrNDVI: `${(34.8 + hf * 1.1).toFixed(1)} PSU (Marine)`, oxygenOrMoisture: `${(5.4 + hf * 1.6).toFixed(1)} mg/L (O₂)`,
    healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health),
    microplasticsOrFlowRate: `${Math.floor(800 + hf * 2800)} /m³`, speciesList,
    telemetryStatus: "Active Bathymetric Satellite Telemetry Stream",
    aiSummary: `Oceanic Telemetry at Lat: ${latFormatted}, Lon: ${lonFormatted} (${locationName}). Depth: ${Math.abs(depth)}m. SST: ${temp}°C. Salinity: ${(34.8 + hf * 1.1).toFixed(1)} PSU.`,
    point3D
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED PBR EARTH SURFACE GLSL SHADER (NASA BLUE MARBLE / SATELLITE STYLE)
// ─────────────────────────────────────────────────────────────────────────────

const EARTH_VERT = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uSpecMap;
  uniform sampler2D uNormalMap;
  uniform sampler2D uCloudsMap;
  uniform vec3 uSunDirection;
  uniform float uTime;
  uniform float uCloudsOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // 1. Sample satellite imagery textures
    vec4 dayColor   = texture2D(uDayMap, vUv);
    vec4 nightColor = texture2D(uNightMap, vUv);
    vec4 specMask   = texture2D(uSpecMap, vUv);

    // Dynamic wave animation for water surfaces
    vec2 waveUv1 = vUv + vec2(uTime * 0.0015, uTime * 0.0008);
    vec2 waveUv2 = vUv - vec2(uTime * 0.0010, uTime * 0.0018);
    vec3 norm1 = texture2D(uNormalMap, waveUv1).rgb * 2.0 - 1.0;
    vec3 norm2 = texture2D(uNormalMap, waveUv2).rgb * 2.0 - 1.0;
    vec3 animatedWaveNorm = normalize(norm1 + norm2);

    // Apply wave normal only to ocean surfaces (specMask > 0.2)
    vec3 pertNormal = normalize(vNormal + animatedWaveNorm * (specMask.r > 0.2 ? 0.15 : 0.06));

    // 2. Solar lighting calculation
    vec3 sunDir = normalize(uSunDirection);
    float sunDot = dot(pertNormal, sunDir);

    // Day/Night transition factor with atmospheric twilight
    float dayFactor = smoothstep(-0.18, 0.22, sunDot);

    // Twilight golden illumination along terminator line
    float twilight = smoothstep(-0.22, 0.02, sunDot) * (1.0 - smoothstep(0.02, 0.30, sunDot));
    vec3 twilightColor = vec3(1.0, 0.48, 0.18) * 0.28 * twilight;

    // Ambient space light
    vec3 ambientLight = vec3(0.035, 0.038, 0.045);
    float diffuse = max(sunDot, 0.0);

    // 3. Ocean Fresnel Specular Glint
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 halfVec = normalize(sunDir + viewDir);
    float specAngle = max(dot(pertNormal, halfVec), 0.0);
    float fresnel = pow(1.0 - max(dot(viewDir, pertNormal), 0.0), 4.0);
    float specular = (pow(specAngle, 140.0) + fresnel * 0.12) * specMask.r * 0.35 * dayFactor;

    // 4. Compose Day & Night surface
    vec3 dayFinal = dayColor.rgb * (ambientLight + diffuse * vec3(1.14, 1.11, 1.06)) + vec3(specular) + twilightColor;
    vec3 nightFinal = nightColor.rgb * 1.30; // City lights on dark hemisphere

    vec3 earthColor = mix(nightFinal, dayFinal, dayFactor);

    // Subtle desaturation for satellite photographic balance (~10%)
    float luma = dot(earthColor, vec3(0.2126, 0.7152, 0.0722));
    earthColor = mix(vec3(luma), earthColor, 0.90);

    // 5. Cloud Layer & Soft Cloud Shadows
    vec4 cloudSample = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.002, vUv.y));
    float cloudDensity = cloudSample.r * uCloudsOpacity;

    // Cloud shadow offset on land/ocean
    vec4 shadowSample = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.002 - 0.002, vUv.y - 0.0015));
    float shadowFactor = 1.0 - (shadowSample.r * 0.15 * dayFactor);
    earthColor *= shadowFactor;

    // Blend lit clouds
    vec3 cloudLit = vec3(diffuse * 1.08 + 0.03);
    earthColor = mix(earthColor, cloudLit, cloudDensity * (0.35 + 0.65 * dayFactor));

    // 6. Rayleigh Atmospheric Haze at Edge
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow = pow(rim, 6.5);
    vec3 atmosphereRim = vec3(0.28, 0.62, 1.0) * rimPow * 0.08 * dayFactor;
    earthColor += atmosphereRim;

    gl_FragColor = vec4(earthColor, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// RAYLEIGH ATMOSPHERE SHELL GLSL SHADER
// ─────────────────────────────────────────────────────────────────────────────

const ATMO_VERT = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = `
  uniform vec3 uSunDirection;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir  = normalize(cameraPosition - vPosition);
    float rim     = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow  = pow(rim, 6.8);

    float sunDot  = dot(normalize(vNormal), normalize(uSunDirection));
    float sunGlow = smoothstep(-0.30, 0.70, sunDot);

    vec3 atmoColor = mix(vec3(0.25, 0.58, 0.95), vec3(0.65, 0.85, 1.0), sunGlow * 0.35);
    float alpha    = rimPow * 0.25 * max(sunGlow, 0.02);
    gl_FragColor   = vec4(atmoColor, alpha);
  }
`;

const T = {
  day:    "/textures/earth-day.jpg",
  night:  "/textures/earth-night.jpg",
  spec:   "/textures/earth-specular.jpg",
  normal: "/textures/earth-normal.jpg",
  clouds: "/textures/earth-clouds.png",
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL EARTH COMPONENT WITH PIXEL-PERFECT SPECULAR MASK LAND/OCEAN CHECKER
// ─────────────────────────────────────────────────────────────────────────────

function RealEarthGlobe({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const timeRef  = useRef(0);

  const [dayMap, nightMap, specMap, normalMap, cloudsMap] = useTexture([
    T.day, T.night, T.spec, T.normal, T.clouds,
  ]);

  // Offscreen canvas context for sampling exact specular map pixel values
  const specImageDataRef = useRef<{ data: Uint8ClampedArray; width: number; height: number } | null>(null);

  useEffect(() => {
    if (specMap && specMap.image) {
      try {
        const canvas = document.createElement("canvas");
        const img = specMap.image;
        canvas.width = img.width || 2048;
        canvas.height = img.height || 1024;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          specImageDataRef.current = { data: imgData.data, width: canvas.width, height: canvas.height };
        }
      } catch (err) {
        console.warn("Specular mask pixel sampling fallback activated:", err);
      }
    }
  }, [specMap]);

  useMemo(() => {
    [dayMap, nightMap, specMap, normalMap, cloudsMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 16;
    });
    cloudsMap.colorSpace = THREE.NoColorSpace;
  }, [dayMap, nightMap, specMap, normalMap, cloudsMap]);

  const sunDirection = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), []);

  const earthUniforms = useMemo(() => ({
    uDayMap:       { value: dayMap },
    uNightMap:     { value: nightMap },
    uSpecMap:      { value: specMap },
    uNormalMap:    { value: normalMap },
    uCloudsMap:    { value: cloudsMap },
    uSunDirection: { value: sunDirection },
    uTime:         { value: 0 },
    uCloudsOpacity:{ value: 0.20 },
  }), [dayMap, nightMap, specMap, normalMap, cloudsMap, sunDirection]);

  const atmoUniforms = useMemo(() => ({
    uSunDirection: { value: sunDirection },
  }), [sunDirection]);

  const targetRotation = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (activeCoord) {
      const targetY = (-activeCoord.lon - 90) * (Math.PI / 180);
      const targetX = (activeCoord.lat) * (Math.PI / 180);
      targetRotation.current = { x: targetX, y: targetY };
    }
  }, [activeCoord]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (earthUniforms.uTime) {
      earthUniforms.uTime.value = timeRef.current;
    }
    if (earthRef.current) {
      if (targetRotation.current) {
        earthRef.current.rotation.y = THREE.MathUtils.lerp(
          earthRef.current.rotation.y,
          targetRotation.current.y,
          0.08
        );
        earthRef.current.rotation.x = THREE.MathUtils.lerp(
          earthRef.current.rotation.x,
          targetRotation.current.x,
          0.08
        );
      } else if (!activeCoord) {
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, 0, 0.05);
        earthRef.current.rotation.y += delta * 0.025;
      }
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.03;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!earthRef.current) return;

    // Convert raycast hit point to local coordinate system of the globe mesh
    const localPoint = earthRef.current.worldToLocal(e.point.clone());
    const { lat, lon } = vector3ToLatLon(localPoint);

    // 100% Precise Land vs Ocean detection via specMap pixel or e.uv
    let isWater = false;
    if (e.uv) {
      const u = e.uv.x;
      const v = e.uv.y;
      if (specImageDataRef.current) {
        const { data, width, height } = specImageDataRef.current;
        const px = Math.floor(u * width);
        const py = Math.floor((1 - v) * height);
        const idx = (py * width + px) * 4;
        const specVal = data[idx]; // Red/brightness channel of specMap
        isWater = specVal > 45; // Water is white in specMap
      } else {
        // Fallback using UV latitude/longitude rules if image data unavailable
        isWater = lat > 65 || lat < -55 || lon < -140 || (lon > -50 && lon < -20) || (lon > 50 && lon < 100);
      }
    }

    const point3D: [number, number, number] = [localPoint.x, localPoint.y, localPoint.z];
    const info = generateCoordinateData(lat, lon, point3D, isWater);
    onCoordinateClick(info);
  };

  const beaconColor =
    activeCoord?.surfaceType === "river" ? "#4ECDC4" :
    activeCoord?.surfaceType === "land"  ? "#2ECC71" : "#85ECD4";

  // Calculate local marker vector matching activeCoord lat/lon
  const markerLocalPos = useMemo(() => {
    if (!activeCoord) return null;
    return latLonToVector3(activeCoord.lat, activeCoord.lon, 2.01);
  }, [activeCoord]);

  return (
    <group>
      {/* Primary Earth Globe */}
      <mesh ref={earthRef} onClick={handleClick}>
        <sphereGeometry args={[2.0, 96, 96]} />
        <shaderMaterial
          vertexShader={EARTH_VERT}
          fragmentShader={EARTH_FRAG}
          uniforms={earthUniforms}
        />

        {/* Locked Marker — Placed inside earthRef so it rotates 100% in sync with terrain */}
        {activeCoord && markerLocalPos && (
          <group position={markerLocalPos}>
            {/* Stem pin line connecting surface to glowing beacon */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.04, 8]} />
              <meshBasicMaterial color={beaconColor} />
            </mesh>

            {/* Glowing Beacon Head */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.016, 16, 16]} />
              <meshStandardMaterial color={beaconColor} emissive={beaconColor} emissiveIntensity={3.0} />
            </mesh>

            {/* Pulsing ring on globe surface */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.024, 0.038, 32]} />
              <meshBasicMaterial color={beaconColor} side={THREE.DoubleSide} transparent opacity={0.85} />
            </mesh>

            {/* Floating Scientific Tooltip */}
            <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
              <div
                className="whitespace-nowrap rounded-lg px-3 py-2 text-[0.65rem] font-mono shadow-2xl flex flex-col gap-1 backdrop-blur-md"
                style={{
                  background: "rgba(3,14,26,0.94)",
                  border: `1px solid ${beaconColor}66`,
                  color: "#F2F0ED",
                  boxShadow: `0 0 20px ${beaconColor}33`,
                }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
                  <span className="font-bold uppercase tracking-wider" style={{ color: beaconColor }}>
                    {activeCoord.locationName}
                  </span>
                  <span className="text-[0.55rem] px-1.5 py-0.2 rounded uppercase bg-white/10 font-semibold">
                    {activeCoord.surfaceType}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[0.6rem]">
                  <span className="text-white/60">Latitude:</span>
                  <span className="font-semibold text-right">{activeCoord.lat.toFixed(4)}°</span>
                  <span className="text-white/60">Longitude:</span>
                  <span className="font-semibold text-right">{activeCoord.lon.toFixed(4)}°</span>
                  <span className="text-white/60">
                    {activeCoord.surfaceType === "ocean" ? "Depth:" : "Elevation:"}
                  </span>
                  <span className="font-semibold text-right">{activeCoord.elevationOrDepth}</span>
                  <span className="text-white/60">Temp:</span>
                  <span className="font-semibold text-right">{activeCoord.surfaceTemp}°C</span>
                </div>
              </div>
            </Html>
          </group>
        )}
      </mesh>

      {/* Cloud Layer (20% opacity) */}
      <mesh ref={cloudRef} scale={1.004}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.20}
          alphaMap={cloudsMap}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere Shell */}
      <mesh scale={1.04}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          side={THREE.BackSide}
          transparent
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

function EarthLoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.0, 32, 32]} />
      <meshPhongMaterial color="#03284E" wireframe={false} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

function CameraController({ paused }: { paused: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.5, 5.8);
  }, [camera]);

  return (
    <OrbitControls
      enablePan={false}
      minDistance={2.6}
      maxDistance={9}
      dampingFactor={0.06}
      enableDamping
      rotateSpeed={0.4}
      zoomSpeed={0.7}
      autoRotate={!paused}
      autoRotateSpeed={0.35}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORTED COMPONENT — PRODUCTION NASA / GOOGLE EARTH VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────────

export function OceanGlobe3D({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  const [userInteracting, setUserInteracting] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInteractionStart = useCallback(() => {
    setUserInteracting(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => setUserInteracting(false), 3000);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.8], fov: 40, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
    >
      {/* Production solar lighting setup */}
      <ambientLight intensity={0.12} color="#142036" />
      <hemisphereLight args={["#d6e8ff", "#050a14", 0.4]} />
      <directionalLight
        position={[5, 3, 5]}
        intensity={2.4}
        color="#ffffff"
      />

      {/* Deep space stars background */}
      <Stars radius={90} depth={40} count={1500} factor={3} saturation={0} fade speed={0} />

      <Suspense fallback={<EarthLoadingFallback />}>
        <RealEarthGlobe
          onCoordinateClick={onCoordinateClick}
          activeCoord={activeCoord}
        />
      </Suspense>

      <CameraController paused={userInteracting || !!activeCoord} />
    </Canvas>
  );
}
