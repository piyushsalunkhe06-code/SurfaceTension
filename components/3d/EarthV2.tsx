"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Improved Procedural Perlin/Simplex Noise Generator for Photorealistic Earth ──
function createNoise() {
  const p = new Uint8Array(512);
  const permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t: number, a: number, b: number) { return a + t * (b - a); }
  function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return function noise(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                   grad(p[BA], x - 1, y, z)),
                           lerp(u, grad(p[AB], x, y - 1, z),
                                   grad(p[BB], x - 1, y - 1, z))),
                   lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                                   grad(p[BA + 1], x - 1, y, z - 1)),
                           lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                                   grad(p[BB + 1], x - 1, y - 1, z - 1))));
  };
}

const noise3D = createNoise();

function fbm(x: number, y: number, z: number, octaves = 5) {
  let val = 0;
  let freq = 1;
  let amp = 0.5;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise3D(x * freq, y * freq, z * freq) * amp;
    maxAmp += amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return val / maxAmp;
}

// ── Build High-Res Photorealistic Textures ──────────────────────────────────
function buildPhotorealisticTextures() {
  const W = 2048, H = 1024;

  // 1. Color Map Canvas
  const canvasColor = document.createElement("canvas");
  canvasColor.width = W; canvasColor.height = H;
  const ctxC = canvasColor.getContext("2d")!;
  const imgDataC = ctxC.createImageData(W, H);

  // 2. Specular Map Canvas (White = glossy ocean, Black = matte land)
  const canvasSpec = document.createElement("canvas");
  canvasSpec.width = W; canvasSpec.height = H;
  const ctxS = canvasSpec.getContext("2d")!;
  const imgDataS = ctxS.createImageData(W, H);

  // 3. Bump Map Canvas (Elevations)
  const canvasBump = document.createElement("canvas");
  canvasBump.width = W; canvasBump.height = H;
  const ctxB = canvasBump.getContext("2d")!;
  const imgDataB = ctxB.createImageData(W, H);

  for (let y = 0; y < H; y++) {
    const lat = (0.5 - y / H) * Math.PI; // -PI/2 to PI/2
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);

    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2; // 0 to 2PI
      const nx = cosLat * Math.cos(lon);
      const ny = sinLat;
      const nz = cosLat * Math.sin(lon);

      // Continent base noise
      let n = fbm(nx * 1.4 + 10, ny * 1.4 + 10, nz * 1.4 + 10, 6);
      
      // Broad continent shaping (raise Americas, Eurasia, Africa, Australia)
      // Masking Antarctica & Arctic
      const absLat = Math.abs(lat / (Math.PI / 2));

      // Land threshold: n > 0.04 is land
      const isLand = n > 0.04 && absLat < 0.88;
      const isIceCap = absLat >= 0.82;

      const idx = (y * W + x) * 4;

      if (isIceCap) {
        // Snow / Ice Cap
        imgDataC.data[idx]     = 230; // R
        imgDataC.data[idx + 1] = 240; // G
        imgDataC.data[idx + 2] = 248; // B
        imgDataC.data[idx + 3] = 255;

        // Ice specular reflection (slightly glossy)
        imgDataS.data[idx]     = 100;
        imgDataS.data[idx + 1] = 100;
        imgDataS.data[idx + 2] = 100;
        imgDataS.data[idx + 3] = 255;

        imgDataB.data[idx]     = 180;
        imgDataB.data[idx + 1] = 180;
        imgDataB.data[idx + 2] = 180;
        imgDataB.data[idx + 3] = 255;
      } else if (isLand) {
        // Continent Elevation gradient (Coastal Green -> Mountain Brown/Slate)
        const elevation = (n - 0.04) / 0.45; // 0 to 1
        
        let r = 0, g = 0, b = 0;
        const latAbsDeg = Math.abs(lat * (180 / Math.PI));

        if (latAbsDeg < 25 && elevation < 0.25 && (x > W * 0.45 && x < W * 0.65)) {
          // Sahara / Arabian desert region tint
          r = 180 + Math.floor(elevation * 50);
          g = 145 + Math.floor(elevation * 30);
          b = 90;
        } else if (elevation < 0.35) {
          // Lush Forest & Grasslands
          r = Math.floor(25 + elevation * 40);
          g = Math.floor(75 + elevation * 60);
          b = Math.floor(35 + elevation * 20);
        } else if (elevation < 0.65) {
          // Higher hills / dry plateau
          r = Math.floor(90 + elevation * 50);
          g = Math.floor(80 + elevation * 30);
          b = Math.floor(55 + elevation * 15);
        } else {
          // Mountain Peaks (rocky slate/snow)
          r = Math.floor(140 + elevation * 80);
          g = Math.floor(140 + elevation * 80);
          b = Math.floor(150 + elevation * 90);
        }

        imgDataC.data[idx]     = r;
        imgDataC.data[idx + 1] = g;
        imgDataC.data[idx + 2] = b;
        imgDataC.data[idx + 3] = 255;

        // Land is matte (No specular shine)
        imgDataS.data[idx]     = 0;
        imgDataS.data[idx + 1] = 0;
        imgDataS.data[idx + 2] = 0;
        imgDataS.data[idx + 3] = 255;

        // Bump height
        const bumpVal = Math.min(255, Math.floor(elevation * 255));
        imgDataB.data[idx]     = bumpVal;
        imgDataB.data[idx + 1] = bumpVal;
        imgDataB.data[idx + 2] = bumpVal;
        imgDataB.data[idx + 3] = 255;
      } else {
        // Deep Ocean to Coastal Water Gradient
        const distToCoast = (0.04 - n);
        const isShallow = distToCoast < 0.035;

        let r = 0, g = 0, b = 0;
        if (isShallow) {
          // Shallow coastal shelf turquoise (#126B88 to #083E63)
          const factor = distToCoast / 0.035;
          r = Math.floor(18 * (1 - factor) + 4 * factor);
          g = Math.floor(107 * (1 - factor) + 32 * factor);
          b = Math.floor(136 * (1 - factor) + 70 * factor);
        } else {
          // Deep Abyss Blue (#02132B to #062247)
          r = 2;
          g = 18;
          b = 45;
        }

        imgDataC.data[idx]     = r;
        imgDataC.data[idx + 1] = g;
        imgDataC.data[idx + 2] = b;
        imgDataC.data[idx + 3] = 255;

        // Oceans are highly reflective (Specular gloss)
        imgDataS.data[idx]     = 240;
        imgDataS.data[idx + 1] = 240;
        imgDataS.data[idx + 2] = 240;
        imgDataS.data[idx + 3] = 255;

        // Ocean surface is smooth
        imgDataB.data[idx]     = 0;
        imgDataB.data[idx + 1] = 0;
        imgDataB.data[idx + 2] = 0;
        imgDataB.data[idx + 3] = 255;
      }
    }
  }

  ctxC.putImageData(imgDataC, 0, 0);
  ctxS.putImageData(imgDataS, 0, 0);
  ctxB.putImageData(imgDataB, 0, 0);

  const colorTex = new THREE.CanvasTexture(canvasColor);
  const specTex  = new THREE.CanvasTexture(canvasSpec);
  const bumpTex  = new THREE.CanvasTexture(canvasBump);

  colorTex.wrapS = colorTex.wrapT = THREE.ClampToEdgeWrapping;
  specTex.wrapS  = specTex.wrapT  = THREE.ClampToEdgeWrapping;
  bumpTex.wrapS  = bumpTex.wrapT  = THREE.ClampToEdgeWrapping;

  return { colorTex, specTex, bumpTex };
}

