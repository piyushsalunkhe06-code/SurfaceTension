"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function BiolumParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases, speeds, colors } = useMemo(() => {
    const pos   = new Float32Array(count * 3);
    const ph    = new Float32Array(count);
    const sp    = new Float32Array(count);
    const col   = new Float32Array(count * 3);

    const palette = [
      [0.49, 0.80, 0.82], // seafoam #7FFFD4
      [0.30, 0.80, 0.76], // teal #4ECDC4
      [0.0,  0.59, 0.72], // ocean #0096B7
      [1.0,  0.70, 0.27], // warm #FFB347
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      ph[i]          = Math.random() * Math.PI * 2;
      sp[i]          = 0.2 + Math.random() * 0.5;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, phases: ph, speeds: sp, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t   = clock.getElapsedTime();
    const pos = (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += Math.sin(t * speeds[i] + phases[i]) * 0.003;
      pos[i * 3 + 1] += Math.cos(t * speeds[i] * 0.7 + phases[i]) * 0.003;
      pos[i * 3 + 2] += Math.sin(t * speeds[i] * 0.5 + phases[i] * 0.8) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function FloatingOrbs({ count = 25 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const orbData = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 12] as [number,number,number],
      radius: 0.05 + Math.random() * 0.12,
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      color: ["#7FFFD4", "#4ECDC4", "#0096B7", "#FFB347"][Math.floor(Math.random() * 4)],
    })), [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const d = orbData[i];
        child.position.y = d.pos[1] + Math.sin(t * d.speed + d.phase) * 0.8;
        child.position.x = d.pos[0] + Math.cos(t * d.speed * 0.7 + d.phase) * 0.3;
        (child as THREE.Mesh).material && ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity ?
          (((child as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * d.speed * 2 + d.phase) * 0.4) : null;
      });
    }
  });

  return (
    <group ref={group}>
      {orbData.map((o, i) => (
        <mesh key={i} position={o.pos}>
          <sphereGeometry args={[o.radius, 8, 8]} />
          <meshStandardMaterial
            color={o.color}
            emissive={o.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

interface Props { className?: string; height?: string; }

export default function BiolumScene({ className = "", height = "h-80" }: Props) {
  return (
    <div className={`w-full ${height} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <BiolumParticles count={280} />
        <FloatingOrbs count={22} />
        <fog attach="fog" args={["#050E1A", 10, 22]} />
      </Canvas>
    </div>
  );
}
