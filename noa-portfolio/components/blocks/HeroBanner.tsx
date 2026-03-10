"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";
import { HeroBackground } from "../ui/HeroBackground";
import { Maximize2 } from "lucide-react";

const HeroCharacter3D = dynamic(
  () => import("../ui/HeroCharacter3D").then((mod) => mod.HeroCharacter3D),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

const TAG_ROTATIONS = [-8, 3, -4, 6, -2, 5, -6, 3, -5, 4];
const TAG_SIZES = [
  "text-sm","text-base","text-sm","text-base","text-xs",
  "text-sm","text-base","text-sm","text-xs","text-base",
];

function getVideoUrl(v: any): string | null {
  if (!v) return null;
  if (v.videoFile?.asset?.url) return v.videoFile.asset.url;
  if (v.embedUrl) return v.embedUrl;
  return null;
}
function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
  return m?.[1] || null;
}
function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m?.[1] || null;
}
function isEmbedUrl(url: string) {
  return url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");
}
function resolveColor(c: any): string | undefined {
  if (!c) return undefined;
  if (typeof c === "string") return c;
  if (c?.hex) return c.hex;
  return undefined;
}

// Scroll-lock helpers
let _savedScrollY = 0;
function lockScroll() {
  _savedScrollY = window.scrollY;
  document.body.style.overflow  = "hidden";
  document.body.style.position  = "fixed";
  document.body.style.top       = `-${_savedScrollY}px`;
  document.body.style.width     = "100%";
}
function unlockScroll() {
  document.body.style.overflow  = "";
  document.body.style.position  = "";
  document.body.style.top       = "";
  document.body.style.width     = "";
  window.scrollTo(0, _savedScrollY);
}

type Phase = "idle" | "expanding" | "expanded";

