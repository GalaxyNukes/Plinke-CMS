"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

interface HeroCharacter3DProps {
  modelUrl?: string | null;
  headBoneName?: string;
  cameraDistance?: number;
  cameraHeight?: number;
  modelScale?: number;
  headTrackIntensity?: number;
  modelRotationY?: number;
  /** When true the canvas is full-width; camera pans left so model stays on the right half */
  fullWidthMode?: boolean;
}

export function HeroCharacter3D({
  modelUrl = null,
  headBoneName = "Head",
  cameraDistance = 4.5,
  cameraHeight = 1.0,
  modelScale = 1.0,
  modelRotationY = 0,
  headTrackIntensity = 0.6,
  fullWidthMode = false,
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

    // Proxy Sanity CDN URLs to avoid CORS on production
    const resolvedModelUrl = modelUrl
      ? `/api/proxy-glb?url=${encodeURIComponent(modelUrl)}`
      : null;

    // ── Scene ──
    const scene = new THREE.Scene();
    // In fullWidthMode the canvas spans the full hero. Pan the camera left
    // so the model appears on the right half — matching its original visual position.
    const panX = fullWidthMode ? -2.5 : 0;
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      500
    );
    // Camera positioned properly after model loads (see Step 4 below).
    // These are placeholder values — overwritten once we know the model height.
    camera.position.set(panX, 1, 5);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    // No outputEncoding or toneMapping overrides — three-stdlib GLTFLoader
    // handles colour space internally. Overriding here causes double gamma
    // correction on all browsers, washing textures to white.
    container.appendChild(renderer.domElement);

    // ── Lighting — generous to handle any model ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xc9fb00, 1.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7b61ff, 0.7);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // Add a hemisphere light for natural fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);

    // ── Environment for PBR materials ──
    // We build a minimal 1x1 RGBE DataTexture as the environment map.
    // This is the safest cross-platform approach — no PMREMGenerator.fromScene()
    // which triggers WebGL errors on many Windows GPU drivers.
    // The actual lighting comes from the directional + ambient lights above;
    // the env map just ensures metallic/roughness channels aren't pure black.
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      // Minimal valid scene: a single mesh so the GPU has geometry to process
      const envGeo  = new THREE.SphereGeometry(1, 4, 4);
      const envMat  = new THREE.MeshBasicMaterial({ color: 0x222233, side: THREE.BackSide });
      const envMesh = new THREE.Mesh(envGeo, envMat);
      const envScene = new THREE.Scene();
      envScene.add(envMesh);
      // Add colour accents so PBR materials pick up the brand palette
      const el1 = new THREE.DirectionalLight(0xc9fb00, 1.5); el1.position.set(1, 1, 1);   envScene.add(el1);
      const el2 = new THREE.DirectionalLight(0x7b61ff, 1.0); el2.position.set(-1, 0.5, -1); envScene.add(el2);
      envScene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const envTex = pmrem.fromScene(envScene).texture;
      scene.environment = envTex;
      pmrem.dispose();
      envGeo.dispose();
      envMat.dispose();
    } catch (_envErr) {
      // If PMREM fails on this GPU, proceed without env map —
      // the directional lights alone are still enough to show the model.
      console.warn("[3D] PMREM env generation failed, using lights only");
    }

    // ── Load Model or Build Placeholder ──
    if (resolvedModelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        resolvedModelUrl,
        (gltf: any) => {
          const model = gltf.scene;

          // Step 1: Measure the raw model
          const rawBox = new THREE.Box3().setFromObject(model);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const rawCenter = rawBox.getCenter(new THREE.Vector3());

          console.log("[3D] Model loaded successfully");
          console.log("[3D] Raw size:", rawSize.x.toFixed(2), rawSize.y.toFixed(2), rawSize.z.toFixed(2));
          console.log("[3D] Raw center:", rawCenter.x.toFixed(2), rawCenter.y.toFixed(2), rawCenter.z.toFixed(2));

          // Step 2: Auto-scale to fit a reasonable size (target ~3 units tall)
          const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
          const targetSize = 3.0;
          const autoScale = maxDim > 0 ? (targetSize / maxDim) * modelScale : modelScale;
          model.scale.setScalar(autoScale);

          console.log("[3D] Auto-scale:", autoScale.toFixed(4), "(modelScale:", modelScale, ")");

          // Step 3: Re-measure after scaling and center the model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Center horizontally + depth, keep feet on the ground
          model.position.x = -center.x;
          model.position.z = -center.z;
          model.position.y = -box.min.y; // feet on ground (y=0)
          model.rotation.y = (modelRotationY * Math.PI) / 180; // degrees → radians

          console.log("[3D] Final size:", size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));

          // Step 4: Position camera to frame the model.
          // cameraHeight is a 0–2 multiplier: 1.0 = default mid-body framing,
          // 0.0 = ground level, 2.0 = above the head.
          // cameraDistance controls zoom — smaller = closer.
          const modelHeight = size.y;
          const baseHeight   = modelHeight * 0.45;            // default eye level
          const heightOffset = modelHeight * (cameraHeight - 1.0) * 0.5; // shift up/down
          const camY         = baseHeight + heightOffset;
          const camZ         = modelHeight * 1.5 * (cameraDistance / 4.5);
          camera.position.set(panX, camY, camZ);
          camera.lookAt(0, camY * 0.85, 0);

          console.log("[3D] Camera at:", camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2), "| height multiplier:", cameraHeight, "| distance:", cameraDistance);

          scene.add(model);

          // Step 5: Fix materials
          // GLTFLoader (three-stdlib) already sets correct texture encodings
          // when it parses the file — do NOT re-set them here or you get
          // double gamma-correction which washes everything to flat white.
          // We only fix genuinely broken edge cases: invisible transparency
          // and missing double-sided flag.
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
              child.frustumCulled = false;

              if (child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any) => {
                  // Fix accidentally invisible materials (opacity near 0)
                  if (mat.transparent && mat.opacity < 0.1) {
                    mat.transparent = false;
                    mat.opacity = 1;
                  }
                  // Double-sided prevents blank faces from inverted normals
                  mat.side = THREE.DoubleSide;
                  mat.needsUpdate = true;
                });
              }
            }
          });

          // Step 6: Find head bone
          model.traverse((child: any) => {
            if (child.isBone && child.name === headBoneName) {
              headBone = child;
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

          // Log all bones for debugging
          const boneNames: string[] = [];
          model.traverse((c: any) => {
            if (c.isBone) boneNames.push(c.name);
          });
          console.log("[3D] Head bone:", headBone ? headBone.name : "NOT FOUND");
          console.log("[3D] All bones:", boneNames);

          // Log all meshes
          const meshNames: string[] = [];
          model.traverse((c: any) => {
            if (c.isMesh) meshNames.push(c.name || "(unnamed mesh)");
          });
          console.log("[3D] Meshes:", meshNames);

          // Step 7: Play idle animation
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            let idleClip = gltf.animations[0];
            for (const clip of gltf.animations) {
              if (clip.name.toLowerCase().includes("idle")) {
                idleClip = clip;
                break;
              }
            }
            const action = mixer.clipAction(idleClip);
            action.play();
            console.log("[3D] Playing animation:", idleClip.name, "(" + gltf.animations.length + " total)");
          } else {
            console.log("[3D] No animations found in file");
          }

          setLoading(false);
        },
        (progress: any) => {
          if (progress.total > 0) {
            console.log("[3D] Loading:", Math.round((progress.loaded / progress.total) * 100) + "%");
          }
        },
        (err: any) => {
          console.error("[3D] Failed to load model:", err);
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
    // Use the FULL WINDOW as reference space — the standard approach for
    // "eyes follow cursor" effects. Cursor at center of window → (0,0) →
    // head looks straight. No container offsets, no projection needed.
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseRef.current.x =  (t.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -((t.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // ── Animation Loop ──
    const clock = new THREE.Clock();

    // Persistent quaternions — only cursorOffset needs to accumulate across frames.
    // parentWorldQuat + localTarget are reused each frame to avoid GC pressure.
    const cursorOffset   = new THREE.Quaternion(); // smoothly chases target
    const localTarget    = new THREE.Quaternion(); // target in bone-local space
    const worldOffset    = new THREE.Quaternion(); // desired rotation in world space
    const parentWorldQuat = new THREE.Quaternion();
    const lookAtEuler    = new THREE.Euler();

    function animate() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (mixer) mixer.update(delta);

      if (headBone) {
        if (mixer) {
          // Force-recalculate ALL world matrices after mixer.update() writes
          // local transforms. Must use force=true so stale parent matrices
          // from the previous frame don't corrupt the bone-local conversion,
          // which caused a periodic twitch every time the parent chain drifted.
          scene.updateMatrixWorld(true);

          // Snapshot animated pose AFTER world matrices are current.
          const animPose = headBone.quaternion.clone();

          // ── Clamp cursor to [-1, 1] ──
          const cx = Math.max(-1, Math.min(1, mouseRef.current.x));
          const cy = Math.max(-1, Math.min(1, mouseRef.current.y));

          // ── Build target rotation in WORLD space ──
          const maxRotY = 0.65 * headTrackIntensity;
          const maxRotX = 0.50 * headTrackIntensity;
          lookAtEuler.set(
            -cy * maxRotX,
             cx * maxRotY,
            0,
            "YXZ"
          );
          worldOffset.setFromEuler(lookAtEuler);

          // ── Convert world-space rotation to bone-local space ──
          // localOffset = P^-1 * worldOffset * P  (P = parent world quaternion)
          if (headBone.parent) {
            headBone.parent.getWorldQuaternion(parentWorldQuat);
          } else {
            parentWorldQuat.identity();
          }
          localTarget
            .copy(parentWorldQuat).invert()
            .multiply(worldOffset)
            .multiply(parentWorldQuat);

          // ── Smooth chase — persists across frames ──
          cursorOffset.slerp(localTarget, 0.12);

          // ── Final pose: anim base * local cursor offset ──
          headBone.quaternion.copy(animPose).multiply(cursorOffset);

        } else {
          // Placeholder robot — no parent chain complexity, apply directly
          const cx = Math.max(-1, Math.min(1, mouseRef.current.x));
          const cy = Math.max(-1, Math.min(1, mouseRef.current.y));
          lookAtEuler.set(-cy * 0.50 * headTrackIntensity, cx * 0.65 * headTrackIntensity, 0, "YXZ");
          worldOffset.setFromEuler(lookAtEuler);
          cursorOffset.slerp(worldOffset, 0.10);
          headBone.position.y = 0.3 + Math.sin(elapsed * 1.2) * 0.08;
          headBone.quaternion.copy(cursorOffset);
        }
      }

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
  }, [modelUrl, headBoneName, cameraDistance, cameraHeight, modelScale, modelRotationY, headTrackIntensity, fullWidthMode]);

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
