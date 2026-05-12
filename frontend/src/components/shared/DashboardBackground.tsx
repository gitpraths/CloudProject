"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  pulsePhase?: number;
  shouldPulse: boolean;
  pulseDuration: number;
}

interface FocalPoint {
  position: THREE.Vector3;
  drift: THREE.Vector3;
}

function DashboardParticles({ count = 80 }: { count?: number }) {
  const groupRef = React.useRef<THREE.Group>(null!);
  const pointsRef = React.useRef<THREE.Points>(null!);
  const linesRef = React.useRef<THREE.LineSegments>(null!);
  const particlesRef = React.useRef<Particle[]>([]);
  const focalPointsRef = React.useRef<FocalPoint[]>([]);

  // Initialize focal points and particles
  React.useMemo(() => {
    // Create 4 focal points that drift slowly
    focalPointsRef.current = [
      { position: new THREE.Vector3(-5, 5, 0), drift: new THREE.Vector3(0.002, 0.001, 0) },
      { position: new THREE.Vector3(5, 5, -3), drift: new THREE.Vector3(-0.003, 0.0015, 0.001) },
      { position: new THREE.Vector3(-3, -4, 2), drift: new THREE.Vector3(0.0015, -0.002, 0) },
      { position: new THREE.Vector3(4, -3, -2), drift: new THREE.Vector3(-0.002, 0.001, -0.0015) }
    ];

    // Create particles clustered around focal points
    particlesRef.current = [];
    const particlesPerFocus = Math.floor(count / 4);

    for (let f = 0; f < focalPointsRef.current.length; f++) {
      const focal = focalPointsRef.current[f];
      for (let i = 0; i < particlesPerFocus; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 4;
        const height = (Math.random() - 0.5) * 3;

        const particle: Particle = {
          position: new THREE.Vector3(
            focal.position.x + Math.cos(angle) * distance,
            focal.position.y + height,
            focal.position.z + Math.sin(angle) * distance
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.01
          ),
          size: [0.08, 0.12, 0.2][Math.floor(Math.random() * 3)],
          shouldPulse: Math.random() < 0.1, // 10% of particles pulse
          pulseDuration: 2000 + Math.random() * 3000, // 2-5 seconds
          pulsePhase: Math.random() * Math.PI * 2
        };
        particlesRef.current.push(particle);
      }
    }
  }, [count]);

  // Update particle positions and visibility
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const particles = particlesRef.current;
    const focalPoints = focalPointsRef.current;

    // Update focal points (drift)
    focalPoints.forEach((focal) => {
      focal.position.x += focal.drift.x;
      focal.position.y += focal.drift.y;
      focal.position.z += focal.drift.z;

      // Keep within bounds
      focal.position.x = Math.max(-8, Math.min(8, focal.position.x));
      focal.position.y = Math.max(-6, Math.min(6, focal.position.y));
      focal.position.z = Math.max(-5, Math.min(5, focal.position.z));
    });

    // Update particles
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);

    particles.forEach((particle, i) => {
      // Directional flow: particles drift left-to-right
      particle.velocity.x = 0.008 + (Math.random() - 0.5) * 0.002;

      particle.position.add(particle.velocity);

      // Wrap around if particle goes too far right
      if (particle.position.x > 15) {
        particle.position.x = -15;
      }

      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      // Color: mostly gold, some blue
      const isBlue = Math.random() < 0.15;
      if (isBlue) {
        colors[i * 3] = 0.39; // 100/255
        colors[i * 3 + 1] = 0.71; // 180/255
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.78; // 200/255 (gold)
        colors[i * 3 + 1] = 0.66; // 168/255
        colors[i * 3 + 2] = 0.3; // 75/255
      }
    });

    if (pointsRef.current && pointsRef.current.geometry) {
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

      posAttr.array = positions;
      posAttr.needsUpdate = true;

      colAttr.array = colors;
      colAttr.needsUpdate = true;
    }

    // Generate connection lines (distance-based with opacity)
    const linePositions: number[] = [];
    const connectionDistance = 12; // 120px equivalent

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].position.x - particles[j].position.x;
        const dy = particles[i].position.y - particles[j].position.y;
        const dz = particles[i].position.z - particles[j].position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          linePositions.push(
            particles[i].position.x,
            particles[i].position.y,
            particles[i].position.z,
            particles[j].position.x,
            particles[j].position.y,
            particles[j].position.z
          );
        }
      }
    }

    if (linesRef.current && linesRef.current.geometry) {
      linesRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      );
    }

    // Handle pulsing particles
    if (pointsRef.current && pointsRef.current.geometry.attributes.opacity) {
      const opacityAttr = pointsRef.current.geometry.attributes.opacity as THREE.BufferAttribute;
      const opacities = opacityAttr.array as Float32Array;

      particles.forEach((particle, i) => {
        if (particle.shouldPulse) {
          const phase = (t * 1000) % particle.pulseDuration;
          const progress = phase / particle.pulseDuration;
          const pulse = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // 0 to 1
          opacities[i] = 0.3 + pulse * 0.7; // 0.3 to 1.0
        } else {
          opacities[i] = 0.6;
        }
      });
      opacityAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(0)}
            count={0}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#c8a84b"
          transparent
          opacity={0.15}
          fog={false}
          linewidth={0.5}
        />
      </lineSegments>

      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(particlesRef.current.length * 3)}
            count={particlesRef.current.length}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={new Float32Array(particlesRef.current.length * 3)}
            count={particlesRef.current.length}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-opacity"
            array={new Float32Array(particlesRef.current.length).fill(0.6)}
            count={particlesRef.current.length}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          sizeAttenuation={true}
          vertexColors
          transparent
          depthWrite={false}
          fog={false}
        />
      </points>
    </group>
  );
}

export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ opacity: 0.4, width: "100vw", height: "100vh" }}
      >
        <color attach="background" args={["#0a0a0f"]} />

        <ambientLight intensity={0.2} />
        <pointLight position={[8, 8, 8]} color="#c8a84b" intensity={0.8} distance={30} />
        <pointLight position={[-8, -8, -8]} color="rgba(100, 180, 255, 0.4)" intensity={0.6} distance={30} />

        <React.Suspense fallback={null}>
          <DashboardParticles count={80} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
