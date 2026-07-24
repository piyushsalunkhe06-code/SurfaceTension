"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// True Geographic Polygon Data for Photorealistic Earth Render
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

    mapCtx.fillStyle = cont.color;
    mapCtx.beginPath();
    cont.points.forEach(([lon, lat], i) => {
      if (i === 0) mapCtx.moveTo(gx(lon), gy(lat));
      else mapCtx.lineTo(gx(lon), gy(lat));
    });
    mapCtx.closePath();
    mapCtx.fill();

    specCtx.fillStyle = "#000000";
    specCtx.beginPath();
    cont.points.forEach(([lon, lat], i) => {
      if (i === 0) specCtx.moveTo(gx(lon), gy(lat));
      else specCtx.lineTo(gx(lon), gy(lat));
    });
    specCtx.closePath();
    specCtx.fill();
  });

  // 3. Arid Desert Zones
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
  drawDesert([[-15, 30], [35, 30], [55, 25], [50, 15], [35, 12], [10, 15], [-15, 30]]);
  drawDesert([[80, 45], [110, 48], [115, 40], [85, 38], [80, 45]]);
  drawDesert([[118, -20], [140, -22], [138, -32], [118, -30], [118, -20]]);

  // 4. Major Fluvial Rivers
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
  drawRiver([[-75, -3], [-65, -3], [-54, -1]]);
  drawRiver([[31, 3], [31, 15], [31, 31]]);
  drawRiver([[-94, 46], [-90, 38], [-89, 29]]);
  drawRiver([[100, 33], [112, 31], [121, 31]]);
  drawRiver([[8, 48], [12, 50], [18, 48], [28, 45]]);
  drawRiver([[15, -4], [22, -1], [25, 4]]);
  drawRiver([[78, 30], [85, 26], [90, 23]]);

  // 5. Polar Ice Sheets
  mapCtx.fillStyle = "#F0F7F9";
  mapCtx.fillRect(0, 0, W, gy(72));
  mapCtx.fillRect(0, gy(-65), W, H - gy(-65));
  specCtx.fillStyle = "#222222";
  specCtx.fillRect(0, 0, W, gy(72));
  specCtx.fillRect(0, gy(-65), W, H - gy(-65));

  const mapTex = new THREE.CanvasTexture(mapCanvas);
  const specTex = new THREE.CanvasTexture(specCanvas);

  return { map: mapTex, specular: specTex };
}

function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const { map, specular } = useMemo(() => buildPhotorealisticEarthTex(), []);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.06;
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
      float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
      gl_FragColor = vec4(0.12, 0.68, 0.88, 1.0) * intensity;
    }
  `;

  return (
    <group>
      {/* Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshPhongMaterial
          map={map}
          specularMap={specular}
          specular={new THREE.Color("#2EC4E0")}
          shininess={30}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudRef} scale={1.018}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere Glow */}
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
    </group>
  );
}

export default function EarthV2() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={2.2} color="#F0F8FF" />
        <pointLight position={[-4, -2, -2]} intensity={0.5} color="#0096B7" />
        <EarthMesh />
      </Canvas>
    </div>
  );
}