// ── Swirling Photorealistic Cloud Texture ───────────────────────────────────
function buildPhotorealisticClouds() {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const imgData = ctx.createImageData(W, H);

  for (let y = 0; y < H; y++) {
    const lat = (0.5 - y / H) * Math.PI;
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);

    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      const nx = cosLat * Math.cos(lon);
      const ny = sinLat;
      const nz = cosLat * Math.sin(lon);

      // Cloud noise with spiral wind sway
      let cn = fbm(nx * 2.5 + 40, ny * 2.5 + 40, nz * 2.5 + 40, 5);
      cn = Math.pow(Math.max(0, cn - 0.08), 1.4);

      const idx = (y * W + x) * 4;
      const alpha = Math.min(230, Math.floor(cn * 320));

      imgData.data[idx]     = 255;
      imgData.data[idx + 1] = 255;
      imgData.data[idx + 2] = 255;
      imgData.data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const cloudTex = new THREE.CanvasTexture(c);
  cloudTex.wrapS = THREE.RepeatWrapping;
  cloudTex.wrapT = THREE.ClampToEdgeWrapping;
  return cloudTex;
}

// ── Realistic Atmosphere Rayleigh Shader ────────────────────────────────────
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
  void main() {
    float intensity = pow(0.68 - dot(vWorldNormal, vViewDir), 2.5);
    gl_FragColor = vec4(glowColor, intensity * 0.95);
  }
`;

// ── Starfield background ───────────────────────────────────────────────────
function Stars({ count = 1200 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    let seed = 77;
    const r = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    for (let i = 0; i < count; i++) {
      const theta = r() * Math.PI * 2;
      const phi   = Math.acos(2 * r() - 1);
      const rad   = 40 + r() * 10;
      arr[i*3]   = rad * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = rad * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = rad * Math.cos(phi);
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#E2F1F8" size={0.07} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ── Main Earth Sphere ───────────────────────────────────────────────────────
function EarthMesh() {
  const groupRef  = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  const { colorTex, specTex, bumpTex } = useMemo(() => buildPhotorealisticTextures(), []);
  const cloudTex = useMemo(() => buildPhotorealisticClouds(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.03;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.03;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
      groupRef.current.rotation.y += mouseCurrent.current.x * 0.002;
      groupRef.current.rotation.x = mouseCurrent.current.y * 0.08;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.055;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ocean + Land Earth Sphere with Specular Sun Reflections & Bump maps */}
      <mesh>
        <sphereGeometry args={[1.8, 96, 96]} />
        <meshPhongMaterial
          map={colorTex}
          specularMap={specTex}
          bumpMap={bumpTex}
          bumpScale={0.03}
          specular={new THREE.Color("#60A5FA")}
          shininess={25}
        />
      </mesh>

      {/* Cloud Sphere */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.825, 64, 64]} />
        <meshStandardMaterial
          map={cloudTex}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Ocean Atmosphere Rim */}
      <mesh>
        <sphereGeometry args={[1.88, 48, 48]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          uniforms={{
            glowColor: { value: new THREE.Color("#1B7DA6") },
          }}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Outer Atmosphere Glow Halo */}
      <mesh scale={1.22}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          uniforms={{
            glowColor: { value: new THREE.Color("#4ECDC4") },
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

// ── Public Export ───────────────────────────────────────────────────────────
export default function EarthV2() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.0], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Sunlight direction */}
      <ambientLight intensity={0.25} color="#082038" />
      <directionalLight position={[6, 3, 5]} intensity={2.6} color="#FFF8E7" />
      <pointLight position={[-6, -3, -4]} intensity={0.4} color="#0E6B8A" />

      <Stars count={1200} />
      <EarthMesh />
    </Canvas>
  );
}
