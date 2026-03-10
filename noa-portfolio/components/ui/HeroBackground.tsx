"use client";

import { useEffect, useRef } from "react";

export type ParticlePreset =
  | "dots" | "stars" | "sparks" | "constellation"
  | "ribbons" | "orbs" | "dust" | "grid"
  | "none";

export type BgPreset =
  | "dark"
  | "gradient-lime" | "gradient-purple" | "gradient-warm" | "gradient-cool"
  | "gradient-custom"
  | "midnight" | "sunset" | "aurora";

export type DensityLevel = "low" | "medium" | "high";
export type SpeedLevel   = "slow" | "normal" | "fast";

interface HeroBackgroundProps {
  bgPreset?:        BgPreset;
  customColor1?:    string;
  customColor2?:    string;
  particlePreset?:  ParticlePreset;
  particleColor?:   string;
  density?:         DensityLevel;
  speed?:           SpeedLevel;
  particleOpacity?: number;
}

const DENSITY_COUNT: Record<DensityLevel, number> = { low: 22, medium: 44, high: 72 };
const SPEED_VAL:     Record<SpeedLevel,   number> = { slow: 0.25, normal: 0.55, fast: 1.1 };

// Ribbon count per density (fewer = more dramatic)
const RIBBON_COUNT: Record<DensityLevel, number> = { low: 2, medium: 3, high: 5 };
// Orb count per density
const ORB_COUNT:    Record<DensityLevel, number> = { low: 3, medium: 5, high: 7 };

const BG_GRADIENT: Record<BgPreset, string> = {
  dark:              "#0e0e10",
  "gradient-lime":   "linear-gradient(135deg, #0e0e10 0%, #111f03 100%)",
  "gradient-purple": "linear-gradient(135deg, #0e0e10 0%, #130a22 100%)",
  "gradient-warm":   "linear-gradient(135deg, #0e0e10 0%, #1e1008 100%)",
  "gradient-cool":   "linear-gradient(135deg, #070d16 0%, #0a1628 100%)",
  "gradient-custom": "#0e0e10",
  // New
  midnight: "linear-gradient(160deg, #06060e 0%, #0c0c1e 50%, #08060e 100%)",
  sunset:   "linear-gradient(160deg, #110408 0%, #1c0610 50%, #0e0e10 100%)",
  aurora:   "linear-gradient(160deg, #040d10 0%, #060c12 50%, #05090d 100%)",
};