export function HeroBanner(props: any) {
  const {
    heading = "Animation that hits different",
    subtitle = "",
    heroImage,
    heroVideo,
    heroDisplay = "image",
    heroRightVideo,
    hero3dModel,
    heroBackground,
    heroParticles,
    secondaryThumbnail,
    showPlayBadge = true,
    autoplayVideo = false,
    tags = [],
  } = props;

  const bgPreset     = heroBackground?.preset ?? "dark";
  const customColor1 = resolveColor(heroBackground?.color1);
  const customColor2 = resolveColor(heroBackground?.color2);
  const pPreset      = heroParticles?.preset  ?? "dots";
  const pColor       = resolveColor(heroParticles?.color) ?? "#c9fb00";
  const pDensity     = heroParticles?.density ?? "medium";
  const pSpeed       = heroParticles?.speed   ?? "normal";
  const pOpacity     = heroParticles?.opacity ?? 0.35;

  const videoUrl    = getVideoUrl(heroVideo);
  const hasVideo    = !!videoUrl;
  const isEmbed     = hasVideo && isEmbedUrl(videoUrl!);
  const hasThumb    = hasVideo || !!secondaryThumbnail;

  const [phase, setPhase]     = useState<Phase>("idle");
  const phaseRef              = useRef<Phase>("idle");
  const heroRef               = useRef<HTMLElement>(null);
  // separate refs for small (muted autoplay) vs expanded (with controls)
  const smallVideoRef         = useRef<HTMLVideoElement>(null);
  const expandedVideoRef      = useRef<HTMLVideoElement>(null);

  // Manual fullscreen overlay (separate from scroll expansion)
  const [overlayOpen, setOverlayOpen] = useState(false);
  const overlayVideoRef = useRef<HTMLVideoElement>(null);

  function commitPhase(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }

  // ── Autoplay small thumbnail on mount ──
  useEffect(() => {
    if (!hasVideo || isEmbed) return;
    // Small video autoplays muted as soon as component mounts
    const t = setTimeout(() => {
      smallVideoRef.current?.play().catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [hasVideo, isEmbed]);

  // ── Scroll intercept ──
  useEffect(() => {
    if (!hasThumb) return;

    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return; // hero off-screen

      if (phaseRef.current === "idle" && e.deltaY > 0) {
        e.preventDefault();
        lockScroll();
        commitPhase("expanding");
      } else if (phaseRef.current === "expanding") {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (phaseRef.current === "idle" && dy > 4) {
        e.preventDefault();
        lockScroll();
        commitPhase("expanding");
      } else if (phaseRef.current === "expanding") {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, [hasThumb]);

  // ── Expansion → unlock after transition completes ──
  useEffect(() => {
    if (phase !== "expanding") return;
    const id = setTimeout(() => {
      commitPhase("expanded");
      unlockScroll();
      // Play expanded video (direct files only — iframes autoplay via src param)
      if (!isEmbed) expandedVideoRef.current?.play().catch(() => {});
    }, 700);
    return () => clearTimeout(id);
  }, [phase, isEmbed]);

  // ── Reset when hero fully exits viewport ──
  useEffect(() => {
    if (!hasThumb) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && phaseRef.current !== "idle") {
          commitPhase("idle");
          if (expandedVideoRef.current) {
            expandedVideoRef.current.pause();
            expandedVideoRef.current.currentTime = 0;
          }
          // Resume small autoplay
          setTimeout(() => smallVideoRef.current?.play().catch(() => {}), 50);
        }
      },
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [hasThumb]);

  const openOverlay = useCallback(() => {
    setOverlayOpen(true);
    setTimeout(() => overlayVideoRef.current?.play().catch(() => {}), 100);
  }, []);
  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    if (overlayVideoRef.current) { overlayVideoRef.current.pause(); overlayVideoRef.current.currentTime = 0; }
  }, []);

  const isExpanding = phase === "expanding";
  const isExpanded  = phase === "expanded";
  const thumbActive = isExpanding || isExpanded;

  // Thumbnail poster image URL
  const posterUrl = secondaryThumbnail
    ? urlFor(secondaryThumbnail).width(800).height(450).url()
    : undefined;

  // ── Full-width background video (heroDisplay === "video") ──
  function renderHeroVideo() {
    if (!heroRightVideo) return null;
    const rvUrl = heroRightVideo.videoFile?.asset?.url || heroRightVideo.embedUrl || null;
    if (!rvUrl) return null;
    const rvEmbed = isEmbedUrl(rvUrl);
    const rvAuto  = heroRightVideo.autoplay !== false;
    const rvPoster = heroRightVideo.posterImage
      ? urlFor(heroRightVideo.posterImage).width(1400).height(900).url()
      : undefined;
    if (rvEmbed) {
      const ytId = getYouTubeId(rvUrl);
      const vmId = getVimeoId(rvUrl);
      if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=${rvAuto?1:0}&mute=1&loop=1&playlist=${ytId}&rel=0&controls=0`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" style={{ border:"none" }} />;
      if (vmId) return <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=${rvAuto?1:0}&muted=1&loop=1&background=1`} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" style={{ border:"none" }} />;
    }
    return <video src={rvUrl} className="absolute inset-0 w-full h-full object-cover object-center" autoPlay={rvAuto} muted loop playsInline poster={rvPoster} />;
  }

  // ── Expanded video content ──
  function renderExpandedVideo() {
    if (!videoUrl) return null;
    if (isEmbed) {
      const ytId = getYouTubeId(videoUrl);
      const vmId = getVimeoId(videoUrl);
      if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=${isExpanded?1:0}&mute=0&rel=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border:"none" }} />;
      if (vmId) return <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=${isExpanded?1:0}`} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen style={{ border:"none" }} />;
    }
    return <video ref={expandedVideoRef} src={videoUrl} className="w-full h-full object-cover" controls playsInline loop />;
  }

  return (
    <section
      ref={heroRef}
      id="home"
      className="rounded-card relative overflow-hidden pt-20"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* z-0: Background */}
      <HeroBackground
        bgPreset={bgPreset} customColor1={customColor1} customColor2={customColor2}
        particlePreset={pPreset} particleColor={pColor}
        density={pDensity} speed={pSpeed} particleOpacity={pOpacity}
      />

      {/* z-1: Full-width visual (image / video / 3D) */}
      {heroDisplay === "3d" && (
        <div className="absolute inset-0 z-[1]">
          <HeroCharacter3D
            modelUrl={hero3dModel?.modelFile?.asset?.url || null}
            headBoneName={hero3dModel?.headBoneName || "Head"}
            cameraDistance={hero3dModel?.cameraDistance || 4.5}
            cameraHeight={hero3dModel?.cameraHeight || 1.0}
            modelScale={hero3dModel?.modelScale || 1.0}
            headTrackIntensity={hero3dModel?.headTrackIntensity || 0.6}
            fullWidthMode={true}
          />
        </div>
      )}
      {heroDisplay === "image" && heroImage && (
        <div className="absolute inset-0 z-[1]">
          <Image src={urlFor(heroImage).width(1400).height(900).url()} alt={heroImage.alt || "Hero image"} fill className="object-cover object-center" priority />
        </div>
      )}
      {heroDisplay === "video" && (
        <div className="absolute inset-0 z-[1]">{renderHeroVideo()}</div>
      )}

      {/* z-2: Left readability gradient */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0.60) 38%, rgba(14,14,16,0.15) 62%, transparent 100%)" }} />

      {/* z-3: Grain */}
      <div className="grain-overlay" style={{ zIndex: 3 }} />

      {/* z-10: Expanding thumbnail — covers entire hero on expand */}
      {hasThumb && (
        <div
          style={{
            position:     "absolute",
            // idle  → small card bottom-right corner
            // expand → full inset-0 covering entire hero
            top:          thumbActive ? 0      : "auto",
            left:         thumbActive ? 0      : "auto",
            bottom:       thumbActive ? 0      : "20px",
            right:        thumbActive ? 0      : "20px",
            width:        thumbActive ? "100%" : "288px",
            height:       thumbActive ? "100%" : "192px",
            borderRadius: thumbActive ? "16px" : "14px",
            overflow:     "hidden",
            transition:   "top 0.65s cubic-bezier(0.4,0,0.2,1), left 0.65s cubic-bezier(0.4,0,0.2,1), bottom 0.65s cubic-bezier(0.4,0,0.2,1), right 0.65s cubic-bezier(0.4,0,0.2,1), width 0.65s cubic-bezier(0.4,0,0.2,1), height 0.65s cubic-bezier(0.4,0,0.2,1), border-radius 0.65s cubic-bezier(0.4,0,0.2,1)",
            border:       thumbActive ? "none" : "2px solid rgba(255,255,255,0.15)",
            boxShadow:    thumbActive ? "none" : "0 20px 60px rgba(0,0,0,0.5)",
            zIndex:       10,
          }}
        >
          {/* Small state: muted autoplay loop video (or poster image) */}
          {!thumbActive && (
            <>
              {hasVideo && !isEmbed ? (
                <video
                  ref={smallVideoRef}
                  src={videoUrl!}
                  className="w-full h-full object-cover"
                  muted autoPlay loop playsInline
                  poster={posterUrl}
                />
              ) : posterUrl ? (
                <Image src={posterUrl} alt="Showreel thumbnail" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background:"var(--accent)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 2L11 7L3 12V2Z" fill="#0e0e10"/>
                    </svg>
                  </div>
                </div>
              )}
              {/* Scroll to expand hint */}
              <div className="absolute bottom-0 left-0 right-0 py-2 text-center text-white/50 text-[10px] font-medium uppercase tracking-widest pointer-events-none"
                style={{ background:"linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}>
                Scroll to expand
              </div>
            </>
          )}

          {/* Expanding / expanded state: full video with controls */}
          {thumbActive && renderExpandedVideo()}

          {/* Enlarge button — top-left, shown when expanded */}
          {isExpanded && hasVideo && (
            <button
              onClick={openOverlay}
              className="absolute top-3 left-3 z-[15] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
              style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}
            >
              <Maximize2 size={14} /> Enlarge
            </button>
          )}
        </div>
      )}

      {/* z-4: Content — fades to 0 opacity while thumbnail expands */}
      <div
        className="flex flex-col md:flex-row min-h-[75vh] relative"
        style={{
          zIndex:        4,
          opacity:       thumbActive ? 0 : 1,
          transition:    "opacity 0.4s ease",
          pointerEvents: thumbActive ? "none" : "auto",
        }}
      >
        {/* LEFT */}
        <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <ScrollReveal>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                {heading}
              </h1>
            </ScrollReveal>
            {subtitle && (
              <ScrollReveal delay={0.1}>
                <p className="text-white/50 text-base leading-relaxed max-w-md">{subtitle}</p>
              </ScrollReveal>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-8 pb-4">
              {tags.map((tag: string, i: number) => (
                <ScrollReveal key={tag} delay={0.08 + i * 0.04}>
                  <span
                    className={`inline-block px-4 md:px-5 py-2 md:py-2.5 rounded-full ${TAG_SIZES[i % TAG_SIZES.length]} text-white/75 border border-white/20 backdrop-blur-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-default whitespace-nowrap`}
                    style={{ transform:`rotate(${TAG_ROTATIONS[i % TAG_ROTATIONS.length]}deg)`, background:"rgba(255,255,255,0.04)" }}
                  >
                    {tag}
                  </span>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: space where the thumbnail lives (play badge only when idle) */}
        <div className="w-full md:w-[55%] relative min-h-[300px] md:min-h-[500px] flex items-end justify-end p-5">
          {showPlayBadge && hasVideo && phase === "idle" && (
            <div className="absolute z-[15]" style={{ bottom:"calc(20px + 192px - 8px)", right:"calc(20px + 8px)" }}>
              <RotatingBadge />
            </div>
          )}
        </div>
      </div>

      {/* z-50: Fullscreen overlay (Enlarge button) */}
      {overlayOpen && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 md:p-10"
          style={{ background:"rgba(14,14,16,0.92)" }}>
          <div className="relative w-full max-w-[1100px] aspect-video rounded-card overflow-hidden">
            {hasVideo && (isEmbed ? (
              (() => {
                const ytId = getYouTubeId(videoUrl!);
                const vmId = getVimeoId(videoUrl!);
                if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&rel=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border:"none" }} />;
                if (vmId) return <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen style={{ border:"none" }} />;
                return null;
              })()
            ) : (
              <video ref={overlayVideoRef} src={videoUrl!} className="w-full h-full object-cover" controls playsInline loop autoPlay />
            ))}
          </div>
          <button onClick={closeOverlay}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-all"
            style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)" }}>
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
