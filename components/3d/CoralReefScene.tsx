"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Coral Branch ─────────────────────────────────────────
function CoralBranch({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.4 + position[0]) * 0.06;
    }
  });

  const branches = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      h: 0.5 + Math.random() * 1.2,
      r: 0.04 + Math.random() * 0.05,
      x: (Math.random() - 0.5) * 0.7,
      z: (Math.random() - 0.5) * 0.7,
      rot: (Math.random() - 0.5) * 0.5,
      childH: 0.2 + Math.random() * 0.4,
    })), []);

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {branches.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2, b.z]} rotation={[b.rot, 0, b.rot * 0.5]}>
            <cylinderGeometry args={[b.r * 0.5, b.r, b.h, 5]} />
            <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.1} />
          </mesh>
          {/* Small tip */}
          <mesh position={[b.x + b.rot * 0.3, b.h + b.childH / 2, b.z]}>
            <coneGeometry args={[b.r * 0.3, b.childH, 4]} />
            <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Sea Anemone ──────────────────────────────────────────
function Anemone({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const tentacles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      len: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    })), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (tentacles[i]) {
          child.rotation.x = Math.sin(clock.getElapsedTime() * 0.8 + tentacles[i].phase) * 0.3;
          child.rotation.z = Math.cos(clock.getElapsedTime() * 0.6 + tentacles[i].phase) * 0.2;
        }
      });
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.2, 8]} />
        <meshStandardMaterial color="#FF6B6B" roughness={0.8} />
      </mesh>
      <group ref={groupRef}>
        {tentacles.map((t, i) => (
          <mesh
            key={i}
            position={[Math.cos(t.angle) * 0.1, 0.2 + t.len / 2, Math.sin(t.angle) * 0.1]}
            rotation={[t.angle * 0.1, 0, 0]}
          >
            <cylinderGeometry args={[0.012, 0.008, t.len, 4]} />
            <meshStandardMaterial color="#FFB347" roughness={0.6} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Fish School ─────────────────────────────────────────
function TropicalFish({ count = 30 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const fishData = useMemo(() =>
    Array.from({ length: count }, () => ({
      radius:  2 + Math.random() * 2.5,
      speed:   0.15 + Math.random() * 0.3,
      offset:  Math.random() * Math.PI * 2,
      y:       (Math.random() - 0.5) * 2.5,
      scale:   0.07 + Math.random() * 0.06,
      bobAmp:  0.1 + Math.random() * 0.15,
    })), [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    fishData.forEach((f, i) => {
      const angle = t * f.speed + f.offset;
      dummy.position.set(
        Math.cos(angle) * f.radius,
        f.y + Math.sin(t * 1.2 + f.offset) * f.bobAmp,
        Math.sin(angle) * f.radius
      );
      dummy.rotation.y = -angle + Math.PI / 2;
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.5, 1.6, 4]} />
      <meshStandardMaterial color="#FFB347" emissive="#FF6B6B" emissiveIntensity={0.2} />
    </instancedMesh>
  );
}

// ─── Bioluminescent Jellyfish ──────────────────────────────
function Jellyfish({ position, color = "#7FFFD4" }: {
  position: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.5;
      ref.current.scale.y = 1 + Math.sin(t * 1.8) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Bell */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Rim glow */}
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.35, 0.02, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      {/* Tentacles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos((i / 8) * Math.PI * 2) * 0.2,
          -0.6 - Math.random() * 0.3,
          Math.sin((i / 8) * Math.PI * 2) * 0.2
        ]}>
          <cylinderGeometry args={[0.008, 0.003, 0.8 + Math.random() * 0.4, 4]} />
          <meshStandardMaterial color={color} transparent opacity={0.4} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Caustic Light Rays ────────────────────────────────────
function LightRays() {
  const raysRef = useRef<THREE.Group>(null);
  const rays = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: (i - 4) * 1.6,
      rot: (Math.random() - 0.5) * 0.35,
      opacity: 0.03 + Math.random() * 0.04,
    })), []);

  useFrame(({ clock }) => {
    if (raysRef.current) {
      raysRef.current.children.forEach((ray, i) => {
        ray.rotation.z = rays[i].rot + Math.sin(clock.getElapsedTime() * 0.3 + i) * 0.05;
      });
    }
  });

  return (
    <group ref={raysRef}>
      {rays.map((r, i) => (
        <mesh key={i} position={[r.x, 3, -3]} rotation={[0, 0, r.rot]}>
          <planeGeometry args={[0.7, 12]} />
          <meshBasicMaterial color="#7FFFD4" transparent opacity={r.opacity} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Sandy Floor ───────────────────────────────────────────
function SeaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <meshStandardMaterial color="#1A3A2A" roughness={1} />
    </mesh>
  );
}

// ─── Main Export ───────────────────────────────────────────
interface Props { className?: string; height?: string; }

export default function CoralReefScene({ className = "", height = "h-96" }: Props) {
  return (
    <div className={`w-full ${height} ${className}`}>
      <Canvas
        camera={{ position: [0, 1, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 6, 0]} intensity={1.0} color="#7FFFD4" />
        <pointLight position={[-4, 3, 2]} intensity={0.7} color="#4ECDC4" />
        <pointLight position={[4, 2, -2]} intensity={0.6} color="#0096B7" />
        <fog attach="fog" args={["#021424", 8, 18]} />

        <SeaFloor />
        <LightRays />

        {/* Coral clusters */}
        <CoralBranch position={[-3.5, -2.8, -1]}   color="#FF6B6B" scale={1.2} />
        <CoralBranch position={[-2.0, -2.8, 1.5]}  color="#FF6B6B" scale={0.9} />
        <CoralBranch position={[3.2,  -2.8, -1.5]} color="#FFB347" scale={1.1} />
        <CoralBranch position={[2.0,  -2.8, 1.0]}  color="#FF6B6B" scale={0.8} />
        <CoralBranch position={[0.5,  -2.8, 2.0]}  color="#4ECDC4" scale={0.7} />
        <CoralBranch position={[-0.8, -2.8, -2.0]} color="#FFB347" scale={1.0} />

        {/* Anemones */}
        <Anemone position={[-1.2, -2.6, 0.5]} />
        <Anemone position={[1.8,  -2.6, -0.3]} />
        <Anemone position={[0.2,  -2.6, 1.5]} />

        {/* Jellyfish */}
        <Jellyfish position={[2.0,  0.5, -0.5]} color="#7FFFD4" />
        <Jellyfish position={[-1.5, 1.0, 0.8]}  color="#4ECDC4" />
        <Jellyfish position={[0.5,  -0.5, -1.0]} color="#FFB347" />

        {/* Fish */}
        <TropicalFish count={35} />
      </Canvas>
    </div>
  );
}
