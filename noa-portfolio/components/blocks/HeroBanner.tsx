"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";
import { HeroBackground } from "../ui/HeroBackground";
import { Maximize2, Minimize2 } from "lucide-react";

const HeroCharacter3D = dynamic(
  () => import("../ui/HeroCharacter3D").then((mod) => mod.HeroCharacter3D),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" style={{ background: "transparent" }} />,
  }
);

const TAG_ROTATIONS = [-8, 3, -4, 6, -2, 5, -6, 3, -5, 4];
const TAG_SIZES = [
  "text-sm","text-base","text-sm","text-base","text-xs",
  "text-sm","text-base","text-sm","text-xs","text-base",
];

function getVideoUrl(heroVideo: any): string | null {
  if (!heroVideo) return null;
  if (heroVideo.videoFile?.asset?.url) return heroVideo.videoFile.asset.url;
  if (heroVideo.embedUrl) return heroVideo.embedUrl;
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

// ── Scroll-lock helpers ──────────────────────────────────────────────────────
// We store the scroll position so we can restore it on unlock.
let _scrollY = 0;

function lockScroll() {
  _scrollY = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top      = `-${_scrollY}px`;
  document.body.style.width    = "100%";
}

function unlockScroll() {
  document.body.style.overflow  = "";
  document.body.style.position  = "";
  document.body.style.top       = "";
  document.body.style.width     = "";
  window.scrollTo(0, _scrollY);
}
// ────────────────────────────────────────────────────────────────────────────

type ThumbnailPhase =
  | "idle"       // small card, hero in view
  | "expanding"  // scroll locked, CSS transition playing
  | "expanded";  // full size, scroll unlocked

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
    ctaLabel = "SEND ME AN EMAIL",
    ctaLink = "#",
  } = props;

  const bgPreset     = heroBackground?.preset  ?? "dark";
  const customColor1 = resolveColor(heroBackground?.color1);
  const customColor2 = resolveColor(heroBackground?.color2);
  const pPreset      = heroParticles?.preset   ?? "dots";
  const pColor       = resolveColor(heroParticles?.color) ?? "#c9fb00";
  const pDensity     = heroParticles?.density  ?? "medium";
  const pSpeed       = heroParticles?.speed    ?? "normal";
  const pOpacity     = heroParticles?.opacity  ?? 0.35;

  const videoUrl = getVideoUrl(heroVideo);
  const hasVideo = !!videoUrl;
  const isEmbed  = hasVideo && isEmbedUrl(videoUrl!);

  // ── Showreel play state (manual play, separate from scroll expansion) ──
  const [videoState, setVideoState] = useState<"idle"|"small"|"large">(
    hasVideo && autoplayVideo ? "small" : "idle"
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Scroll-expansion phase ──
  // Only active when a showreel video exists and hero has a thumbnail to expand
  const hasExpandable = hasVideo || !!secondaryThumbnail;
  const [phase, setPhase] = useState<ThumbnailPhase>("idle");
  const phaseRef         = useRef<ThumbnailPhase>("idle"); // always-current for event handlers
  const heroRef          = useRef<HTMLElement>(null);
  const expandVideoRef   = useRef<HTMLVideoElement>(null);

  function setPhaseSync(p: ThumbnailPhase) {
    phaseRef.current = p;
    setPhase(p);
  }

  // ── STEP 1: Lock scroll + begin expansion on first scroll attempt ──
  useEffect(() => {
    if (!hasExpandable) return;

    // Wheel handler — non-passive so we can preventDefault
    const onWheel = (e: WheelEvent) => {
      if (!heroRef.current) return;

      const heroRect = heroRef.current.getBoundingClientRect();
      const heroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;

      if (!heroVisible) return; // hero already scrolled away, don't interfere

      if (phaseRef.current === "idle" && e.deltaY > 0) {
        // First downward scroll while hero is in view → start expansion
        e.preventDefault();
        e.stopPropagation();
        lockScroll();
        setPhaseSync("expanding");
      } else if (phaseRef.current === "expanding") {
        // Keep blocking scroll while expanding
        e.preventDefault();
        e.stopPropagation();
      }
      // "expanded" → let scroll through normally (scroll already unlocked)
    };

    // Touch handler for mobile
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!heroRef.current) return;
      const heroRect   = heroRef.current.getBoundingClientRect();
      const heroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      if (!heroVisible) return;

      const dy = touchStartY - e.touches[0].clientY; // positive = scrolling down

      if (phaseRef.current === "idle" && dy > 4) {
        e.preventDefault();
        lockScroll();
        setPhaseSync("expanding");
      } else if (phaseRef.current === "expanding") {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, [hasExpandable]);

  // ── STEP 2: After expansion CSS transition completes → unlock scroll ──
  useEffect(() => {
    if (phase !== "expanding") return;

    // CSS transition on the thumbnail card is 650ms.
    // We wait 680ms then unlock so the animation fully completes first.
    const id = setTimeout(() => {
      setPhaseSync("expanded");
      unlockScroll();
      // Auto-play the expanded video
      expandVideoRef.current?.play().catch(() => {});
    }, 680);

    return () => clearTimeout(id);
  }, [phase]);

  // ── STEP 3: Reset when hero scrolls fully out of view ──
  useEffect(() => {
    if (!hasExpandable) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // When the hero is no longer intersecting (scrolled past bottom)
        if (!entry.isIntersecting && phaseRef.current !== "idle") {
          setPhaseSync("idle");
          // Pause the expanded video
          if (expandVideoRef.current) {
            expandVideoRef.current.pause();
            expandVideoRef.current.currentTime = 0;
          }
        }
      },
      { threshold: 0 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [hasExpandable]);

  // ── Manual showreel controls (play badge / enlarge) ──
  const handlePlayClick = useCallback(() => {
    if (!hasVideo) return;
    setVideoState("small");
    setTimeout(() => videoRef.current?.play(), 100);
  }, [hasVideo]);
  const handleEnlarge    = useCallback(() => setVideoState("large"), []);
  const handleMinimize   = useCallback(() => setVideoState("small"), []);
  const handleCloseVideo = useCallback(() => {
    setVideoState("idle");
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }, []);

  // ── Video player renderers ──
  function renderShowreelPlayer(expanded: boolean) {
    if (!videoUrl) return null;
    const cls = `w-full h-full object-cover ${expanded ? "rounded-card" : "rounded-[14px]"}`;
    if (isEmbed) {
      const ytId = getYouTubeId(videoUrl);
      const vmId = getVimeoId(videoUrl);
      if (ytId) return (
        <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&rel=0`}
          className={cls}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ border:"none" }} />
      );
      if (vmId) return (
        <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=1`}
          className={cls} allow="autoplay; fullscreen" allowFullScreen style={{ border:"none" }} />
      );
    }
    return (
      <video ref={videoRef} src={videoUrl} className={cls} controls
        muted={autoplayVideo} autoPlay={autoplayVideo || videoState !== "idle"} playsInline loop />
    );
  }

  function renderHeroVideo() {
    if (!heroRightVideo) return null;
    const rvUrl = heroRightVideo.videoFile?.asset?.url || heroRightVideo.embedUrl || null;
    if (!rvUrl) return null;
    const rvEmbed   = isEmbedUrl(rvUrl);
    const rvAuto    = heroRightVideo.autoplay !== false;
    const posterUrl = heroRightVideo.posterImage
      ? urlFor(heroRightVideo.posterImage).width(1400).height(900).url()
      : undefined;
    if (rvEmbed) {
      const ytId = getYouTubeId(rvUrl);
      const vmId = getVimeoId(rvUrl);
      if (ytId) return (
        <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=${rvAuto?1:0}&mute=1&loop=1&playlist=${ytId}&rel=0&controls=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          style={{ border:"none" }} />
      );
      if (vmId) return (
        <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=${rvAuto?1:0}&muted=1&loop=1&background=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen" style={{ border:"none" }} />
      );
    }
    return (
      <video src={rvUrl} className="absolute inset-0 w-full h-full object-cover object-center"
        autoPlay={rvAuto} muted loop playsInline poster={posterUrl} />
    );
  }

  // ── Thumbnail card — position + size driven by phase ──
  // idle:      small card, bottom-right corner
  // expanding: CSS-transitions to fill the right 55% of the hero
  // expanded:  full right panel, video playing
  const isExpanded   = phase === "expanded";
  const isExpanding  = phase === "expanding";
  const thumbActive  = isExpanding || isExpanded;

  // Compute the poster/thumbnail image URL for the card back-face
  const thumbnailImgUrl = secondaryThumbnail
    ? urlFor(secondaryThumbnail).width(800).height(450).url()
    : null;

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
          <Image src={urlFor(heroImage).width(1400).height(900).url()}
            alt={heroImage.alt || "Hero image"} fill
            className="object-cover object-center" priority />
        </div>
      )}
      {heroDisplay === "video" && (
        <div className="absolute inset-0 z-[1]">{renderHeroVideo()}</div>
      )}

      {/* z-2: Readability gradient */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0.60) 38%, rgba(14,14,16,0.15) 62%, transparent 100%)" }} />

      {/* z-3: Grain */}
      <div className="grain-overlay" style={{ zIndex: 3 }} />

      {/* z-50: Enlarged showreel overlay (manual play) */}
      {videoState === "large" && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 md:p-10"
          style={{ background: "rgba(14,14,16,0.92)" }}>
          <div className="relative w-full max-w-[1100px] aspect-video rounded-card overflow-hidden">
            {renderShowreelPlayer(true)}
            <button onClick={handleMinimize}
              className="absolute top-3 left-3 z-[15] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
              style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}>
              <Minimize2 size={14} /> Minimize
            </button>
          </div>
          <button onClick={handleCloseVideo}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-all"
            style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)" }}>
            ✕
          </button>
        </div>
      )}

      {/* z-4: Main content layout */}
      <div className="flex flex-col md:flex-row min-h-[75vh] relative" style={{ zIndex: 4 }}>

        {/* LEFT: heading + subtitle + tags */}
        <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col justify-between"
          style={{
            // Fade out text as thumbnail expands to full width
            opacity:    thumbActive ? 0.15 : 1,
            transition: "opacity 0.5s ease",
            pointerEvents: thumbActive ? "none" : "auto",
          }}
        >
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

        {/* RIGHT: thumbnail + expanded video — absolutely positioned so it can grow */}
        <div className="w-full md:w-[55%] relative min-h-[300px] md:min-h-[500px]">

          {/* ── Play badge (only when idle + not expanded) ── */}
          {showPlayBadge && hasVideo && videoState === "idle" && phase === "idle" && (
            <div
              className="absolute z-[10]"
              style={{
                bottom: "calc(20px + 192px - 12px)",
                right:  "calc(20px + 12px)",
              }}
              onClick={handlePlayClick}
            >
              <RotatingBadge />
            </div>
          )}

          {/* ── THE THUMBNAIL / EXPANDED CARD ──
              Uses CSS transitions on all box-model properties to animate
              between the small corner card and a full right-panel video.    ── */}
          {hasExpandable && (
            <div
              style={{
                position:   "absolute",
                // ── idle: small card, bottom-right ──
                // ── expanding/expanded: fill the full right panel ──
                bottom:     thumbActive ? 0     : "20px",
                right:      thumbActive ? 0     : "20px",
                left:       thumbActive ? 0     : "auto",
                top:        thumbActive ? 0     : "auto",
                width:      thumbActive ? "100%" : "288px",
                height:     thumbActive ? "100%" : "192px",
                borderRadius: thumbActive ? "16px" : "14px",
                overflow:   "hidden",
                transition: "all 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
                border:     thumbActive ? "none" : "2px solid rgba(255,255,255,0.15)",
                boxShadow:  thumbActive ? "none" : "0 20px 60px rgba(0,0,0,0.5)",
                zIndex:     8,
                cursor:     phase === "idle" && hasVideo ? "pointer" : "default",
              }}
              onClick={phase === "idle" && hasVideo ? handlePlayClick : undefined}
            >
              {/* When expanded: show the actual video */}
              {thumbActive && hasVideo ? (
                (() => {
                  if (isEmbed) {
                    const ytId = getYouTubeId(videoUrl!);
                    const vmId = getVimeoId(videoUrl!);
                    if (ytId) return (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=${isExpanded?1:0}&mute=0&rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen style={{ border:"none" }}
                      />
                    );
                    if (vmId) return (
                      <iframe
                        src={`https://player.vimeo.com/video/${vmId}?autoplay=${isExpanded?1:0}`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen" allowFullScreen style={{ border:"none" }}
                      />
                    );
                  }
                  return (
                    <video
                      ref={expandVideoRef}
                      src={videoUrl!}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      loop
                    />
                  );
                })()
              ) : (
                /* Thumbnail image or placeholder when idle */
                thumbnailImgUrl ? (
                  <Image src={thumbnailImgUrl} alt="Showreel thumbnail"
                    fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background:"rgba(255,255,255,0.04)" }}>
                    {hasVideo && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background:"var(--accent)" }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 2L11 7L3 12V2Z" fill="#0e0e10"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Scroll-to-expand hint — only shown when idle */}
              {phase === "idle" && hasExpandable && (
                <div
                  className="absolute bottom-0 left-0 right-0 py-2 text-center text-white/40 text-[10px] font-medium uppercase tracking-widest"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    pointerEvents: "none",
                  }}
                >
                  Scroll to expand
                </div>
              )}
            </div>
          )}

          {/* Manual enlarge button when in "small" state from play-badge click */}
          {videoState === "small" && phase === "idle" && (
            <button onClick={handleEnlarge}
              className="absolute bottom-5 right-5 z-[15] flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
              style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}>
              <Maximize2 size={12} /> Enlarge
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
