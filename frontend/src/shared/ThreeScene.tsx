"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function FloatingCube() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation.x += delta * 0.25;
    mesh.rotation.y += delta * 0.35;

    const targetX = mouse.y * 0.35;
    const targetY = mouse.x * 0.55;
    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetX, 0.05);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetY, 0.05);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.7}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#22d3ee"
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
    </Float>
  );
}

export function ThreeScene() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_80px_rgba(34,211,238,0.10)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10" />
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 4, 6]} intensity={1.0} />
        <FloatingCube />
        <Sparkles count={70} size={1.6} speed={0.35} opacity={0.7} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

