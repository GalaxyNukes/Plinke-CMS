"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore — Three.js example imports
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface HeroCharacter3DProps {
  modelUrl?: string | null;
  headBoneName?: string;
  cameraDistance?: number;
  cameraHeight?: number;
  modelScale?: number;
  headTrackIntensity?: number;
}

export function HeroCharacter3D({
  modelUrl = null,
  headBoneName = "Head",
  cameraDistance = 4.5,
  cameraHeight = 1.0,
  modelScale = 1.0,
  headTrackIntensity = 0.6,
}: HeroCharacter3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [loading, setLoading] = useState(!!modelUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId = 0;
    let mixer: THREE.AnimationMixer | null = null;
    let headBone: THREE.Bone | null = null;

    // ── Scene ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, cameraHeight, cameraDistance);
    camera.lookAt(0, cameraHeight * 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xc9fb00, 0.9);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7b61ff, 0.6);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // ── Floating Particles ──
    const particleCount = 50;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0xc9fb00,
      size: 0.04,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Load Model or Build Placeholder ──
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf: any) => {
          const model = gltf.scene;
          model.scale.setScalar(modelScale);

          // Center the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += (box.max.y - box.min.y) * 0.05; // slight upward nudge

          scene.add(model);

          // Find head bone
          model.traverse((child: any) => {
            if (child.isBone && child.name === headBoneName) {
              headBone = child;
            }
            // Enable shadows on meshes
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          if (!headBone) {
            // Try partial match
            model.traverse((child: any) => {
              if (
                child.isBone &&
                child.name.toLowerCase().includes("head") &&
                !child.name.toLowerCase().includes("headtop")
              ) {
                headBone = child;
              }
            });
          }

          if (!headBone) {
            console.warn(
              `Head bone "${headBoneName}" not found. Available bones:`,
              (() => {
                const names: string[] = [];
                model.traverse((c: any) => {
                  if (c.isBone) names.push(c.name);
                });
                return names;
              })()
            );
          }

          // Play idle animation
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            // Use the first animation as idle, or find one named "idle"
            let idleClip = gltf.animations[0];
            for (const clip of gltf.animations) {
              if (clip.name.toLowerCase().includes("idle")) {
                idleClip = clip;
                break;
              }
            }
            const action = mixer.clipAction(idleClip);
            action.play();
          }

          setLoading(false);
        },
        undefined,
        (err: any) => {
          console.error("Failed to load 3D model:", err);
          setError("Failed to load 3D model");
          setLoading(false);
        }
      );
    } else {
      // ── Built-in placeholder robot ──
      const placeholderHead = buildPlaceholderRobot(scene);
      // Use the head group directly for tracking
      headBone = placeholderHead as any;
      setLoading(false);
    }

    // ── Mouse / Touch tracking ──
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y =
        -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      mouseRef.current.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // ── Animation Loop ──
    const clock = new THREE.Clock();
    const headTargetQuat = new THREE.Quaternion();
    const lookAtEuler = new THREE.Euler();

    function animate() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update idle animation
      if (mixer) {
        mixer.update(delta);
      }

      // Head tracking — applied AFTER the animation mixer updates
      if (headBone) {
        // Calculate look-at rotation from cursor
        const maxRotY = 0.5 * headTrackIntensity;
        const maxRotX = 0.3 * headTrackIntensity;
        lookAtEuler.set(
          -mouseRef.current.y * maxRotX,
          mouseRef.current.x * maxRotY,
          0,
          "XYZ"
        );
        headTargetQuat.setFromEuler(lookAtEuler);

        if (mixer) {
          // GLB model: apply cursor rotation ON TOP of the idle animation
          const currentAnimQuat = headBone.quaternion.clone();
          currentAnimQuat.multiply(headTargetQuat);
          headBone.quaternion.slerp(currentAnimQuat, 0.08);
        } else {
          // Placeholder robot: apply rotation directly with idle float
          headBone.position.y = 0.3 + Math.sin(elapsed * 1.2) * 0.08;
          headBone.quaternion.slerp(headTargetQuat, 0.06);
        }
      }

      // Particle drift
      const positions = particles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed + i) * 0.0008;
        positions[i] += Math.cos(elapsed * 0.5 + i) * 0.0004;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }
    animate();

    // ── Resize ──
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ──
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, headBoneName, cameraDistance, cameraHeight, modelScale, headTrackIntensity]);

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ minHeight: "400px" }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <span className="text-white/30 text-xs">Loading 3D model...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <p className="text-white/30 text-xs">
              Check console for details. Make sure the file is a valid .glb
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Built-in placeholder robot — used when no custom model is uploaded.
 */
function buildPlaceholderRobot(scene: THREE.Scene) {
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

  const head = new THREE.Group();
  head.userData.isPlaceholderHead = true;

  const helmetGeo = new THREE.SphereGeometry(1, 32, 24);
  helmetGeo.scale(1, 1.1, 1);
  head.add(new THREE.Mesh(helmetGeo, bodyMat));

  const visorFrameGeo = new THREE.BoxGeometry(1.5, 0.65, 0.1);
  const visorFrame = new THREE.Mesh(visorFrameGeo, darkMat);
  visorFrame.position.set(0, 0.05, 0.85);
  head.add(visorFrame);

  const visorGeo = new THREE.BoxGeometry(1.4, 0.55, 0.15);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.05, 0.88);
  head.add(visor);

  const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.3, 0.07, 0.95);
  head.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.3, 0.07, 0.95);
  head.add(eyeR);

  const antennaGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
  const antenna = new THREE.Mesh(antennaGeo, darkMat);
  antenna.position.set(0, 1.3, 0);
  head.add(antenna);
  const tipGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const tip = new THREE.Mesh(tipGeo, accentMat);
  tip.position.set(0, 1.58, 0);
  head.add(tip);

  const sidePanelGeo = new THREE.BoxGeometry(0.15, 0.6, 0.6);
  [-1.0, 1.0].forEach((x) => {
    const panel = new THREE.Mesh(sidePanelGeo, darkMat);
    panel.position.set(x, -0.1, 0.1);
    head.add(panel);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.62),
      accentMat
    );
    stripe.position.set(x, -0.1, 0.1);
    head.add(stripe);
  });

  const chinGeo = new THREE.BoxGeometry(0.8, 0.25, 0.3);
  const chin = new THREE.Mesh(chinGeo, darkMat);
  chin.position.set(0, -0.7, 0.6);
  chin.rotation.x = 0.2;
  head.add(chin);

  const foreheadGeo = new THREE.BoxGeometry(0.5, 0.08, 0.15);
  const forehead = new THREE.Mesh(foreheadGeo, accentMat);
  forehead.position.set(0, 0.55, 0.88);
  head.add(forehead);

  const neckGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 12);
  const neck = new THREE.Mesh(neckGeo, bodyMat);
  neck.position.set(0, -1.1, 0);
  head.add(neck);

  const shoulderGeo = new THREE.BoxGeometry(2.2, 0.2, 0.8);
  const shoulders = new THREE.Mesh(shoulderGeo, bodyMat);
  shoulders.position.set(0, -1.4, 0);
  head.add(shoulders);

  [-0.9, 0.9].forEach((x) => {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      accentMat
    );
    light.position.set(x, -1.35, 0.35);
    head.add(light);
  });

  head.position.set(0, 0.3, 0);
  scene.add(head);

  // Placeholder head tracks cursor via the animate loop in parent
  // We'll use a simple approach: traverse scene to find the placeholder group
  return head;
}
