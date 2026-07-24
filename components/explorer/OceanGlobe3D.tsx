"use client";

import { useRef, useMemo, useState } from "react";
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

const statusColor = { good: "#4ECDC4", warn: "#FF9F1C", crit: "#FF6B6B" } as const;

function latLonToVec3(lat: number, lon: number, radius = 2.05): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function makeEarthTex() {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, "#064069"); g.addColorStop(0.5, "#0a5a8c"); g.addColorStop(1, "#062645");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  // Continents
  ctx.fillStyle = "#1B4D3E";
  [[0.13,0.30,0.09,0.18],[0.18,0.53,0.07,0.20],[0.44,0.23,0.06,0.09],[0.48,0.33,0.05,0.20],
   [0.52,0.16,0.16,0.15],[0.70,0.28,0.08,0.13],[0.70,0.20,0.04,0.07],[0.80,0.48,0.07,0.09]
  ].forEach(([x,y,rx,ry]) => {
    ctx.beginPath();
    ctx.ellipse(x*s, y*s, rx*s, ry*s, 0.2, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(0, 0, s, 30); ctx.fillRect(0, s-25, s, 25);
  return new THREE.CanvasTexture(c);
}

function OceanGlobe({ onSelect, selected }: {
  onSelect: (id: string) => void;
  selected: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeEarthTex(), []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04;
  });

  // Atmosphere vert/frag
  const atmoVert = `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const atmoFrag = `varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1)),2.2); gl_FragColor=vec4(0.0,0.59,0.72,1.0)*i; }`;

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.18}>
        <sphereGeometry args={[2, 32, 32]} />
        <shaderMaterial
          vertexShader={atmoVert} fragmentShader={atmoFrag}
          blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent
        />
      </mesh>
      {/* Region markers */}
      {OCEAN_REGIONS.map((r) => {
        const pos = latLonToVec3(r.lat, r.lon);
        const col = statusColor[r.status];
        const isSelected = selected === r.id;
        return (
          <group key={r.id} position={pos}>
            {/* Pulse ring */}
            <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(r.id); }}>
              <sphereGeometry args={[isSelected ? 0.075 : 0.055, 12, 12]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={isSelected ? 1.5 : 0.8} />
            </mesh>
            {/* Label via Html */}
            {isSelected && (
              <Html center distanceFactor={5}>
                <div className="pointer-events-none whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[0.62rem] font-mono font-bold" style={{
                  background: "rgba(5,14,26,0.92)",
                  border: `1px solid ${col}55`,
                  color: col,
                  boxShadow: `0 0 10px ${col}44`,
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
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]}  intensity={1.6} color="#E8F4FD" />
      <pointLight      position={[-4, -2, -2]} intensity={0.4} color="#0096B7" />
      <OceanGlobe onSelect={onSelect} selected={selected} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.4}
        autoRotate={!selected}
        autoRotateSpeed={0.4}
      />
      <fog attach="fog" args={["#050E1A", 10, 22]} />
    </Canvas>
  );
}
