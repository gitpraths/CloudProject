"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 220;
const CONNECTION_DIST = 1.6;
const SPEED = 0.0004;
const PARALLAX_STRENGTH = 0.18;

export default function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x09080a, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    // ── Particles ─────────────────────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // Palette: yellow, orange, lime-green warm tones
    const palette = [
      new THREE.Color("#facc15"), // yellow-400
      new THREE.Color("#fb923c"), // orange-400
      new THREE.Color("#fde68a"), // amber-200
      new THREE.Color("#a3e635"), // lime-400
      new THREE.Color("#fef08a"), // yellow-200
      new THREE.Color("#f97316"), // orange-500
      new THREE.Color("#bef264"), // lime-300
    ];

    const spread = 5;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * SPEED;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * SPEED;
      velocities[i * 3 + 2] = 0;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(particleGeo, particleMat);
    scene.add(points);

    // ── Lines (pre-allocated, max possible edges) ─────────────────────────
    const maxEdges = PARTICLE_COUNT * PARTICLE_COUNT;
    const linePositions = new Float32Array(maxEdges * 6); // 2 verts × 3 floats
    const lineColors = new Float32Array(maxEdges * 6);
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    const lineColAttr = new THREE.BufferAttribute(lineColors, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineColAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", linePosAttr);
    lineGeo.setAttribute("color", lineColAttr);
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // ── Mouse ─────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", onMouseMove);

    // ── Animation Loop ────────────────────────────────────────────────────
    let animId: number;

    const halfW = spread;
    const halfH = spread * 0.5;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Move particles + wrap at borders
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 0] += velocities[i * 3 + 0];
        positions[i * 3 + 1] += velocities[i * 3 + 1];

        if (positions[i * 3 + 0] > halfW) positions[i * 3 + 0] = -halfW;
        if (positions[i * 3 + 0] < -halfW) positions[i * 3 + 0] = halfW;
        if (positions[i * 3 + 1] > halfH) positions[i * 3 + 1] = -halfH;
        if (positions[i * 3 + 1] < -halfH) positions[i * 3 + 1] = halfH;
      }
      (particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Build line segments for nearby pairs
      let edgeIdx = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ax = positions[i * 3];
        const ay = positions[i * 3 + 1];
        const az = positions[i * 3 + 2];
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = ax - positions[j * 3];
          const dy = ay - positions[j * 3 + 1];
          const dz = az - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.55;
            const base = edgeIdx * 6;

            // vertex A
            linePositions[base + 0] = ax;
            linePositions[base + 1] = ay;
            linePositions[base + 2] = az;
            // vertex B
            linePositions[base + 3] = positions[j * 3];
            linePositions[base + 4] = positions[j * 3 + 1];
            linePositions[base + 5] = positions[j * 3 + 2];

            // Color: blend of both particle colors × alpha
            const rA = colors[i * 3], gA = colors[i * 3 + 1], bA = colors[i * 3 + 2];
            const rB = colors[j * 3], gB = colors[j * 3 + 1], bB = colors[j * 3 + 2];
            lineColors[base + 0] = rA * alpha;
            lineColors[base + 1] = gA * alpha;
            lineColors[base + 2] = bA * alpha;
            lineColors[base + 3] = rB * alpha;
            lineColors[base + 4] = gB * alpha;
            lineColors[base + 5] = bB * alpha;

            edgeIdx++;
          }
        }
      }

      linePosAttr.needsUpdate = true;
      lineColAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, edgeIdx * 2);

      // Parallax: gently offset camera
      camera.position.x +=
        (mouseRef.current.x * PARALLAX_STRENGTH - camera.position.x) * 0.04;
      camera.position.y +=
        (mouseRef.current.y * PARALLAX_STRENGTH * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      style={{ zIndex: 0, background: "#09080a" }}
    />
  );
}
