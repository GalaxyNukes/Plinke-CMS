"use client";

import { useEffect, useRef } from "react";

export type ParticlePreset = "dots" | "stars" | "sparks" | "constellation" | "none";
export type BgPreset =
  | "dark"
  | "gradient-lime"
  | "gradient-purple"
  | "gradient-warm"
  | "gradient-cool"
  | "gradient-custom";
export type DensityLevel = "low" | "medium" | "high";
export type SpeedLevel = "slow" | "normal" | "fast";

interface HeroBackgroundProps {
  bgPreset?: BgPreset;
  customColor1?: string; // hex from Sanity color picker
  customColor2?: string;
  particlePreset?: ParticlePreset;
  particleColor?: string; // hex
  density?: DensityLevel;
  speed?: SpeedLevel;
  particleOpacity?: number; // 0–1
}

// Density → raw count (desktop). Halved on mobile.
const DENSITY_COUNT: Record<DensityLevel, number> = { low: 22, medium: 44, high: 72 };
const SPEED_VAL: Record<SpeedLevel, number> = { slow: 0.25, normal: 0.55, fast: 1.1 };

// Preset gradients (CSS)
const BG_GRADIENT: Record<BgPreset, string> = {
  dark: "#0e0e10",
  "gradient-lime": "linear-gradient(135deg, #0e0e10 0%, #111f03 100%)",
  "gradient-purple": "linear-gradient(135deg, #0e0e10 0%, #130a22 100%)",
  "gradient-warm": "linear-gradient(135deg, #0e0e10 0%, #1e1008 100%)",
  "gradient-cool": "linear-gradient(135deg, #070d16 0%, #0a1628 100%)",
  "gradient-custom": "#0e0e10", // overridden below
};

function hexToRgbStr(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export function HeroBackground({
  bgPreset = "dark",
  customColor1,
  customColor2,
  particlePreset = "dots",
  particleColor = "#c9fb00",
  density = "medium",
  speed = "normal",
  particleOpacity = 0.35,
}: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve background CSS
  let bgStyle: string;
  if (bgPreset === "gradient-custom" && customColor1 && customColor2) {
    bgStyle = `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 100%)`;
  } else {
    bgStyle = BG_GRADIENT[bgPreset] ?? "#0e0e10";
  }

  useEffect(() => {
    if (particlePreset === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastFrame = 0;
    const TARGET_MS = 1000 / 30; // 30 fps cap — lightweight

    const isMobile = window.innerWidth < 768;
    const baseCount = DENSITY_COUNT[density] ?? 44;
    const count = isMobile ? Math.ceil(baseCount * 0.5) : baseCount;
    const spd = SPEED_VAL[speed] ?? 0.55;
    const pColor = particleColor?.startsWith("#") ? particleColor : "#c9fb00";
    const rgb = hexToRgbStr(pColor);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      phase: number; // for twinkle
      life: number; // for sparks
      maxLife: number;
    }

    let W = 0,
      H = 0;
    let particles: Particle[] = [];

    function mkParticle(forceX?: number, forceY?: number): Particle {
      return {
        x: forceX ?? Math.random() * W,
        y: forceY ?? Math.random() * H,
        vx: (Math.random() - 0.5) * spd * 0.5,
        vy: (Math.random() - 0.5) * spd * 0.5,
        size:
          particlePreset === "stars"
            ? Math.random() * 1.8 + 0.5
            : particlePreset === "constellation"
            ? Math.random() * 1.4 + 1.2
            : Math.random() * 1.4 + 1.0,
        phase: Math.random() * Math.PI * 2,
        life: Math.random() * 80,
        maxLife: 70 + Math.random() * 60,
      };
    }

    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      particles = Array.from({ length: count }, () => mkParticle());
    }

    resize();
    window.addEventListener("resize", resize);

    // Pause when tab is hidden — saves CPU
    let visible = !document.hidden;
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (!visible || now - lastFrame < TARGET_MS || !ctx) return;
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;

      // ── Constellation lines ──
      if (particlePreset === "constellation") {
        ctx.lineWidth = 0.4;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              const a = (1 - d / 110) * particleOpacity * 0.35;
              ctx.strokeStyle = `rgba(${rgb},${a})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      for (const p of particles) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -12) p.x = W + 12;
        else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12;
        else if (p.y > H + 12) p.y = -12;

        if (particlePreset === "sparks") {
          // Animated streak — fades in/out over its lifetime
          p.life = (p.life + 1) % p.maxLife;
          const lt = p.life / p.maxLife;
          const a = particleOpacity * Math.sin(lt * Math.PI) * 0.9;
          if (a < 0.01) continue;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = `rgba(${rgb},1)`;
          ctx.lineWidth = p.size * 0.7;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 10, p.y - p.vy * 10);
          ctx.stroke();
          ctx.restore();
          continue;
        }

        // Stars twinkle, everything else is steady
        const alpha =
          particlePreset === "stars"
            ? particleOpacity * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + p.phase)))
            : particleOpacity * (0.6 + 0.4 * p.phase); // subtle variation via phase

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [particlePreset, particleColor, density, speed, particleOpacity]);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ background: bgStyle, willChange: "transform" }}
    >
      {particlePreset !== "none" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none", willChange: "transform" }}
        />
      )}
    </div>
  );
}
