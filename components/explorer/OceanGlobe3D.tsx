"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

export interface ClickedCoordinateInfo {
  lat: number;
  lon: number;
  latFormatted: string;
  lonFormatted: string;
  regionName: string;
  depthMeters: number;
  surfaceTemp: number;
  deepTemp: number;
  salinity: number;
  oxygen: number;
  healthScore: number;
  pollutionIndex: number;
  microplastics: number;
  acousticNoise: number;
  speciesList: string[];
  telemetryStatus: string;
  aiSummary: string;
  point3D: [number, number, number];
}

// Convert Lat/Lon to 3D Cartesian coordinates on sphere radius R
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

// Generate rich dynamic data for any clicked lat/lon coordinate on Earth
export function generateCoordinateData(lat: number, lon: number, point3D: [number, number, number]): ClickedCoordinateInfo {
  const latFormatted = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonFormatted = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;

  // Determine ocean basin or region from lat/lon
  let regionName = "Open Abyssal Plain";
  let baseDepth = -3800;
  let surfaceTemp = 18.5;
  let speciesList = ["Phytoplankton", "Lanternfish", "Pelagic Manta"];

  if (lat > 65) {
    regionName = "Arctic Ocean Basin";
    baseDepth = -2500;
    surfaceTemp = -1.2;
    speciesList = ["Bowhead Whale", "Arctic Cod", "Beluga Whale", "Ice Algae"];
  } else if (lat < -55) {
    regionName = "Southern Antarctic Current";
    baseDepth = -4100;
    surfaceTemp = 1.4;
    speciesList = ["Antarctic Krill", "Emperor Penguin", "Blue Whale", "Colossal Squid"];
  } else if (lon > 135 && lon < 155 && lat > 10 && lat < 25) {
    regionName = "Mariana Hadal Trench Sector";
    baseDepth = -10920;
    surfaceTemp = 28.2;
    speciesList = ["Xenophyophore", "Mariana Snailfish", "Giant Amphipod"];
  } else if (lon > -180 && lon < -100 && lat > -20 && lat < 30) {
    regionName = "Central Pacific Ocean Gyre";
    baseDepth = -4500;
    surfaceTemp = 24.8;
    speciesList = ["Sperm Whale", "Skipjack Tuna", "Pacific Flying Fish"];
  } else if (lon > -80 && lon < -10 && lat > 0 && lat < 50) {
    regionName = "North Atlantic Ridge Sector";
    baseDepth = -3400;
    surfaceTemp = 17.6;
    speciesList = ["North Atlantic Right Whale", "Deep Hydrothermal Vents", "Deepwater Coral"];
  } else if (lon > 40 && lon < 110 && lat > -30 && lat < 25) {
    regionName = "Equatorial Indian Ocean";
    baseDepth = -3890;
    surfaceTemp = 27.4;
    speciesList = ["Hawksbill Turtle", "Whale Shark", "Branching Acropora"];
  } else if (lon > -10 && lon < 40 && lat > 30 && lat < 46) {
    regionName = "Mediterranean Sea Deep Basin";
    baseDepth = -1500;
    surfaceTemp = 22.1;
    speciesList = ["Monk Seal", "Fin Whale", "Posidonia Seagrass"];
  } else if (lon > 100 && lon < 130 && lat > 0 && lat < 25) {
    regionName = "South China Sea Coral Slope";
    baseDepth = -1200;
    surfaceTemp = 28.9;
    speciesList = ["Green Sea Turtle", "Giant Clam", "Crown-of-Thorns Starfish"];
  }

  // Calculate synthetic variations based on exact lat/lon noise
  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const hashFrac = hash - Math.floor(hash);

  const depthMeters = baseDepth + Math.floor((hashFrac - 0.5) * 600);
  const healthScore = Math.max(25, Math.min(95, Math.floor(65 + (hashFrac - 0.5) * 40)));
  const pollutionIndex = Math.floor(100 - healthScore + hashFrac * 15);
  const microplastics = Math.floor(800 + hashFrac * 3500);
  const acousticNoise = Math.floor(45 + hashFrac * 40);

  const deepTemp = 2.0 + hashFrac * 1.5;
  const salinity = parseFloat((34.5 + hashFrac * 1.2).toFixed(2));
  const oxygen = parseFloat((5.2 + hashFrac * 1.8).toFixed(2));

  const aiSummary = `Telemetric scan at ${latFormatted}, ${lonFormatted} (${regionName}): Bathymetry calculated at ${Math.abs(depthMeters)}m. Ocean health index registered at ${healthScore}/100. Thermal surface gradient sits at ${surfaceTemp.toFixed(1)}°C with microplastic concentration estimated at ${microplastics} particles/m³. Primary bio-acoustic signatures match ${speciesList[0]} and localized planktonic activity.`;

  return {
    lat,
    lon,
    latFormatted,
    lonFormatted,
    regionName,
    depthMeters,
    surfaceTemp: parseFloat(surfaceTemp.toFixed(1)),
    deepTemp: parseFloat(deepTemp.toFixed(1)),
    salinity,
    oxygen,
    healthScore,
    pollutionIndex,
    microplastics,
    acousticNoise,
    speciesList,
    telemetryStatus: "Active Satellite Radar & AUG Sensor Stream",
    aiSummary,
    point3D,
  };
}

