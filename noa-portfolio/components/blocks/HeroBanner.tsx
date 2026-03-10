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

  // ── Showreel play state ──
  const [videoState, setVideoState] = useState<"idle"|"small"|"large">(
    hasVideo && autoplayVideo ? "small" : "idle"
  );
  const videoRef         = useRef<HTMLVideoElement>(null);
  const floatingVideoRef = useRef<HTMLVideoElement>(null);

  // ── Floating card state (scroll-driven) ──
  // "entering"  = card is animating in (hero scrolled away)
  // "visible"   = card is fully shown
  // "hidden"    = hero is in view, show normal thumbnail
  const [floatState, setFloatState] = useState<"hidden"|"entering"|"visible">("hidden");
  const heroRef = useRef<HTMLElement>(null);

  // The video has a "floating" mode when the hero is scrolled away.
  // We need a video to actually show — either showreel video or nothing.
  const hasFloatingContent = hasVideo || !!secondaryThumbnail;

  useEffect(() => {
    if (!hasFloatingContent) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!heroRef.current) return;
        const rect   = heroRef.current.getBoundingClientRect();
        const thresh = window.innerHeight * 0.82;

        if (rect.bottom <= thresh) {
          // Hero is scrolled away — show floating card
          setFloatState(prev => prev === "hidden" ? "entering" : prev);
        } else {
          // Hero is back in view — collapse
          setFloatState("hidden");
          // Pause floating video if it was playing
          if (floatingVideoRef.current) {
            floatingVideoRef.current.pause();
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasFloatingContent]);

  // After "entering" state → switch to "visible" on next frame for CSS transition
  useEffect(() => {
    if (floatState === "entering") {
      const id = requestAnimationFrame(() => setFloatState("visible"));
      return () => cancelAnimationFrame(id);
    }

    // Auto-play the floating video when it becomes visible
    if (floatState === "visible" && hasVideo && floatingVideoRef.current) {
      floatingVideoRef.current.play().catch(() => {});
    }
  }, [floatState, hasVideo]);

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

  // ── Video player helper (shared between thumbnail + floating card) ──
  function renderVideoContent(ref?: React.RefObject<HTMLVideoElement>, autoStart = false) {
    if (!videoUrl) return null;
    const cls = "w-full h-full object-cover";
    if (isEmbed) {
      const ytId = getYouTubeId(videoUrl);
      const vmId = getVimeoId(videoUrl);
      if (ytId) return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoStart?1:0}&mute=0&rel=0`}
          className={cls}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ border:"none" }}
        />
      );
      if (vmId) return (
        <iframe
          src={`https://player.vimeo.com/video/${vmId}?autoplay=${autoStart?1:0}`}
          className={cls} allow="autoplay; fullscreen" allowFullScreen style={{ border:"none" }}
        />
      );
    }
    return (
      <video
        ref={ref}
        src={videoUrl}
        className={cls}
        controls
        muted={false}
        playsInline
        loop
      />
    );
  }

  // ── Small/enlarged showreel player inside hero ──
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

  // ── Full-width hero background video (heroDisplay === "video") ──
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

  // Whether to hide the in-hero thumbnail (floating card takes over)
  const thumbnailHidden = floatState !== "hidden";

  return (
    <>
      <section
        ref={heroRef}
        id="home"
        className="rounded-card relative overflow-hidden pt-20"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* z-0: Background */}
        <HeroBackground
          bgPreset={bgPreset}
          customColor1={customColor1}
          customColor2={customColor2}
          particlePreset={pPreset}
          particleColor={pColor}
          density={pDensity}
          speed={pSpeed}
          particleOpacity={pOpacity}
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
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0.60) 38%, rgba(14,14,16,0.15) 62%, transparent 100%)",
          }}
        />

        {/* z-3: Grain */}
        <div className="grain-overlay" style={{ zIndex: 3 }} />

        {/* z-50: Enlarged showreel overlay */}
        {videoState === "large" && (
          <div
            className="absolute inset-0 z-[50] flex items-center justify-center p-6 md:p-10"
            style={{ background: "rgba(14,14,16,0.92)" }}
          >
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

        {/* z-4: Content */}
        <div className="flex flex-col md:flex-row min-h-[75vh] relative" style={{ zIndex: 4 }}>

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

          {/* RIGHT: thumbnail — hidden when floating card is active */}
          <div className="w-full md:w-[55%] relative min-h-[300px] md:min-h-[500px] flex items-end justify-end p-5">
            <div
              className="relative"
              style={{
                opacity: thumbnailHidden ? 0 : 1,
                transition: "opacity 0.3s ease",
                pointerEvents: thumbnailHidden ? "none" : "auto",
              }}
            >
              {showPlayBadge && hasVideo && videoState === "idle" && !thumbnailHidden && (
                <div className="absolute -top-12 -left-12 z-[15]" onClick={handlePlayClick}>
                  <RotatingBadge />
                </div>
              )}

              {videoState === "small" ? (
                <div className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/20 shadow-2xl relative">
                  {renderShowreelPlayer(false)}
                  <button onClick={handleEnlarge}
                    className="absolute top-2 right-2 z-[15] flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
                    style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}>
                    <Maximize2 size={12} /> Enlarge
                  </button>
                </div>
              ) : secondaryThumbnail ? (
                <div
                  className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl cursor-pointer relative"
                  onClick={hasVideo ? handlePlayClick : undefined}
                >
                  <Image src={urlFor(secondaryThumbnail).width(480).height(320).url()}
                    alt="Video thumbnail" fill className="object-cover" />
                </div>
              ) : hasVideo ? (
                <div
                  className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center text-white/20 text-xs cursor-pointer"
                  style={{ background:"rgba(255,255,255,0.04)" }}
                  onClick={handlePlayClick}
                >
                  Click play to watch
                </div>
              ) : null}
            </div>
          </div>

        </div>
      </section>

      {/* ── FLOATING VIDEO CARD ──
          Rendered outside the section so it can overlap the boundary between
          the hero and the section below it. Fixed position, centered, with
          translateY(28%) so it straddles the hero/section seam.
          CSS transitions drive the entrance (scale + opacity).            ── */}
      {hasFloatingContent && (
        <div
          aria-hidden="true"
          style={{
            position:   "fixed",
            bottom:     0,
            left:       "50%",
            // translateY(28%) pushes 28% of the card below the viewport edge,
            // creating the intersection with the next section below.
            transform:  floatState === "visible"
              ? "translateX(-50%) translateY(28%)"
              : "translateX(-50%) translateY(115%)",
            width:      "min(600px, 92vw)",
            aspectRatio:"16 / 9",
            zIndex:     40,
            transition: "transform 0.52s cubic-bezier(0.34, 1.18, 0.64, 1)",
            borderRadius: "18px 18px 0 0",
            overflow:   "hidden",
            boxShadow:  "0 -12px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)",
            // Only interactive when visible
            pointerEvents: floatState === "visible" ? "auto" : "none",
          }}
        >
          {/* Video content or thumbnail */}
          {hasVideo ? (
            renderVideoContent(floatingVideoRef, floatState === "visible")
          ) : secondaryThumbnail ? (
            <div className="relative w-full h-full">
              <Image
                src={urlFor(secondaryThumbnail).width(800).height(450).url()}
                alt="Video thumbnail" fill className="object-cover"
              />
            </div>
          ) : null}

          {/* Subtle label strip at the top of the floating card */}
          <div
            className="absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-between"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
              pointerEvents: "none",
            }}
          >
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
              Showreel
            </span>
          </div>
        </div>
      )}
    </>
  );
}
