"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroCharacter3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    head: THREE.Group;
    eyeLeft: THREE.Mesh;
    eyeRight: THREE.Mesh;
    particles: THREE.Points;
    animId: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene Setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xc9fb00, 0.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7b61ff, 0.5);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // ── Materials ──
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.7,
      roughness: 0.3,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xc9fb00,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0xc9fb00,
      emissiveIntensity: 0.3,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x7b61ff,
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0x7b61ff,
      emissiveIntensity: 0.5,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e18,
      metalness: 0.6,
      roughness: 0.4,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xc9fb00,
      emissive: 0xc9fb00,
      emissiveIntensity: 1.2,
    });

    // ── Head Group ──
    const head = new THREE.Group();

    // Main helmet - rounded box shape using sphere segments
    const helmetGeo = new THREE.SphereGeometry(1, 32, 24);
    helmetGeo.scale(1, 1.1, 1);
    const helmet = new THREE.Mesh(helmetGeo, bodyMat);
    head.add(helmet);

    // Visor - flat front panel
    const visorGeo = new THREE.BoxGeometry(1.4, 0.55, 0.15);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.88);
    visor.rotation.x = -0.05;
    // Round the edges slightly by adding a slightly larger dark frame
    const visorFrameGeo = new THREE.BoxGeometry(1.5, 0.65, 0.1);
    const visorFrame = new THREE.Mesh(visorFrameGeo, darkMat);
    visorFrame.position.set(0, 0.05, 0.85);
    head.add(visorFrame);
    head.add(visor);

    // Eyes (inside visor) - glowing
    const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);

    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.3, 0.07, 0.95);
    head.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.3, 0.07, 0.95);
    head.add(eyeRight);

    // Antenna
    const antennaStalkGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const antennaStalk = new THREE.Mesh(antennaStalkGeo, darkMat);
    antennaStalk.position.set(0, 1.3, 0);
    head.add(antennaStalk);

    const antennaTipGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const antennaTip = new THREE.Mesh(antennaTipGeo, accentMat);
    antennaTip.position.set(0, 1.58, 0);
    head.add(antennaTip);

    // Side panels
    const sidePanelGeo = new THREE.BoxGeometry(0.15, 0.6, 0.6);
    const sidePanelLeft = new THREE.Mesh(sidePanelGeo, darkMat);
    sidePanelLeft.position.set(-1.0, -0.1, 0.1);
    head.add(sidePanelLeft);

    const sidePanelRight = new THREE.Mesh(sidePanelGeo, darkMat);
    sidePanelRight.position.set(1.0, -0.1, 0.1);
    head.add(sidePanelRight);

    // Accent stripes on sides
    const stripeGeo = new THREE.BoxGeometry(0.16, 0.08, 0.62);
    const stripeLeft = new THREE.Mesh(stripeGeo, accentMat);
    stripeLeft.position.set(-1.0, -0.1, 0.1);
    head.add(stripeLeft);

    const stripeRight = new THREE.Mesh(stripeGeo, accentMat);
    stripeRight.position.set(1.0, -0.1, 0.1);
    head.add(stripeRight);

    // Chin / jaw plate
    const chinGeo = new THREE.BoxGeometry(0.8, 0.25, 0.3);
    const chin = new THREE.Mesh(chinGeo, darkMat);
    chin.position.set(0, -0.7, 0.6);
    chin.rotation.x = 0.2;
    head.add(chin);

    // Forehead accent
    const foreheadGeo = new THREE.BoxGeometry(0.5, 0.08, 0.15);
    const forehead = new THREE.Mesh(foreheadGeo, accentMat);
    forehead.position.set(0, 0.55, 0.88);
    head.add(forehead);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 12);
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.set(0, -1.1, 0);
    head.add(neck);

    // Shoulders hint
    const shoulderGeo = new THREE.BoxGeometry(2.2, 0.2, 0.8);
    const shoulders = new THREE.Mesh(shoulderGeo, bodyMat);
    shoulders.position.set(0, -1.4, 0);
    head.add(shoulders);

    // Shoulder accent lights
    const shoulderLightGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const shoulderLightLeft = new THREE.Mesh(shoulderLightGeo, accentMat);
    shoulderLightLeft.position.set(-0.9, -1.35, 0.35);
    head.add(shoulderLightLeft);

    const shoulderLightRight = new THREE.Mesh(shoulderLightGeo, accentMat);
    shoulderLightRight.position.set(0.9, -1.35, 0.35);
    head.add(shoulderLightRight);

    head.position.set(0, 0.3, 0);
    scene.add(head);

    // ── Floating Particles ──
    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      particleSizes[i] = Math.random() * 3 + 1;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc9fb00,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Store refs ──
    sceneRef.current = { renderer, scene, camera, head, eyeLeft, eyeRight, particles, animId: 0 };

    // ── Mouse tracking ──
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ── Touch tracking ──
    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("touchmove", handleTouchMove);

    // ── Animation loop ──
    const clock = new THREE.Clock();
    const targetRotation = new THREE.Euler();
    const currentRotation = new THREE.Euler();

    function animate() {
      const t = clock.getElapsedTime();
      const s = sceneRef.current;
      if (!s) return;

      // Smooth head rotation toward cursor
      const maxRotY = 0.6;
      const maxRotX = 0.35;
      targetRotation.y = mouseRef.current.x * maxRotY;
      targetRotation.x = -mouseRef.current.y * maxRotX;

      // Smooth lerp
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

      s.head.rotation.x = currentRotation.x;
      s.head.rotation.y = currentRotation.y;

      // Idle floating
      s.head.position.y = 0.3 + Math.sin(t * 1.2) * 0.08;

      // Eye glow pulse
      const eyePulse = 0.8 + Math.sin(t * 3) * 0.4;
      (s.eyeLeft.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;
      (s.eyeRight.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;

      // Eye micro-tracking (additional offset toward cursor)
      const eyeOffsetX = mouseRef.current.x * 0.05;
      const eyeOffsetY = mouseRef.current.y * 0.03;
      s.eyeLeft.position.x = -0.3 + eyeOffsetX;
      s.eyeLeft.position.y = 0.07 + eyeOffsetY;
      s.eyeRight.position.x = 0.3 + eyeOffsetX;
      s.eyeRight.position.y = 0.07 + eyeOffsetY;

      // Antenna sway
      const antenna = s.head.children.find(
        (c) => c.position.y > 1.5 && c instanceof THREE.Mesh
      );
      if (antenna) {
        antenna.position.x = Math.sin(t * 2) * 0.02;
      }

      // Particle drift
      const positions = s.particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(t + i) * 0.001;
        positions[i] += Math.cos(t * 0.5 + i) * 0.0005;
      }
      s.particles.geometry.attributes.position.needsUpdate = true;
      s.particles.rotation.y = t * 0.03;

      s.renderer.render(s.scene, s.camera);
      s.animId = requestAnimationFrame(animate);
    }
    animate();

    // ── Resize handler ──
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ──
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.renderer.dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
