"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FishSchool({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        radius: 2 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 3,
        scale: 0.06 + Math.random() * 0.05,
      })),
    [count]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    data.forEach((d, i) => {
      const angle = t * d.speed + d.offset;
      const x = Math.cos(angle) * d.radius;
      const z = Math.sin(angle) * d.radius;
      dummy.position.set(x, d.y + Math.sin(t + d.offset) * 0.2, z);
      dummy.rotation.y = -angle + Math.PI / 2;
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.5, 1.6, 4]} />
      <meshStandardMaterial color="#AFC6E0" emissive="#00E5FF" emissiveIntensity={0.15} />
    </instancedMesh>
  );
}

function Coral({ position, hue }: { position: [number, number, number]; hue: string }) {
  const branches = useMemo(
    () =>
      Array.from({ length: 5 }, () => ({
        h: 0.6 + Math.random() * 1.2,
        r: 0.05 + Math.random() * 0.06,
        x: (Math.random() - 0.5) * 0.6,
        z: (Math.random() - 0.5) * 0.6,
        rot: (Math.random() - 0.5) * 0.6,
      })),
    []
  );
  return (
    <group position={position}>
      {branches.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} rotation={[0, 0, b.rot]}>
          <coneGeometry args={[b.r, b.h, 6]} />
          <meshStandardMaterial color={hue} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Jellyfish({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.4;
      ref.current.scale.y = 1 + Math.sin(t * 2) * 0.08;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial
          color="#00E5FF"
          transparent
          opacity={0.35}
          emissive="#00E5FF"
          emissiveIntensity={0.6}
        />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 0.15, -0.5, Math.sin(i) * 0.15]}>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 4]} />
          <meshStandardMaterial color="#00E5FF" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function LightRays() {
  const rays = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ x: (i - 3) * 1.4, rot: (Math.random() - 0.5) * 0.2 })),
    []
  );
  return (
    <>
      {rays.map((r, i) => (
        <mesh key={i} position={[r.x, 3, -2]} rotation={[0, 0, r.rot]}>
          <planeGeometry args={[0.6, 10]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function UnderwaterScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={1.2} color="#00E5FF" />
      <fog attach="fog" args={["#012a3a", 4, 14]} />
      <FishSchool count={40} />
      <Coral position={[-2.4, -1.6, -1]} hue="#00D084" />
      <Coral position={[2.2, -1.6, -1.5]} hue="#00E5FF" />
      <Coral position={[0.3, -1.7, 1.2]} hue="#0A4D8C" />
      <Jellyfish position={[1.6, 1, -0.5]} />
      <Jellyfish position={[-1.8, 0.3, 0.8]} />
      <LightRays />
    </Canvas>
  );
}