// Photorealistic Earth procedural texture generator
function buildPhotorealisticEarthTex(): { map: THREE.CanvasTexture; specular: THREE.CanvasTexture } {
  const W = 2048;
  const H = 1024;

  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = W; mapCanvas.height = H;
  const mapCtx = mapCanvas.getContext("2d")!;

  const specCanvas = document.createElement("canvas");
  specCanvas.width = W; specCanvas.height = H;
  const specCtx = specCanvas.getContext("2d")!;

  // 1. Ocean base depth gradient
  const oceanGrad = mapCtx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0.0, "#010C1A"); // Deep Arctic Dark
  oceanGrad.addColorStop(0.2, "#021A38"); // North Ocean
  oceanGrad.addColorStop(0.5, "#03284E"); // Equatorial Navy
  oceanGrad.addColorStop(0.8, "#021633"); // Southern Deep
  oceanGrad.addColorStop(1.0, "#010816"); // Antarctic Dark
  mapCtx.fillStyle = oceanGrad;
  mapCtx.fillRect(0, 0, W, H);

  // Specular map: oceans are highly shiny (white), land is matte (black)
  specCtx.fillStyle = "#FFFFFF";
  specCtx.fillRect(0, 0, W, H);

  const gx = (lon: number) => ((lon + 180) / 360) * W;
  const gy = (lat: number) => ((90 - lat) / 180) * H;

  // Helper for drawing land biomes
  const drawLand = (pathFn: (ctx: CanvasRenderingContext2D) => void, landColor: string, shelfColor = "#0D5C75") => {
    // Continental shallow shelf glow
    mapCtx.fillStyle = shelfColor;
    mapCtx.filter = "blur(12px)";
    pathFn(mapCtx);
    mapCtx.fill();
    mapCtx.filter = "none";

    // Main landmass
    mapCtx.fillStyle = landColor;
    pathFn(mapCtx);
    mapCtx.fill();

    // Land specularity is black (matte)
    specCtx.fillStyle = "#000000";
    pathFn(specCtx);
    specCtx.fill();
  };

  // North & South Americas
  drawLand((ctx) => {
    ctx.beginPath();
    ctx.ellipse(gx(-100), gy(45), 240, 140, -0.2, 0, Math.PI * 2); // N. America
    ctx.ellipse(gx(-60), gy(-15), 140, 220, 0.3, 0, Math.PI * 2);  // S. America
  }, "#25482D", "#126B80");

  // Eurasia & Africa
  drawLand((ctx) => {
    ctx.beginPath();
    ctx.ellipse(gx(25), gy(8), 180, 210, 0.1, 0, Math.PI * 2);   // Africa
    ctx.ellipse(gx(85), gy(50), 380, 160, -0.1, 0, Math.PI * 2);  // Eurasia
    ctx.ellipse(gx(135), gy(-25), 160, 120, 0, 0, Math.PI * 2);  // Australia
    ctx.ellipse(gx(140), gy(35), 70, 90, 0.4, 0, Math.PI * 2);   // Japan/East Asia
  }, "#2E4E34", "#157A91");

  // Deserts overlay (Sahara, Gobi, Australian Outback)
  mapCtx.fillStyle = "#A68652";
  mapCtx.beginPath();
  mapCtx.ellipse(gx(20), gy(20), 120, 60, 0, 0, Math.PI * 2); // Sahara
  mapCtx.ellipse(gx(90), gy(40), 100, 45, 0, 0, Math.PI * 2); // Gobi
  mapCtx.ellipse(gx(135), gy(-25), 90, 50, 0, 0, Math.PI * 2); // Australia Desert
  mapCtx.fill();

  // Ice Caps (Polar North & South)
  const drawIce = (yStart: number, height: number) => {
    mapCtx.fillStyle = "#E8F4F8";
    mapCtx.fillRect(0, yStart, W, height);
    specCtx.fillStyle = "#333333";
    specCtx.fillRect(0, yStart, W, height);
  };
  drawIce(0, gy(72));
  drawIce(gy(-68), H - gy(-68));

  const mapTex = new THREE.CanvasTexture(mapCanvas);
  const specTex = new THREE.CanvasTexture(specCanvas);

  return { map: mapTex, specular: specTex };
}

