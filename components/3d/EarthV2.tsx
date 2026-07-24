"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Shader identical to explorer, adapted for hero (no click handler) ───────

const EARTH_VERT = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uSpecMap;
  uniform sampler2D uNormalMap;
  uniform sampler2D uCloudsMap;
  uniform vec3 uSunDirection;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 dayColor   = texture2D(uDayMap, vUv);
    vec4 nightColor = texture2D(uNightMap, vUv);
    vec4 specMask   = texture2D(uSpecMap, vUv);
    vec4 cloudColor = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.008, vUv.y));
    vec3 normalMap  = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
    vec3 pertNormal = normalize(vNormal + normalMap * 0.3);

    float sunDot    = dot(pertNormal, normalize(uSunDirection));
    float dayFactor = smoothstep(-0.15, 0.25, sunDot);
    vec3 ambientLight = vec3(0.015, 0.02, 0.035);
    float diffuse   = max(sunDot, 0.0);

    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 halfVec = normalize(normalize(uSunDirection) + viewDir);
    float specular = pow(max(dot(pertNormal, halfVec), 0.0), 64.0) * specMask.r * 0.8;

    vec3 dayFinal   = dayColor.rgb * (ambientLight + diffuse * vec3(1.0, 0.98, 0.95)) + vec3(specular);
    vec3 nightFinal = nightColor.rgb * 1.6;
    vec3 earthColor = mix(nightFinal, dayFinal, dayFactor);

    float cloudAlpha = cloudColor.r * 0.55 * (0.7 + 0.3 * dayFactor);
    vec3 cloudLit    = vec3(1.0) * max(sunDot, 0.05) + ambientLight;
    earthColor       = mix(earthColor, cloudLit, cloudAlpha);

    float rim      = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow   = pow(rim, 2.8);
    vec3 rimColor  = vec3(0.2, 0.55, 1.0) * rimPow * 0.4 * dayFactor;
    earthColor    += rimColor;

    gl_FragColor = vec4(earthColor, 1.0);
  }
`;

const ATMO_VERT = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = `
  uniform vec3 uSunDirection;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir  = normalize(cameraPosition - vPosition);
    float rim     = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow  = pow(rim, 3.5);
    float sunDot  = dot(normalize(vNormal), normalize(uSunDirection));
    float sunGlow = smoothstep(-0.4, 0.8, sunDot);
    vec3 dayAtmo    = mix(vec3(0.25, 0.58, 1.0), vec3(0.8, 0.9, 1.0), sunGlow * 0.4);
    vec3 shadowAtmo = vec3(0.05, 0.12, 0.30);
    vec3 atmoColor  = mix(shadowAtmo, dayAtmo, sunGlow);
    float alpha = rimPow * 0.7;
    gl_FragColor = vec4(atmoColor, alpha);
  }
`;

const T = {
  day:    "/textures/earth-day.jpg",
  night:  "/textures/earth-night.jpg",
  spec:   "/textures/earth-specular.jpg",
  normal: "/textures/earth-normal.jpg",
  clouds: "/textures/earth-clouds.png",
};

function HeroEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const timeRef  = useRef(0);

  const [dayMap, nightMap, specMap, normalMap, cloudsMap] = useTexture([
    T.day, T.night, T.spec, T.normal, T.clouds,
  ]);

  useMemo(() => {
    [dayMap, nightMap, specMap, normalMap].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; });
    cloudsMap.colorSpace = THREE.NoColorSpace;
    cloudsMap.anisotropy = 8;
  }, [dayMap, nightMap, specMap, normalMap, cloudsMap]);

  const sunDirection = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), []);

  const earthUniforms = useMemo(() => ({
    uDayMap:       { value: dayMap },
    uNightMap:     { value: nightMap },
    uSpecMap:      { value: specMap },
    uNormalMap:    { value: normalMap },
    uCloudsMap:    { value: cloudsMap },
    uSunDirection: { value: sunDirection },
    uTime:         { value: 0 },
  }), [dayMap, nightMap, specMap, normalMap, cloudsMap, sunDirection]);

  const atmoUniforms = useMemo(() => ({ uSunDirection: { value: sunDirection } }), [sunDirection]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (earthUniforms.uTime) earthUniforms.uTime.value = timeRef.current * 0.5;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.035;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.0, 96, 96]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} uniforms={earthUniforms} />
      </mesh>

      <mesh ref={cloudRef} scale={1.006}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.5} alphaMap={cloudsMap} blending={THREE.NormalBlending} depthWrite={false} />
      </mesh>

      {/* Outer atmosphere */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <shaderMaterial vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} uniforms={atmoUniforms} side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Inner rim atmosphere */}
      <mesh scale={1.025}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <shaderMaterial vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} uniforms={atmoUniforms} side={THREE.FrontSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FallbackSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.04; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.0, 32, 32]} />
      <meshPhongMaterial color="#03284E" />
    </mesh>
  );
}

export default function EarthV2() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
      >
        <ambientLight intensity={0.06} color="#1a2a4a" />
        <directionalLight position={[5, 3, 5]} intensity={3.5} color="#FFF5E0" />
        <pointLight position={[-8, -4, -6]} intensity={0.15} color="#203060" />

        <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={0.3} />

        <Suspense fallback={<FallbackSphere />}>
          <HeroEarth />
        </Suspense>
      </Canvas>
    </div>
  );
}
