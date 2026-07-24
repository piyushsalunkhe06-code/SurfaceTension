"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OceanSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float wave1 = sin(pos.x * 1.2 + uTime * 0.8) * 0.18;
      float wave2 = sin(pos.y * 0.9 + uTime * 0.6) * 0.12;
      float wave3 = sin((pos.x + pos.y) * 0.7 + uTime * 1.1) * 0.08;
      float wave4 = cos(pos.x * 1.8 - uTime * 0.5) * 0.06;

      vElevation = wave1 + wave2 + wave3 + wave4;
      pos.z += vElevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vec3 deepColor    = vec3(0.03, 0.08, 0.18);
      vec3 shallowColor = vec3(0.0,  0.52, 0.72);
      vec3 foamColor    = vec3(0.7,  0.95, 1.0);

      float mix1 = (vElevation + 0.4) / 0.8;
      vec3 waterColor = mix(deepColor, shallowColor, clamp(mix1, 0.0, 1.0));

      float foam = smoothstep(0.25, 0.45, vElevation);
      waterColor = mix(waterColor, foamColor, foam * 0.35);

      float alpha = 0.7 + vElevation * 0.4;
      gl_FragColor = vec4(waterColor, clamp(alpha, 0.4, 0.9));
    }
  `;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[22, 22, 80, 80]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function UnderglowParticles({ count = 120 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      spd[i]         = 0.02 + Math.random() * 0.05;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    const pos = (points.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.5;
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4ECDC4" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

interface Props {
  className?: string;
  height?: string;
}

export default function OceanWaveScene({ className = "", height = "h-64" }: Props) {
  return (
    <div className={`w-full ${height} ${className}`}>
      <Canvas
        camera={{ position: [0, 4, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={1.2} color="#0096B7" />
        <pointLight position={[5, 2, -5]} intensity={0.6} color="#4ECDC4" />
        <OceanSurface />
        <UnderglowParticles count={100} />
        <fog attach="fog" args={["#050E1A", 14, 26]} />
      </Canvas>
    </div>
  );
}
