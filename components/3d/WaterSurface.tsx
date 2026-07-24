"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const waveVert = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float e =
      sin(pos.x * 1.2  + uTime * 0.55) * 0.28 +
      sin(pos.y * 0.8  + uTime * 0.40) * 0.20 +
      sin((pos.x * 0.7 + pos.y * 0.9) + uTime * 0.75) * 0.14 +
      cos(pos.x * 1.8  - uTime * 0.50) * 0.08 +
      cos(pos.y * 1.4  + pos.x * 0.5 + uTime * 0.65) * 0.06;

    vElevation = e;
    pos.z += e;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waveFrag = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Deep ocean base
    vec3 deepColor  = vec3(0.012, 0.095, 0.185);
    vec3 midColor   = vec3(0.040, 0.200, 0.340);
    vec3 crestColor = vec3(0.100, 0.380, 0.500);
    vec3 foamColor  = vec3(0.520, 0.930, 0.830);

    float t = (vElevation + 0.6) / 1.2;
    vec3 col = mix(deepColor, midColor, smoothstep(0.0, 0.4, t));
    col = mix(col, crestColor, smoothstep(0.4, 0.7, t));
    col = mix(col, foamColor,  smoothstep(0.7, 1.0, t));

    // Edge shimmer
    float shimmer = smoothstep(0.0, 1.0, vElevation + 0.3) * 0.15;
    col += shimmer;

    gl_FragColor = vec4(col, 0.92);
  }
`;

function OceanMesh() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[22, 22, 140, 140]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={waveVert}
        fragmentShader={waveFrag}
        uniforms={{ uTime: { value: 0 } }}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
}

export default function WaterSurface({ height = "h-full" }: { height?: string }) {
  return (
    <div className={`w-full ${height}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 10], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} color="#0A3F6A" />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#C8E8F8" />
        <pointLight position={[-6, 4, -4]} intensity={0.6} color="#4ECDC4" />
        <OceanMesh />
      </Canvas>
    </div>
  );
}
