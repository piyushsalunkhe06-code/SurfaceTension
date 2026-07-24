"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Production NASA / Google Earth Style Shader for Hero Earth ────────────────

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

    vec2 waveUv1 = vUv + vec2(uTime * 0.0015, uTime * 0.0008);
    vec2 waveUv2 = vUv - vec2(uTime * 0.0010, uTime * 0.0018);
    vec3 norm1 = texture2D(uNormalMap, waveUv1).rgb * 2.0 - 1.0;
    vec3 norm2 = texture2D(uNormalMap, waveUv2).rgb * 2.0 - 1.0;
    vec3 animatedWaveNorm = normalize(norm1 + norm2);

    vec3 pertNormal = normalize(vNormal + animatedWaveNorm * (specMask.r > 0.2 ? 0.15 : 0.06));

    vec3 sunDir = normalize(uSunDirection);
    float sunDot = dot(pertNormal, sunDir);

    float dayFactor = smoothstep(-0.18, 0.22, sunDot);

    float twilight = smoothstep(-0.22, 0.02, sunDot) * (1.0 - smoothstep(0.02, 0.30, sunDot));
    vec3 twilightColor = vec3(1.0, 0.48, 0.18) * 0.28 * twilight;

    vec3 ambientLight = vec3(0.035, 0.038, 0.045);
    float diffuse = max(sunDot, 0.0);

    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 halfVec = normalize(sunDir + viewDir);
    float specAngle = max(dot(pertNormal, halfVec), 0.0);
    float fresnel = pow(1.0 - max(dot(viewDir, pertNormal), 0.0), 4.0);
    float specular = (pow(specAngle, 140.0) + fresnel * 0.12) * specMask.r * 0.35 * dayFactor;

    vec3 dayFinal = dayColor.rgb * (ambientLight + diffuse * vec3(1.14, 1.11, 1.06)) + vec3(specular) + twilightColor;
    vec3 nightFinal = nightColor.rgb * 1.30;

    vec3 earthColor = mix(nightFinal, dayFinal, dayFactor);

    float luma = dot(earthColor, vec3(0.2126, 0.7152, 0.0722));
    earthColor = mix(vec3(luma), earthColor, 0.90);

    vec4 cloudSample = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.002, vUv.y));
    float cloudDensity = cloudSample.r * 0.20;

    vec4 shadowSample = texture2D(uCloudsMap, vec2(vUv.x + uTime * 0.002 - 0.002, vUv.y - 0.0015));
    float shadowFactor = 1.0 - (shadowSample.r * 0.15 * dayFactor);
    earthColor *= shadowFactor;

    vec3 cloudLit = vec3(diffuse * 1.08 + 0.03);
    earthColor = mix(earthColor, cloudLit, cloudDensity * (0.35 + 0.65 * dayFactor));

    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float rimPow = pow(rim, 6.5);
    vec3 atmosphereRim = vec3(0.28, 0.62, 1.0) * rimPow * 0.08 * dayFactor;
    earthColor += atmosphereRim;

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
    float rimPow  = pow(rim, 6.8);

    float sunDot  = dot(normalize(vNormal), normalize(uSunDirection));
    float sunGlow = smoothstep(-0.30, 0.70, sunDot);

    vec3 atmoColor = mix(vec3(0.25, 0.58, 0.95), vec3(0.65, 0.85, 1.0), sunGlow * 0.35);
    float alpha    = rimPow * 0.25 * max(sunGlow, 0.02);
    gl_FragColor   = vec4(atmoColor, alpha);
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
    if (earthUniforms.uTime) earthUniforms.uTime.value = timeRef.current;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.025;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.0, 96, 96]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} uniforms={earthUniforms} />
      </mesh>

      <mesh ref={cloudRef} scale={1.004}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.20} alphaMap={cloudsMap} blending={THREE.NormalBlending} depthWrite={false} />
      </mesh>

      <mesh scale={1.04}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <shaderMaterial vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} uniforms={atmoUniforms} side={THREE.BackSide} transparent blending={THREE.NormalBlending} depthWrite={false} />
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
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
      >
        <ambientLight intensity={0.12} color="#142036" />
        <hemisphereLight args={["#d6e8ff", "#050a14", 0.4]} />
        <directionalLight position={[5, 3, 5]} intensity={2.4} color="#ffffff" />

        <Stars radius={90} depth={40} count={1500} factor={3} saturation={0} fade speed={0} />

        <Suspense fallback={<FallbackSphere />}>
          <HeroEarth />
        </Suspense>
      </Canvas>
    </div>
  );
}
