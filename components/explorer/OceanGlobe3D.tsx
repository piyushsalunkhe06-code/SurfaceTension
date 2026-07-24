"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

const OCEAN_REGIONS = [
  { id: "pacific",       name: "Pacific Ocean",    lat:  5,   lon: -160, score: 82, status: "good" as const },
  { id: "atlantic",      name: "Atlantic Ocean",   lat: 15,   lon: -35,  score: 61, status: "warn" as const },
  { id: "indian",        name: "Indian Ocean",     lat: -10,  lon:  75,  score: 58, status: "warn" as const },
  { id: "southern",      name: "Southern Ocean",   lat: -60,  lon:   0,  score: 90, status: "good" as const },
  { id: "arctic",        name: "Arctic Ocean",     lat:  80,  lon:   0,  score: 34, status: "crit" as const },
  { id: "mediterranean", name: "Mediterranean Sea",lat:  36,  lon:  18,  score: 41, status: "crit" as const },
  { id: "southchina",    name: "S. China Sea",     lat:  14,  lon: 114,  score: 55, status: "warn" as const },
  { id: "northsea",      name: "North Sea",        lat:  56,  lon:   3,  score: 62, status: "warn" as const },
];

const statusColor = { good: "#85ECD4", warn: "#FF9F1C", crit: "#E8694A" } as const;

function latLonToVec3(lat: number, lon: number, radius = 2.05): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function buildExplorerGlobeTex(): THREE.CanvasTexture {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const og = ctx.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0.0, "#011A35");
  og.addColorStop(0.5, "#032B52");
  og.addColorStop(1.0, "#011024");
  ctx.fillStyle = og; ctx.fillRect(0, 0, W, H);

  // Continents overlay
  ctx.fillStyle = "#1E3B27";
  const gx = (lon: number) => (lon + 180) / 360 * W;
  const gy = (lat: number) => (90 - lat) / 180 * H;

  // Americas
  ctx.beginPath();
  ctx.ellipse(gx(-100), gy(40), 120, 80, 0, 0, Math.PI*2);
  ctx.ellipse(gx(-60), gy(-15), 70, 110, 0, 0, Math.PI*2);
  ctx.fill();

  // Eurasia & Africa
  ctx.beginPath();
  ctx.ellipse(gx(20), gy(10), 90, 100, 0, 0, Math.PI*2); // Africa
  ctx.ellipse(gx(80), gy(45), 180, 70, 0, 0, Math.PI*2); // Eurasia
  ctx.ellipse(gx(135), gy(-25), 80, 60, 0, 0, Math.PI*2); // Australia
  ctx.fill();

  // Ice
  ctx.fillStyle = "#D0E8F0";
  ctx.fillRect(0, gy(-65), W, H - gy(-65));
  ctx.fillRect(0, 0, W, gy(75));

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function OceanGlobe({ onSelect, selected }: {
  onSelect: (id: string) => void;
  selected: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => buildExplorerGlobeTex(), []);

  useFrame((_, delta) => {
    if (groupRef.current && !selected) groupRef.current.rotation.y += delta * 0.05;
  });

  const atmoVert = `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const atmoFrag = `varying vec3 vNormal; void main(){ float i=pow(0.6-dot(vNormal,vec3(0,0,1)),2.2); gl_FragColor=vec4(0.05,0.55,0.70,1.0)*i; }`;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[2, 32, 32]} />
        <shaderMaterial
          vertexShader={atmoVert} fragmentShader={atmoFrag}
          blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent
        />
      </mesh>
      {OCEAN_REGIONS.map((r) => {
        const pos = latLonToVec3(r.lat, r.lon);
        const col = statusColor[r.status];
        const isSelected = selected === r.id;
        return (
          <group key={r.id} position={pos}>
            <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(r.id); }}>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={isSelected ? 2.0 : 0.8} />
            </mesh>
            {isSelected && (
              <Html center distanceFactor={5.5}>
                <div className="pointer-events-none whitespace-nowrap rounded-lg px-3 py-1.5 text-[0.65rem] font-mono font-bold" style={{
                  background: "rgba(4,13,20,0.95)",
                  border: `1px solid ${col}66`,
                  color: col,
                  boxShadow: `0 0 16px ${col}44`,
                }}>
                  {r.name} — {r.score}/100
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function OceanGlobe3D({ onSelect, selected }: {
  onSelect: (id: string) => void;
  selected: string | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]}  intensity={1.8} color="#E8F4FD" />
      <pointLight      position={[-4, -2, -2]} intensity={0.4} color="#0096B7" />
      <OceanGlobe onSelect={onSelect} selected={selected} />
      <OrbitControls
        enablePan={false}
        minDistance={3.8}
        maxDistance={9}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.45}
        autoRotate={!selected}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
