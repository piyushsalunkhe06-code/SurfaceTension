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
// COORDINATE MATH
// ─────────────────────────────────────────────────────────────────────────────

export function latLonToVector3(lat: number, lon: number, radius = 2.02): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function vector3ToLatLon(point: THREE.Vector3): { lat: number; lon: number } {
  const n = point.clone().normalize();
  const lat = Math.asin(THREE.MathUtils.clamp(n.y, -1, 1)) * (180 / Math.PI);
  let lon = Math.atan2(n.z, -n.x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  return { lat, lon };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function classifyCoordinate(lat: number, lon: number): { surfaceType: SurfaceType; name: string } {
  if (lat >= -12 && lat <= 4 && lon >= -75 && lon <= -48) return { surfaceType: "river", name: "Amazon River & Basin System" };
  if (lat >= 4 && lat <= 32 && lon >= 28 && lon <= 35) return { surfaceType: "river", name: "Nile River Fluvial Corridor" };
  if (lat >= 28 && lat <= 48 && lon >= -110 && lon <= -88) return { surfaceType: "river", name: "Mississippi-Missouri River Watershed" };
  if (lat >= 24 && lat <= 35 && lon >= 100 && lon <= 123) return { surfaceType: "river", name: "Yangtze (Chang Jiang) River Waterway" };
  if (lat >= 44 && lat <= 52 && lon >= 6 && lon <= 30) return { surfaceType: "river", name: "Danube & Rhine European River Network" };
  if (lat >= -10 && lat <= 6 && lon >= 12 && lon <= 30) return { surfaceType: "river", name: "Congo Equatorial River System" };
  if (lat >= 20 && lat <= 28 && lon >= 75 && lon <= 92) return { surfaceType: "river", name: "Ganges-Brahmaputra River Delta" };
  if (lat >= 23 && lat <= 36 && lon >= 67 && lon <= 76) return { surfaceType: "river", name: "Indus River Fluvial Basin" };
  if (lat >= 10 && lat <= 30 && lon >= 98 && lon <= 108) return { surfaceType: "river", name: "Mekong River System" };
  if (lat >= 45 && lat <= 60 && lon >= 38 && lon <= 55) return { surfaceType: "river", name: "Volga River Basin" };

  if (lat < -60) return { surfaceType: "land", name: "Antarctic Ice Plateau" };
  if (lat > 60 && lon > -70 && lon < -10) return { surfaceType: "land", name: "Greenland Glacier Sheet" };
  if (lat > 12 && lat < 75 && lon > -170 && lon < -50) {
    if (lat > 35) return { surfaceType: "land", name: "North American Great Plains / Boreal" };
    return { surfaceType: "land", name: "Sierra Madre & Central Plateau" };
  }
  if (lat > -56 && lat < 12 && lon > -82 && lon < -34) {
    if (lat < -30) return { surfaceType: "land", name: "Patagonian Steppe & Andes" };
    return { surfaceType: "land", name: "Amazonian Continental Canopy" };
  }
  if (lat > -35 && lat < 38 && lon > -18 && lon < 52) {
    if (lat > 15) return { surfaceType: "land", name: "Sahara Desert Arid Plateau" };
    return { surfaceType: "land", name: "Sub-Saharan Savannah & Highlands" };
  }
  if (lat > 5 && lat < 75 && lon > -10 && lon < 180) {
    if (lat > 25 && lat < 38 && lon > 70 && lon < 100) return { surfaceType: "land", name: "Himalayan High Alpine Range" };
    if (lat > 15 && lat < 35 && lon > 35 && lon < 65) return { surfaceType: "land", name: "Arabian Peninsula Desert" };
    if (lat > 50) return { surfaceType: "land", name: "Siberian Taiga Boreal Zone" };
    return { surfaceType: "land", name: "Eurasian Steppe & Temperate Zone" };
  }
  if (lat > -45 && lat < -10 && lon > 110 && lon < 155) {
    if (lon < 135) return { surfaceType: "land", name: "Australian Outback Arid Shield" };
    return { surfaceType: "land", name: "Great Dividing Range" };
  }

  if (lat > 65) return { surfaceType: "ocean", name: "Arctic Ocean Basin" };
  if (lat < -55) return { surfaceType: "ocean", name: "Southern Antarctic Ocean Current" };
  if (lon > 135 && lon < 155 && lat > 10 && lat < 25) return { surfaceType: "ocean", name: "Mariana Hadal Trench Sector" };
  if (lon > -180 && lon < -100) return { surfaceType: "ocean", name: "Pacific Ocean Gyre" };
  if (lon > -80 && lon < -10) return { surfaceType: "ocean", name: "North Atlantic Ridge Sector" };
  if (lon > 40 && lon < 110) return { surfaceType: "ocean", name: "Indian Ocean Basin" };
  if (lon > -10 && lon < 40 && lat > 30 && lat < 46) return { surfaceType: "ocean", name: "Mediterranean Sea Deep Basin" };
  return { surfaceType: "ocean", name: "Global Oceanic Trench & Abyssal Plain" };
}

export function generateCoordinateData(lat: number, lon: number, point3D: [number, number, number]): ClickedCoordinateInfo {
  const latFormatted = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonFormatted = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
  const { surfaceType, name: locationName } = classifyCoordinate(lat, lon);
  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const hf = hash - Math.floor(hash);

  if (surfaceType === "river") {
    const flowRates: Record<string, string> = {
      "Amazon River & Basin System": "209,000 m³/s", "Nile River Fluvial Corridor": "2,830 m³/s",
      "Mississippi-Missouri River Watershed": "16,700 m³/s", "Yangtze (Chang Jiang) River Waterway": "30,100 m³/s",
      "Congo Equatorial River System": "41,000 m³/s", "Ganges-Brahmaputra River Delta": "38,000 m³/s",
    };
    const flowRate = flowRates[locationName] || `${Math.floor(4000 + hf * 12000)} m³/s`;
    const temp = parseFloat((22.4 + hf * 6.5).toFixed(1));
    const speciesMap: Record<string, string[]> = {
      "Amazon River & Basin System": ["Amazon River Dolphin (Boto)", "Arapaima (Pirarucu)", "Giant River Otter", "Electric Eel"],
      "Nile River Fluvial Corridor": ["Nile Crocodile", "Nile Perch", "African Softshell Turtle"],
      "Yangtze (Chang Jiang) River Waterway": ["Chinese Sturgeon", "Finless Porpoise", "Giant Salamander"],
      "Congo Equatorial River System": ["Goliath Tigerfish", "Congo Bichir", "African Manatee"],
      "Ganges-Brahmaputra River Delta": ["Ganges River Dolphin", "Gharial Crocodile", "Hilsa Shad"],
    };
    const speciesList = speciesMap[locationName] || ["Freshwater Otter", "Yellow Catfish", "Riparian Heron"];
    const health = Math.floor(55 + hf * 30);
    return { lat, lon, latFormatted, lonFormatted, surfaceType: "river", locationName,
      elevationOrDepth: `+${Math.floor(45 + hf * 350)} m`, surfaceTemp: temp,
      salinityOrNDVI: "< 0.2 PSU (Freshwater)", oxygenOrMoisture: `${(7.4 + hf * 1.5).toFixed(1)} mg/L (O₂)`,
      healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health + hf * 12),
      microplasticsOrFlowRate: flowRate, speciesList, telemetryStatus: "Active Fluvial Hydro-Stream",
      aiSummary: `Fluvial Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Discharge ${flowRate}. Temp ${temp}°C, freshwater salinity <0.2 PSU. Species: ${speciesList.slice(0, 2).join(" & ")}.`, point3D };
  }

  if (surfaceType === "land") {
    const isArid = locationName.includes("Desert") || locationName.includes("Outback") || locationName.includes("Arabian");
    const isAlpine = locationName.includes("Alpine") || locationName.includes("Himalayan") || locationName.includes("Patagonian");
    const isPolar = locationName.includes("Antarctic") || locationName.includes("Greenland") || locationName.includes("Siberian");
    let temp = isArid ? parseFloat((36.5 + hf * 8).toFixed(1)) : isAlpine ? parseFloat((2.5 - hf * 12).toFixed(1)) : isPolar ? parseFloat((-18.5 - hf * 15).toFixed(1)) : 26.8;
    const elevation = isAlpine ? `+${Math.floor(2800 + hf * 3500)} m` : isPolar ? `+${Math.floor(1200 + hf * 1800)} m` : `+${Math.floor(150 + hf * 600)} m`;
    const ndvi = isArid ? "0.08 (Arid Sand / Rock)" : isAlpine ? "0.22 (Alpine Scrub)" : isPolar ? "0.01 (Ice Cap)" : "0.74 (Lush Canopy)";
    const landSpecies: Record<string, string[]> = {
      "Amazonian Continental Canopy": ["Jaguar", "Harpy Eagle", "Howler Monkey"],
      "Sahara Desert Arid Plateau": ["Fennec Fox", "Addax Antelope", "Horned Viper"],
      "Himalayan High Alpine Range": ["Snow Leopard", "Himalayan Monal", "Red Panda"],
    };
    const speciesList = landSpecies[locationName] || ["Gray Wolf", "Peregrine Falcon", "Red Deer"];
    const health = Math.floor(60 + hf * 32);
    return { lat, lon, latFormatted, lonFormatted, surfaceType: "land", locationName, elevationOrDepth: elevation,
      surfaceTemp: temp, salinityOrNDVI: ndvi, oxygenOrMoisture: isArid ? "9% Soil Moisture" : isPolar ? "98% Glacial Ice" : "78% Soil Moisture",
      healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health + hf * 10),
      microplasticsOrFlowRate: `${Math.floor(15 + hf * 40)}% Habitat Risk`, speciesList,
      telemetryStatus: "Active Satellite Vegetation & Thermal Scan",
      aiSummary: `Terrestrial Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Elevation ${elevation}, temp ${temp}°C, NDVI ${ndvi}. Habitat risk ${Math.floor(100 - health)}/100.`, point3D };
  }

  const depth = Math.floor(-3200 - hf * 3500);
  const temp = parseFloat((18.5 + hf * 7.2).toFixed(1));
  const oceanSpecies: Record<string, string[]> = {
    "Mariana Hadal Trench Sector": ["Mariana Snailfish", "Giant Amphipod", "Xenophyophore"],
    "Pacific Ocean Gyre": ["Sperm Whale", "Pacific Bluefin Tuna", "Manta Ray"],
    "Southern Antarctic Ocean Current": ["Blue Whale", "Antarctic Krill", "Colossal Squid"],
  };
  const speciesList = oceanSpecies[locationName] || ["Lanternfish", "Pelagic Shark", "Sea Turtle"];
  const health = Math.floor(62 + hf * 30);
  return { lat, lon, latFormatted, lonFormatted, surfaceType: "ocean", locationName,
    elevationOrDepth: `${Math.abs(depth)} m (Depth)`, surfaceTemp: temp, secondaryTemp: parseFloat((1.8 + hf * 1.4).toFixed(1)),
    salinityOrNDVI: `${(34.8 + hf * 1.1).toFixed(1)} PSU (Marine)`, oxygenOrMoisture: `${(5.4 + hf * 1.6).toFixed(1)} mg/L (O₂)`,
    healthOrRiskScore: health, pollutionOrDeforestation: Math.floor(100 - health),
    microplasticsOrFlowRate: `${Math.floor(900 + hf * 3200)} /m³`, speciesList,
    telemetryStatus: "Active Bathymetric Radar & AUG Sentinel Stream",
    aiSummary: `Oceanic Telemetry at ${latFormatted}, ${lonFormatted} (${locationName}): Depth ${Math.abs(depth)}m, SST ${temp}°C, salinity ${(34.8 + hf * 1.1).toFixed(1)} PSU. Species: ${speciesList.slice(0, 2).join(" & ")}.`, point3D };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHADERS
// ─────────────────────────────────────────────────────────────────────────────

// Day/Night blend shader — renders realistic lit day side with night city lights on the dark side
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
    // Sample textures
    vec4 dayColor   = texture2D(uDayMap, vUv);
    vec4 nightColor = texture2D(uNightMap, vUv);
    vec4 specMask   = texture2D(uSpecMap, vUv);
    vec4 cloudColor = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.01, vUv.y));

    // Normal mapping approximation from normal map
    vec3 normalMap  = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
    vec3 pertNormal = normalize(vNormal + normalMap * 0.3);

    // Sun angle
    float sunDot = dot(pertNormal, normalize(uSunDirection));

    // Smoothly blend day and night
    float dayFactor   = smoothstep(-0.15, 0.25, sunDot);
    float nightFactor = 1.0 - dayFactor;

    // Ambient light from deep space (subtle)
    vec3 ambientLight = vec3(0.015, 0.02, 0.035);

    // Diffuse lighting
    float diffuse = max(sunDot, 0.0);

    // Specular reflection on ocean only
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 halfVec = normalize(normalize(uSunDirection) + viewDir);
    float specular = pow(max(dot(pertNormal, halfVec), 0.0), 64.0) * specMask.r * 0.8;

    // Compose day side
    vec3 dayFinal  = dayColor.rgb * (ambientLight + diffuse * vec3(1.0, 0.98, 0.95)) + vec3(specular);

    // Night side — city lights glow
    vec3 nightFinal = nightColor.rgb * 1.6;

    // Blend
    vec3 earthColor = mix(nightFinal, dayFinal, dayFactor);

    // Cloud overlay
    float cloudAlpha = cloudColor.r * uCloudsOpacity * (0.7 + 0.3 * dayFactor);
    vec3 cloudLit    = vec3(1.0) * max(sunDot, 0.05) + ambientLight;
    earthColor       = mix(earthColor, cloudLit, cloudAlpha);

    // Atmospheric color tint at rim (Rayleigh scattering)
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow = pow(rim, 2.8);
    vec3 rimColor = vec3(0.2, 0.55, 1.0) * rimPow * 0.4 * dayFactor;
    earthColor += rimColor;

    gl_FragColor = vec4(earthColor, 1.0);
  }
