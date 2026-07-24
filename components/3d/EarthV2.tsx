"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Deterministic Earth Texture (equirectangular projection) ──────────────────
// lon → x: (lon + 180) / 360 * W
// lat → y: (90 - lat) / 180 * H
function buildEarthTexture(): THREE.CanvasTexture {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  const gx = (lon: number) => (lon + 180) / 360 * W;
  const gy = (lat: number) => (90 - lat) / 180 * H;

  // ── 1. Deep Ocean Base ──
  const og = ctx.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0.0,  "#012B50");
  og.addColorStop(0.35, "#033B6A");
  og.addColorStop(0.55, "#022B52");
  og.addColorStop(1.0,  "#010F22");
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, W, H);

  // Shallow coastal tint overlay
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#1A7BAA";
  ctx.fillRect(0, gy(40), W, gy(20) - gy(40));
  ctx.globalAlpha = 1.0;

  // ── 2. Land ──
  const drawLand = (paths: [number, number][][], fill = "#243F28", alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    paths.forEach(pts => {
      ctx.beginPath();
      ctx.moveTo(gx(pts[0][0]), gy(pts[0][1]));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(gx(pts[i][0]), gy(pts[i][1]));
      ctx.closePath();
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  // North America
  drawLand([[
    [-168,72],[-140,70],[-110,68],[-90,72],[-80,68],[-70,62],[-60,50],
    [-55,47],[-60,44],[-66,42],[-72,42],[-74,40],[-76,35],[-80,25],
    [-83,18],[-90,10],[-85,10],[-78,8],[-76,10],[-72,18],[-68,22],
    [-62,25],[-60,30],[-58,38],[-60,44],[-56,47],[-60,50],
    [-70,62],[-80,68],[-90,72],[-110,72],[-140,70],[-160,65],[-168,60],
    [-165,52],[-170,56],[-168,72],
  ]]);
  // Mexico / Central America append
  drawLand([[[-90,10],[-83,8],[-78,8],[-76,10],[-83,18],[-88,16],[-92,16],[-90,10]]]);

  // Greenland (ice-grey)
  drawLand([[
    [-58,82],[-40,84],[-22,82],[-18,78],[-22,72],[-32,68],[-42,66],
    [-52,66],[-58,72],[-58,78],[-58,82],
  ]], "#D0E8F0", 0.9);

  // South America
  drawLand([[
    [-80,12],[-74,8],[-68,4],[-62,-5],[-55,-14],[-48,-25],
    [-45,-35],[-42,-45],[-50,-54],[-64,-56],[-68,-52],
    [-72,-48],[-70,-38],[-68,-28],[-72,-20],[-78,-10],
    [-80,0],[-80,12],
  ]]);

  // Europe
  drawLand([[
    [-10,36],[-5,38],[5,40],[15,44],[22,44],[30,46],
    [38,47],[35,52],[28,58],[22,60],[15,62],[8,62],
    [2,58],[-2,52],[-5,48],[-8,44],[-10,36],
  ]]);
  // Scandinavia
  drawLand([[
    [5,58],[8,62],[10,64],[12,68],[16,72],[22,70],[26,68],
    [28,62],[24,58],[18,56],[12,56],[5,58],
  ]]);
  // British Isles
  drawLand([[[-8,50],[-4,50],[-2,52],[0,54],[-2,58],[-4,56],[-6,56],[-8,54],[-6,52],[-8,50]]]);

  // Africa
  drawLand([[
    [-18,37],[-5,38],[10,37],[22,32],[36,28],[42,22],[50,11],
    [50,0],[42,-5],[40,-18],[36,-30],[28,-36],[18,-36],
    [8,-28],[0,-18],[-8,-14],[-18,-5],[-20,5],
    [-20,15],[-20,25],[-18,37],
  ]]);
  // Madagascar
  drawLand([[
    [44,-12],[46,-14],[50,-18],[50,-24],[48,-26],[44,-24],
    [44,-18],[43,-14],[44,-12],
  ]]);

  // Asia main
  drawLand([[
    [28,44],[38,48],[48,50],[60,52],[80,56],[100,58],[120,58],[140,52],[145,48],
    [142,42],[136,34],[128,26],[120,18],[108,12],[100,2],[96,-2],[104,-8],[108,-8],
    [100,2],[90,10],[80,10],[70,18],[66,22],[60,28],[50,22],[42,22],[38,28],
    [28,36],[28,44],
  ]]);
  // Indian subcontinent
  drawLand([[
    [66,22],[72,20],[80,18],[88,22],[84,10],[80,0],[76,-6],[72,0],[68,10],[66,22],
  ]]);
  // Southeast Asia
  drawLand([[
    [100,20],[106,16],[108,10],[104,2],[100,-2],[96,4],[100,12],[100,20],
  ]]);
  // Sumatra
  drawLand([[[96,-2],[104,-8],[108,-8],[106,-4],[102,0],[98,2],[96,-2]]]);
  // Java
  drawLand([[[108,-8],[116,-8],[112,-8],[108,-8]]]);
  // Borneo
  drawLand([[[108,4],[110,0],[112,-2],[116,-2],[118,2],[114,4],[110,6],[108,4]]]);
  // Japan
  drawLand([[[130,32],[132,34],[134,36],[136,38],[138,40],[140,42],[140,40],[138,36],[134,32],[130,32]]]);
  // Korean peninsula
  drawLand([[[124,34],[126,38],[128,38],[130,36],[128,32],[124,34]]]);

  // Australia
  drawLand([[
    [114,-22],[118,-18],[124,-16],[130,-14],[136,-14],[140,-18],[148,-22],
    [152,-26],[152,-32],[148,-36],[142,-38],[134,-36],[128,-32],[120,-28],
    [116,-26],[114,-22],
  ]]);
  // New Zealand north
  drawLand([[[174,-36],[176,-38],[176,-42],[174,-44],[172,-42],[172,-38],[174,-36]]]);
  // New Zealand south
  drawLand([[[168,-46],[170,-44],[172,-44],[172,-46],[170,-48],[168,-48],[168,-46]]]);

  // ── 3. Desert Overlay ──
  drawLand([[
    [(-18),37],[10,36],[22,32],[36,28],[42,22],
    [50,11],[50,0],[42,-5],[36,-2],[28,4],
    [14,10],[10,14],[0,18],[-14,20],[-18,22],[-18,37],
  ]], "#8B6B14", 0.35); // Sahara / Sahel

  drawLand([[[42,22],[50,22],[56,22],[60,24],[58,14],[50,14],[44,14],[42,18],[42,22]]], "#9A7020", 0.3); // Arabian

  // ── 4. Desaturated Mountains ──
  drawLand([
    [[78,28],[90,30],[100,32],[98,28],[86,26],[78,26],[78,28]], // Himalayas
    [[-76,-16],[-72,-12],[-68,-8],[-72,-24],[-74,-20],[-76,-16]], // Andes
    [[-124,42],[-118,46],[-112,50],[-116,44],[-122,38],[-124,42]], // Rockies
    [[0,44],[8,46],[14,44],[10,40],[4,42],[0,44]], // Alps
  ], "#4A3D2E", 0.55);

  // ── 5. Ice Caps ──
  // Antarctic
  ctx.fillStyle = "#C8DEF0";
  ctx.fillRect(0, gy(-65), W, H - gy(-65));
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#E4F0F8";
  ctx.fillRect(0, gy(-75), W, gy(-65) - gy(-75));
  ctx.globalAlpha = 1.0;

  // Arctic Ocean Ice
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#C8DEF0";
  ctx.beginPath();
  ctx.ellipse(W * 0.5, gy(88), W * 0.35, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // ── 6. Coastal Shallow Tint ──
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#25A0B5";
  ctx.filter = "blur(8px)";
  // Caribbean
  ctx.beginPath(); ctx.ellipse(gx(-76), gy(20), 70, 30, 0, 0, Math.PI*2); ctx.fill();
  // Mediterranean
  ctx.beginPath(); ctx.ellipse(gx(18), gy(36), 100, 22, 0, 0, Math.PI*2); ctx.fill();
  // South China Sea
  ctx.beginPath(); ctx.ellipse(gx(112), gy(14), 60, 30, 0, 0, Math.PI*2); ctx.fill();
  ctx.filter = "none";
  ctx.globalAlpha = 1.0;

  // ── 7. Latitude Lines (subtle) ──
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = "#7FFFD4";
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    ctx.moveTo(0, gy(lat)); ctx.lineTo(W, gy(lat));
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function buildCloudTexture(): THREE.CanvasTexture {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  // Fixed cloud band positions (realistic weather patterns)
  const bands = [
    { y: 0.12, spread: 0.05, alpha: 0.2  }, // polar front
    { y: 0.28, spread: 0.07, alpha: 0.18 }, // N mid-lat
    { y: 0.45, spread: 0.04, alpha: 0.12 }, // ITCZ
    { y: 0.62, spread: 0.07, alpha: 0.16 }, // S mid-lat
    { y: 0.82, spread: 0.06, alpha: 0.18 }, // southern front
  ];

  // Seed-based deterministic cloud patches
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

  bands.forEach(band => {
    const n = 60 + Math.floor(rand() * 40);
    for (let i = 0; i < n; i++) {
      const x = rand() * W;
      const y = (band.y + (rand() - 0.5) * band.spread * 2) * H;
      const rx = 20 + rand() * 60;
      const ry = 6 + rand() * 14;
      const rot = (rand() - 0.5) * 0.5;
      ctx.globalAlpha = band.alpha * (0.5 + rand() * 0.5);
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// ── World-Space Atmosphere Shader ──
const atmoVert = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const atmoFrag = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  uniform vec3 glowColor;
  uniform float intensity;
  void main() {
    float rim = 1.0 - max(dot(vWorldNormal, vViewDir), 0.0);
    rim = pow(rim, 2.8) * intensity;
    gl_FragColor = vec4(glowColor, rim);
  }
`;

// ── Star Field ──
function Stars({ count = 1500 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    let s = 1337;
    const r = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    for (let i = 0; i < count; i++) {
      const theta = r() * Math.PI * 2;
      const phi   = Math.acos(2 * r() - 1);
      const rad   = 45 + r() * 15;
      arr[i*3]   = rad * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = rad * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = rad * Math.cos(phi);
    }
    return arr;
  }, [count]);

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#E8F4FD" size={0.06} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ── Earth Component ────────────────────────────────────────
function Earth({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef  = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const autoRotY  = useRef(0);

  const earthTex = useMemo(() => buildEarthTexture(), []);
  const cloudTex = useMemo(() => buildCloudTexture(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ camera }, delta) => {
    // Smooth mouse
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.04;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.04;

    // Auto rotation
    autoRotY.current += delta * 0.06;

    const dive = scrollProgress.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = autoRotY.current + mouseCurrent.current.x * 0.25;
      groupRef.current.rotation.x = mouseCurrent.current.y * 0.1 * (1 - dive);

      // Dive effect: zoom in + push up
      const s = 1 + dive * 1.8;
      groupRef.current.scale.setScalar(s);
      groupRef.current.position.y = -dive * 1.5;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.035;
    }

    // Smooth camera zoom (single source of truth)
    const targetZ = 5.2 - dive * 2.8;
    camera.position.z += (targetZ - camera.position.z) * 0.07;
    camera.position.y += (-dive * 0.4 - camera.position.y) * 0.07;
  });

  return (
    <group ref={groupRef}>
      {/* Main Earth sphere */}
      <mesh>
        <sphereGeometry args={[1.6, 96, 96]} />
        <meshStandardMaterial
          map={earthTex}
          roughness={0.55}
          metalness={0.02}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.628, 64, 64]} />
        <meshStandardMaterial
          map={cloudTex}
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner atmosphere glow (tight, ocean blue) */}
      <mesh>
        <sphereGeometry args={[1.68, 48, 48]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          uniforms={{
            glowColor: { value: new THREE.Color("#1E90C8") },
            intensity: { value: 0.9 },
          }}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Outer atmosphere halo */}
      <mesh scale={1.25}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          uniforms={{
            glowColor: { value: new THREE.Color("#2EC4E0") },
            intensity: { value: 1.4 },
          }}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Public Export ──────────────────────────────────────────
export default function EarthV2({ scrollProgress }: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.18} />
      {/* Sun from upper-right */}
      <directionalLight position={[6, 3, 4]}   intensity={2.2} color="#FFF5E0" />
      {/* Subtle ocean-side fill */}
      <pointLight      position={[-5, -2, -3]} intensity={0.3} color="#0A5FA0" />

      <Stars count={1800} />
      <Earth scrollProgress={scrollProgress} />
    </Canvas>
  );
}