function PhotorealisticEarth({
  onCoordinateClick,
  activeCoord,
}: {
  onCoordinateClick: (info: ClickedCoordinateInfo) => void;
  activeCoord: ClickedCoordinateInfo | null;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);

  const { map, specular } = useMemo(() => buildPhotorealisticEarthTex(), []);

  // Rotate cloud layer gently
  useFrame((_, delta) => {
    if (cloudMeshRef.current) {
      cloudMeshRef.current.rotation.y += delta * 0.02;
    }
    if (earthGroupRef.current && !activeCoord) {
      earthGroupRef.current.rotation.y += delta * 0.03;
    }
  });

  // Atmosphere shader
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

  // Handle direct 3D raycast click anywhere on the Earth globe surface
  const handleSphereClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!e.point) return;

    // Convert local sphere point to Lat / Lon
    const localPoint = e.object.worldToLocal(e.point.clone());
    const { lat, lon } = vector3ToLatLon(localPoint, 2.0);
    const coordInfo = generateCoordinateData(lat, lon, [e.point.x, e.point.y, e.point.z]);
    onCoordinateClick(coordInfo);
  };

  return (
    <group ref={earthGroupRef}>
      {/* Primary Photorealistic Earth Mesh */}
      <mesh onClick={handleSphereClick}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshPhongMaterial
          map={map}
          specularMap={specular}
          specular={new THREE.Color("#2EC4E0")}
          shininess={25}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudMeshRef} scale={1.015}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Atmosphere Atmosphere Glow */}
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
          {/* Glowing Beacon Core */}
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color="#85ECD4"
              emissive="#85ECD4"
              emissiveIntensity={2.5}
            />
          </mesh>

          {/* Beacon Pulse Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.08, 32]} />
            <meshBasicMaterial color="#85ECD4" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>

          {/* HTML Coordinate Label Overlay */}
          <Html center distanceFactor={5.0}>
            <div
              className="pointer-events-none whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.68rem] font-mono font-bold flex items-center gap-2 shadow-2xl"
              style={{
                background: "rgba(3,14,26,0.95)",
                border: "1px solid rgba(133,236,212,0.6)",
                color: "#85ECD4",
                boxShadow: "0 0 20px rgba(133,236,212,0.4)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-foam animate-ping" />
              <span>{activeCoord.latFormatted}, {activeCoord.lonFormatted}</span>
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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