`;

// Physically-based Rayleigh atmosphere
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
    float rimPow  = pow(rim, 3.5);

    // Sun-side atmosphere is brighter / whiter
    float sunDot  = dot(normalize(vNormal), normalize(uSunDirection));
    float sunGlow = smoothstep(-0.4, 0.8, sunDot);

    // Rayleigh scattering color: blue with a hint of white near sun
    vec3 dayAtmo    = mix(vec3(0.25, 0.58, 1.0), vec3(0.8, 0.9, 1.0), sunGlow * 0.4);
    vec3 shadowAtmo = vec3(0.05, 0.12, 0.30);
    vec3 atmoColor  = mix(shadowAtmo, dayAtmo, sunGlow);

    float alpha = rimPow * 0.7;
    gl_FragColor = vec4(atmoColor, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEXTURE URLS — Using public NASA / USGS / Natural Earth imagery mirrors
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  day:    "/textures/earth-day.jpg",
  night:  "/textures/earth-night.jpg",
  spec:   "/textures/earth-specular.jpg",
  normal: "/textures/earth-normal.jpg",
  clouds: "/textures/earth-clouds.png",
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL EARTH COMPONENT — Full PBR with custom shader
// ─────────────────────────────────────────────────────────────────────────────

function RealEarthGlobe({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  const earthRef  = useRef<THREE.Mesh>(null);
  const cloudRef  = useRef<THREE.Mesh>(null);
  const atmoRef   = useRef<THREE.Mesh>(null);
  const timeRef   = useRef(0);

  // Load all textures — drei's useTexture handles caching
  const [dayMap, nightMap, specMap, normalMap, cloudsMap] = useTexture([
    T.day, T.night, T.spec, T.normal, T.clouds,
  ]);

  // Proper texture settings
  useMemo(() => {
    [dayMap, nightMap, specMap, normalMap, cloudsMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 16;
    });
    cloudsMap.colorSpace = THREE.NoColorSpace;
  }, [dayMap, nightMap, specMap, normalMap, cloudsMap]);

  const sunDirection = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), []);

  // Build shader uniforms
  const earthUniforms = useMemo(() => ({
    uDayMap:       { value: dayMap },
    uNightMap:     { value: nightMap },
    uSpecMap:      { value: specMap },
    uNormalMap:    { value: normalMap },
    uCloudsMap:    { value: cloudsMap },
    uSunDirection: { value: sunDirection },
    uTime:         { value: 0 },
    uCloudsOpacity:{ value: 0.6 },
  }), [dayMap, nightMap, specMap, normalMap, cloudsMap, sunDirection]);

  const atmoUniforms = useMemo(() => ({
    uSunDirection: { value: sunDirection },
  }), [sunDirection]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (earthUniforms.uTime) {
      earthUniforms.uTime.value = timeRef.current * 0.5;
    }
    // Earth slow self-rotation when not focused
    if (earthRef.current && !activeCoord) {
      earthRef.current.rotation.y += delta * 0.03;
    }
    // Cloud layer rotates slightly faster (independent)
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.045;
    }
  });

  const beaconColor =
    activeCoord?.surfaceType === "river" ? "#4ECDC4" :
    activeCoord?.surfaceType === "land"  ? "#2ECC71" : "#85ECD4";

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const localPoint = e.object.worldToLocal(e.point.clone());
    const { lat, lon } = vector3ToLatLon(localPoint);
    const info = generateCoordinateData(lat, lon, [e.point.x, e.point.y, e.point.z]);
    onCoordinateClick(info);
  };

  return (
    <group>
      {/* ── Primary Earth — Custom PBR Shader ── */}
      <mesh ref={earthRef} onClick={handleClick} receiveShadow castShadow>
        <sphereGeometry args={[2.0, 96, 96]} />
        <shaderMaterial
          vertexShader={EARTH_VERT}
          fragmentShader={EARTH_FRAG}
          uniforms={earthUniforms}
        />
      </mesh>

      {/* ── Transparent Cloud Layer ── */}
      <mesh ref={cloudRef} scale={1.006}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.55}
          alphaMap={cloudsMap}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Physically-Based Rayleigh Atmosphere ── */}
      <mesh ref={atmoRef} scale={1.1}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Inner Atmosphere Glow (sun-facing) ── */}
      <mesh scale={1.025}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          side={THREE.FrontSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Active Coordinate Beacon ── */}
      {activeCoord && (
        <group position={latLonToVector3(activeCoord.lat, activeCoord.lon, 2.05)}>
          <mesh>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={beaconColor} emissive={beaconColor} emissiveIntensity={3} />
          </mesh>
          {/* Pulsing ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.035, 0.05, 32]} />
            <meshBasicMaterial color={beaconColor} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <Html center distanceFactor={6}>
            <div
              className="pointer-events-none whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.65rem] font-mono font-bold flex items-center gap-2"
              style={{
                background: "rgba(3,12,22,0.95)",
                border: `1px solid ${beaconColor}`,
                color: beaconColor,
                boxShadow: `0 0 16px ${beaconColor}44`,
              }}
            >
              <span className="uppercase">{activeCoord.surfaceType} · {activeCoord.latFormatted}, {activeCoord.lonFormatted}</span>
            </div>
          </Html>
        </group>
      )}
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
// CAMERA CONTROLLER — Smooth damping, auto-rotate on idle
// ─────────────────────────────────────────────────────────────────────────────

function CameraController({ paused }: { paused: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.5, 5.8);
  }, [camera]);

  return (
    <OrbitControls
      enablePan={false}
      minDistance={2.8}
      maxDistance={10}
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
// MAIN EXPORTED COMPONENT
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
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
      shadows
    >
      {/* Lighting — realistic solar illumination */}
      <ambientLight intensity={0.06} color="#1a2a4a" />
      <directionalLight
        position={[5, 3, 5]}
        intensity={3.5}
        color="#FFF5E0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Fill from deep space — subtle bluish */}
      <pointLight position={[-8, -4, -6]} intensity={0.15} color="#203060" />

      {/* Deep space starfield */}
      <Stars radius={80} depth={50} count={6000} factor={4} saturation={0} fade speed={0.4} />

      {/* Main Earth — with Suspense for texture loading */}
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
