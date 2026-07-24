"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function makeOceanEarthTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Deep ocean gradient
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0,   "#064069");
  grad.addColorStop(0.3, "#0a5a8c");
  grad.addColorStop(0.7, "#0c4f7a");
  grad.addColorStop(1,   "#06264a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Continents - natural green/brown
  ctx.fillStyle = "#2D6A4F";
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size * 0.75 + size * 0.1;
    const rx = 18 + Math.random() * 55;
    const ry = rx * (0.4 + Math.random() * 0.5);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mountain/desert highlights
  ctx.fillStyle = "#8B7355";
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size * 0.6 + size * 0.2;
    ctx.beginPath();
    ctx.ellipse(x, y, 8 + Math.random() * 20, 5 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ocean shimmer dots
  ctx.fillStyle = "rgba(127,255,212,0.04)";
  for (let i = 0; i < 500; i++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  // Polar ice caps
  ctx.fillStyle = "rgba(230,245,255,0.5)";
  ctx.fillRect(0, 0, size, 30);
  ctx.fillRect(0, size - 24, size, 24);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeCloudTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 80; i++) {
    ctx.globalAlpha = 0.1 + Math.random() * 0.2;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size, 12 + Math.random() * 38, 5 + Math.random() * 14, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

const atmosphereVert = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const atmosphereFrag = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0,0.0,1.0)), 2.2);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

function Earth({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef  = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const mouse     = useRef({ x: 0, y: 0 });

  const earthTex = useMemo(() => makeOceanEarthTexture(), []);
  const cloudTex = useMemo(() => makeCloudTexture(), []);

  useFrame(({ camera, pointer }, delta) => {
    mouse.current.x += (pointer.x - mouse.current.x) * 0.03;
    mouse.current.y += (pointer.y - mouse.current.y) * 0.03;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.07;
      groupRef.current.rotation.y += mouse.current.x * 0.002;
      groupRef.current.rotation.x  = mouse.current.y * 0.12;

      const dive = scrollProgress.current;
      groupRef.current.scale.setScalar(1 + dive * 1.6);
      groupRef.current.position.y = -dive * 1.2;
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.04;

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z, 5.5 - scrollProgress.current * 2.5, 0.06
    );
  });

  return (
    <group ref={groupRef}>
      {/* Ocean surface */}
      <mesh>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial map={earthTex} roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.635, 64, 64]} />
        <meshStandardMaterial map={cloudTex} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Ocean-tinted atmosphere */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVert}
          fragmentShader={atmosphereFrag}
          uniforms={{ glowColor: { value: new THREE.Color("#0096B7") } }}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>
      {/* Second outer glow ring */}
      <mesh scale={1.32}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVert}
          fragmentShader={atmosphereFrag}
          uniforms={{ glowColor: { value: new THREE.Color("#4ECDC4") } }}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>
    </group>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => { camera.lookAt(0, -scrollProgress.current * 1.2, 0); });
  return null;
}

export default function HeroEarth({ scrollProgress }: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 3, 5]}   intensity={1.8} color="#E8F4FD" />
      <pointLight      position={[-3, -2, -3]}  intensity={0.4} color="#0096B7" />
      <pointLight      position={[0, 6, 2]}     intensity={0.3} color="#4ECDC4" />
      <Earth scrollProgress={scrollProgress} />
      <CameraRig scrollProgress={scrollProgress} />
    </Canvas>
  );
}
