"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";
import { HeroBackground } from "../ui/HeroBackground";

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
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top      = `-${_savedScrollY}px`;
  document.body.style.width    = "100%";
}
function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top      = "";
  document.body.style.width    = "";
  window.scrollTo(0, _savedScrollY);
}

type Phase = "idle" | "expanding" | "expanded";

export function HeroBanner(props: any) {
  const {
    heading     = "Animation that hits different",
    subtitle    = "",
    heroImage,
    heroVideo,
    heroDisplay = "image",
    heroRightVideo,
    hero3dModel,
    heroBackground,
    heroParticles,
    secondaryThumbnail,
    showPlayBadge = true,
    tags          = [],
  } = props;

  const bgPreset     = heroBackground?.preset ?? "dark";
  const customColor1 = resolveColor(heroBackground?.color1);
  const customColor2 = resolveColor(heroBackground?.color2);
  const pPreset      = heroParticles?.preset  ?? "dots";
  const pColor       = resolveColor(heroParticles?.color) ?? "#c9fb00";
  const pDensity     = heroParticles?.density ?? "medium";
  const pSpeed       = heroParticles?.speed   ?? "normal";
  const pOpacity     = heroParticles?.opacity ?? 0.35;

  const videoUrl = getVideoUrl(heroVideo);
  const hasVideo = !!videoUrl;
  const isEmbed  = hasVideo && isEmbedUrl(videoUrl!);
  const hasThumb = hasVideo || !!secondaryThumbnail;

  const [phase, setPhase]   = useState<Phase>("idle");
  const phaseRef            = useRef<Phase>("idle");
  const heroRef             = useRef<HTMLElement>(null);

  // ONE video element — always mounted, never remounted
  // This is the key: keeping the same DOM node means playback never interrupts
  const videoRef = useRef<HTMLVideoElement>(null);

  function commitPhase(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }

  // Autoplay muted loop on mount
  useEffect(() => {
    if (!hasVideo || isEmbed) return;
    const t = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [hasVideo, isEmbed]);

  // Scroll intercept
  useEffect(() => {
    if (!hasThumb) return;
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
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

  // Unlock scroll after CSS transition finishes
  useEffect(() => {
    if (phase !== "expanding") return;
    const id = setTimeout(() => {
      commitPhase("expanded");
      unlockScroll();
    }, 700);
    return () => clearTimeout(id);
  }, [phase]);

  // Reset when hero fully exits viewport
  useEffect(() => {
    if (!hasThumb) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && phaseRef.current !== "idle") {
          commitPhase("idle");
        }
      },
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [hasThumb]);

  const isExpanding = phase === "expanding";
  const isExpanded  = phase === "expanded";
  const thumbActive = isExpanding || isExpanded;

  const posterUrl = secondaryThumbnail
    ? urlFor(secondaryThumbnail).width(800).height(450).url()
    : undefined;

  // Background video (heroDisplay === "video")
  function renderHeroVideo() {
    if (!heroRightVideo) return null;
    const rvUrl = heroRightVideo.videoFile?.asset?.url || heroRightVideo.embedUrl || null;
    if (!rvUrl) return null;
    const rvEmbed  = isEmbedUrl(rvUrl);
    const rvAuto   = heroRightVideo.autoplay !== false;
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

      {/* z-1: Full-width visual */}
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
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0.60) 38%, rgba(14,14,16,0.15) 62%, transparent 100%)" }}
      />

      {/* z-3: Grain */}
      <div className="grain-overlay" style={{ zIndex: 3 }} />

      {/* ── z-10: THE THUMBNAIL CARD ──────────────────────────────────────────
          Always anchored to bottom:0, right:0.
          Transitions width + height only → grows from bottom-right corner.
          One single <video> element lives here — never remounted — so
          playback is never interrupted by the expansion.
      ────────────────────────────────────────────────────────────────────── */}
      {hasThumb && (
        <div
          style={{
            position:     "absolute",
            bottom:       thumbActive ? 0       : "20px",
            right:        thumbActive ? 0       : "20px",
            // Width/height grow from 288×192 → 100%×100%
            // Because bottom+right are the fixed anchors, expansion goes
            // upward and leftward — i.e. from the bottom-right corner.
            width:        thumbActive ? "100%"  : "288px",
            height:       thumbActive ? "100%"  : "192px",
            borderRadius: thumbActive ? "16px"  : "14px",
            overflow:     "hidden",
            transition:   [
              "width 0.65s cubic-bezier(0.4,0,0.2,1)",
              "height 0.65s cubic-bezier(0.4,0,0.2,1)",
              "bottom 0.65s cubic-bezier(0.4,0,0.2,1)",
              "right 0.65s cubic-bezier(0.4,0,0.2,1)",
              "border-radius 0.65s cubic-bezier(0.4,0,0.2,1)",
            ].join(", "),
            border:    thumbActive ? "none" : "2px solid rgba(255,255,255,0.15)",
            boxShadow: thumbActive ? "none" : "0 20px 60px rgba(0,0,0,0.5)",
            zIndex:    10,
          }}
        >
          {/* ── Direct video file: single <video> always in DOM ── */}
          {hasVideo && !isEmbed && (
            <video
              ref={videoRef}
              src={videoUrl!}
              className="w-full h-full object-cover"
              // Always muted, no controls, looping silently
              muted
              autoPlay
              loop
              playsInline
              poster={posterUrl}
              // Disable any browser-injected controls on mobile
              disablePictureInPicture
              disableRemotePlayback
            />
          )}

          {/* ── Embed (YouTube/Vimeo): show poster in small state,
                iframe in expanded state ── */}
          {hasVideo && isEmbed && (
            <>
              {thumbActive ? (
                (() => {
                  const ytId = getYouTubeId(videoUrl!);
                  const vmId = getVimeoId(videoUrl!);
                  if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&controls=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" style={{ border:"none" }} />;
                  if (vmId) return <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=1&muted=1&background=1`} className="w-full h-full" allow="autoplay; fullscreen" style={{ border:"none" }} />;
                  return null;
                })()
              ) : posterUrl ? (
                <Image src={posterUrl} alt="Showreel" fill className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background:"rgba(255,255,255,0.04)" }} />
              )}
            </>
          )}

          {/* ── Fallback: only a poster image, no video ── */}
          {!hasVideo && posterUrl && (
            <Image src={posterUrl} alt="Showreel thumbnail" fill className="object-cover" />
          )}

          {/* "Scroll to expand" hint — only in idle state */}
          {!thumbActive && (
            <div
              className="absolute bottom-0 left-0 right-0 py-2 text-center text-white/50 text-[10px] font-medium uppercase tracking-widest pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
            >
              Scroll to expand
            </div>
          )}
        </div>
      )}

      {/* z-4: Text content — fades to 0 during expansion */}
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

        {/* RIGHT: play badge anchor */}
        <div className="w-full md:w-[55%] relative min-h-[300px] md:min-h-[500px] flex items-end justify-end p-5">
          {showPlayBadge && hasVideo && phase === "idle" && (
            <div
              className="absolute z-[15]"
              style={{ bottom: "calc(20px + 192px - 8px)", right: "calc(20px + 8px)" }}
            >
              <RotatingBadge />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
