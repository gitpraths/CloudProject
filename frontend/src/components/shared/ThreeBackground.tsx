"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NetworkVisualization({ count = 150, particleSize = 0.08, lineOpacity = 0.2 }: { count?: number; particleSize?: number; lineOpacity?: number }) {
  const groupRef = React.useRef<THREE.Group>(null!);
  const linesRef = React.useRef<THREE.LineSegments>(null!);

  const { positions, linePositions } = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    // Create nodes distributed in 3D space
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 8;
      
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    // Create connections between nearby nodes
    const linePositions: number[] = [];
    const connectionDistance = 6;
    
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < connectionDistance) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    return { positions, linePositions: new Float32Array(linePositions) };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1;
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.3;
      groupRef.current.rotation.y = t * 0.2;
      groupRef.current.rotation.z = Math.cos(t * 0.4) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#d4af37"
          linewidth={0.6}
          transparent
          opacity={lineOpacity}
          fog={false}
        />
      </lineSegments>

      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          sizeAttenuation={true}
          color="#ffd700"
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

interface ParticleBackgroundProps {
  isFixed?: boolean;
  opacity?: number;
  particleCount?: number;
  particleSize?: number;
  lineOpacity?: number;
}

export default function ParticleBackground({ 
  isFixed = false, 
  opacity = 0.35,
  particleCount = 90,
  particleSize = 0.08,
  lineOpacity = 0.2
}: ParticleBackgroundProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const positionClass = isFixed ? "fixed" : "absolute";
  
  // Ensure component only renders on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <div 
      ref={canvasRef}
      className={`${positionClass} inset-0 z-0 pointer-events-none overflow-hidden`}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ opacity, width: "100vw", height: "100vh" }}
      >
        <color attach="background" args={["#0a0a0f"]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#ffd700" intensity={1.5} distance={40} />
        <pointLight position={[-10, -10, -10]} color="#ffb347" intensity={1.2} distance={40} />

        <React.Suspense fallback={null}>
          <NetworkVisualization count={particleCount} particleSize={particleSize} lineOpacity={lineOpacity} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