function hexToRgbStr(hex: string): string {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// Cubic bezier point at parameter t
function cubicBezier(
  t: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
  dx: number, dy: number
): [number, number] {
  const mt = 1 - t, mt2 = mt * mt, t2 = t * t;
  return [
    mt2 * mt * ax + 3 * mt2 * t * bx + 3 * mt * t2 * cx + t2 * t * dx,
    mt2 * mt * ay + 3 * mt2 * t * by + 3 * mt * t2 * cy + t2 * t * dy,
  ];
}

export function HeroBackground({
  bgPreset        = "dark",
  customColor1,
  customColor2,
  particlePreset  = "dots",
  particleColor   = "#c9fb00",
  density         = "medium",
  speed           = "normal",
  particleOpacity = 0.35,
}: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve CSS background
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

    let animId  = 0;
    let lastFrame = 0;
    const TARGET_MS = 1000 / 30; // 30 fps cap
    const TAU = Math.PI * 2;

    const isMobile  = window.innerWidth < 768;
    const baseCount = DENSITY_COUNT[density] ?? 44;
    const count     = isMobile ? Math.ceil(baseCount * 0.5) : baseCount;
    const spd       = SPEED_VAL[speed] ?? 0.55;
    const pColor    = particleColor?.startsWith("#") ? particleColor : "#c9fb00";
    const rgb       = hexToRgbStr(pColor);

    let W = 0, H = 0;

    // ─────────────────────────────────────────────
    // PARTICLE SYSTEM (dots / stars / sparks / constellation / dust)
    // ─────────────────────────────────────────────
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      phase: number;
      life: number; maxLife: number;
    }

    function mkParticle(): Particle {
      const isDust = particlePreset === "dust";
      return {
        x:       Math.random() * W,
        y:       isDust ? H + Math.random() * H * 0.2 : Math.random() * H,
        vx:      isDust ? (Math.random() - 0.5) * 0.3 : (Math.random() - 0.5) * spd * 0.5,
        vy:      isDust ? -(0.12 + Math.random() * 0.35 * spd) : (Math.random() - 0.5) * spd * 0.5,
        size:    isDust
          ? Math.random() * 1.0 + 0.3
          : particlePreset === "stars"
          ? Math.random() * 1.8 + 0.5
          : particlePreset === "constellation"
          ? Math.random() * 1.4 + 1.2
          : Math.random() * 1.4 + 1.0,
        phase:   Math.random() * TAU,
        life:    Math.random() * 80,
        maxLife: 70 + Math.random() * 60,
      };
    }

    let particles: Particle[] = [];

    // ─────────────────────────────────────────────
    // RIBBONS — inspired by Stacks.co flowing light beams
    // ─────────────────────────────────────────────
    interface Ribbon {
      // Control points in 0–1 normalised canvas space
      ax: number; ay: number;
      bx: number; by: number;
      cx: number; cy: number;
      dx: number; dy: number;
      freq: number;
      phase: number;
      ampX: number;
      ampY: number;
      maxWidth: number; // peak width in px
      opacity: number;
    }
    let ribbons: Ribbon[] = [];

    // Preset layouts for a cinematic feel (normalised 0–1 coords)
    // These are arranged so they sweep and curl like the Stacks reference
    const RIBBON_LAYOUTS: [number,number,number,number,number,number,number,number][] = [
      // Wide sweeping arc from bottom-left → top-right
      [-0.1, 0.95,  0.25, 0.05,  0.75, 0.00,  1.2, 0.45],
      // Large curl from right edge (the Stacks "C" shape)
      [ 1.35, 0.25,  0.75, -0.15,  0.55, 0.80,  1.1, 0.85],
      // Diagonal accent
      [ 0.15, -0.1,  0.85, 0.25,  0.25, 0.75,  0.95, 1.1],
      // Gentle sweep across upper half
      [-0.2, 0.15,   0.45, -0.2,  0.90, 0.35,  1.3, 0.10],
      // Tight inner curl
      [ 0.45, 1.2,   0.50, 0.35,  0.70, 0.65,  0.55, -0.1],
    ];

    function buildRibbons() {
      const n = RIBBON_COUNT[density] ?? 3;
      ribbons = RIBBON_LAYOUTS.slice(0, n).map((l, i) => ({
        ax: l[0], ay: l[1], bx: l[2], by: l[3],
        cx: l[4], cy: l[5], dx: l[6], dy: l[7],
        freq:     0.07 + i * 0.025,
        phase:    (i / n) * TAU,
        ampX:     0.07 + (i % 2) * 0.04,
        ampY:     0.05 + (i % 3) * 0.025,
        maxWidth: isMobile ? 140 : 280,
        opacity:  0.65 + (i % 3) * 0.12,
      }));
    }

    // ─────────────────────────────────────────────
    // ORBS — inspired by Vento/aurora gradient blobs
    // ─────────────────────────────────────────────
    interface Orb {
      baseX: number; baseY: number;
      r: number;
      freq: number; phase: number;
      ampX: number; ampY: number;
      rgb: string;
      alpha: number;
    }
    let orbs: Orb[] = [];

    // Use a rich multi-color palette for aurora feel
    // Main accent + fixed complement colors from the brand palette
    const ORB_PALETTE = [
      rgb,                       // site accent (lime / custom)
      hexToRgbStr("#7b61ff"),    // purple
      hexToRgbStr("#ff6130"),    // orange
      hexToRgbStr("#00c8ff"),    // cyan
      hexToRgbStr("#ff3d9a"),    // pink
      hexToRgbStr("#00e896"),    // mint
      hexToRgbStr("#ffe600"),    // yellow
    ];

    function buildOrbs() {
      const n = ORB_COUNT[density] ?? 5;
      orbs = Array.from({ length: n }, (_, i) => ({
        baseX: (0.1 + (i / n) * 0.8) * W,
        baseY: (0.15 + ((i * 0.37) % 0.7)) * H,
        r:     (isMobile ? 160 : 300) + (i % 3) * 80,
        freq:  0.10 + i * 0.035,
        phase: (i / n) * TAU,
        ampX:  50 + (i % 3) * 55,
        ampY:  35 + (i % 4) * 30,
        rgb:   ORB_PALETTE[i % ORB_PALETTE.length],
        alpha: particleOpacity * (0.10 + (i % 3) * 0.04),
      }));
    }

    // Grid: computed once, cached
    let gridDots: { x: number; y: number; a: number }[] = [];
    function buildGrid() {
      gridDots = [];
      const spacing = 28;
      const maxDist = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2);
      for (let gx = spacing / 2; gx < W; gx += spacing) {
        for (let gy = spacing / 2; gy < H; gy += spacing) {
          const d = Math.sqrt((gx - W / 2) ** 2 + (gy - H / 2) ** 2);
          const a = particleOpacity * (0.12 + 0.55 * Math.max(0, 1 - d / maxDist));
          if (a > 0.02) gridDots.push({ x: gx, y: gy, a });
        }
      }
    }

    // ─────────────────────────────────────────────
    // RESIZE
    // ─────────────────────────────────────────────
    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      // Rebuild collections at new size
      if (["dots","stars","sparks","constellation","dust"].includes(particlePreset)) {
        particles = Array.from({ length: count }, mkParticle);
      }
      if (particlePreset === "ribbons")       buildRibbons();
      if (particlePreset === "orbs")          buildOrbs();
      if (particlePreset === "grid")          buildGrid();
    }

    resize();
    window.addEventListener("resize", resize);

    let visible = !document.hidden;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    // ─────────────────────────────────────────────
    // DRAW — RIBBONS
    // Technique: sample 60 points along each animated bezier.
    // Draw 3 passes (outer glow → mid → core) using filled circles.
    // "screen" composite makes overlapping ribbons bloom brighter
    // — the key to the Stacks volumetric light look.
    // ─────────────────────────────────────────────
    const RIBBON_SAMPLES = 60;
    const RIBBON_PASSES = [
      { widthMult: 1.00, alphaMult: 0.06 },  // outer glow — very diffuse
      { widthMult: 0.42, alphaMult: 0.18 },  // mid halo
      { widthMult: 0.14, alphaMult: 0.65 },  // bright core
    ] as const;

    function drawRibbons(now: number) {
      const t = now / 1000 * spd;
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (const rib of ribbons) {
        const { freq: f, phase: ph, ampX, ampY } = rib;

        // Animate each control point independently for organic motion
        const ax = (rib.ax + Math.sin(t * f         + ph)       * ampX) * W;
        const ay = (rib.ay + Math.cos(t * f * 0.7   + ph)       * ampY) * H;
        const bx = (rib.bx + Math.sin(t * f * 1.3   + ph + 1.0) * ampX) * W;
        const by = (rib.by + Math.cos(t * f         + ph + 1.0) * ampY) * H;
        const cx = (rib.cx + Math.sin(t * f * 0.9   + ph + 2.1) * ampX) * W;
        const cy = (rib.cy + Math.cos(t * f * 1.15  + ph + 2.1) * ampY) * H;
        const dx = (rib.dx + Math.sin(t * f * 1.1   + ph + 3.2) * ampX) * W;
        const dy = (rib.dy + Math.cos(t * f * 0.8   + ph + 3.2) * ampY) * H;

        for (const pass of RIBBON_PASSES) {
          for (let i = 0; i <= RIBBON_SAMPLES; i++) {
            const u = i / RIBBON_SAMPLES;
            // Taper: 0 at both ends, peaks at u=0.5 — smooth bell curve
            const taper = Math.sin(u * Math.PI);
            if (taper < 0.02) continue;

            const [px, py] = cubicBezier(u, ax, ay, bx, by, cx, cy, dx, dy);
            const r = rib.maxWidth * pass.widthMult * taper * 0.5;
            if (r < 0.5) continue;

            const a = rib.opacity * pass.alphaMult * particleOpacity * taper;
            ctx.fillStyle = `rgba(${rgb},${Math.min(1, a)})`;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, TAU);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────
    // DRAW — ORBS
    // Large radial-gradient blobs drifting slowly.
    // "screen" blending gives the aurora / light-leak feel.
    // ─────────────────────────────────────────────
    function drawOrbs(now: number) {
      const t = now / 1000 * spd;
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (const orb of orbs) {
        const x = orb.baseX + Math.sin(t * orb.freq         + orb.phase)       * orb.ampX;
        const y = orb.baseY + Math.cos(t * orb.freq * 0.75  + orb.phase + 1.0) * orb.ampY;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        grad.addColorStop(0,   `rgba(${orb.rgb},${orb.alpha})`);
        grad.addColorStop(0.4, `rgba(${orb.rgb},${orb.alpha * 0.55})`);
        grad.addColorStop(1,   `rgba(${orb.rgb},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, orb.r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────
    // DRAW — GRID
    // Static dot grid, brighter at center, cached for perf
    // ─────────────────────────────────────────────
    let gridDrawn = false;
    function drawGrid() {
      if (gridDrawn) return; // grid is static — draw once per resize
      for (const dot of gridDots) {
        ctx.fillStyle = `rgba(${rgb},${dot.a})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.0, 0, TAU);
        ctx.fill();
      }
      gridDrawn = true;
    }

    // ─────────────────────────────────────────────
    // MAIN DRAW LOOP
    // ─────────────────────────────────────────────
    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (!visible || now - lastFrame < TARGET_MS || !ctx) return;
      lastFrame = now;

      // Grid is static — no clear needed after first draw
      if (particlePreset === "grid") {
        drawGrid();
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;

      if (particlePreset === "ribbons") { drawRibbons(now); return; }
      if (particlePreset === "orbs")    { drawOrbs(now);    return; }

      // ── Constellation lines ──
      if (particlePreset === "constellation") {
        ctx.lineWidth = 0.4;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const ddx = particles[i].x - particles[j].x;
            const ddy = particles[i].y - particles[j].y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);
            if (d < 110) {
              ctx.strokeStyle = `rgba(${rgb},${(1 - d / 110) * particleOpacity * 0.35})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // ── Per-particle update + draw ──
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (particlePreset === "dust") {
          // Gentle sway + float upward, reset when off top
          p.x += Math.sin(t * 0.5 + p.phase) * 0.18;
          if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }

          // Fade in from bottom, fade out at top
          const lifeFrac = 1 - p.y / H;
          const a = particleOpacity * Math.sin(Math.max(0, Math.min(1, lifeFrac)) * Math.PI) * 0.75;
          if (a < 0.01) continue;
          ctx.fillStyle = `rgba(${rgb},${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
          continue;
        }

        // Wrap edges for all non-dust presets
        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;

        if (particlePreset === "sparks") {
          p.life = (p.life + 1) % p.maxLife;
          const lt = p.life / p.maxLife;
          const a  = particleOpacity * Math.sin(lt * Math.PI) * 0.9;
          if (a < 0.01) continue;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = `rgba(${rgb},1)`;
          ctx.lineWidth   = p.size * 0.7;
          ctx.lineCap     = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 10, p.y - p.vy * 10);
          ctx.stroke();
          ctx.restore();
          continue;
        }

        // dots / stars / constellation dots
        const alpha =
          particlePreset === "stars"
            ? particleOpacity * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + p.phase)))
            : particleOpacity * (0.6 + 0.4 * p.phase);

        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
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
