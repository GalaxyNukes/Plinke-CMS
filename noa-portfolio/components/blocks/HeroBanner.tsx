"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";
import { HeroBackground } from "../ui/HeroBackground";

/** Only allow safe URL schemes from CMS-provided links. */
function safeHref(url: unknown, fallback = "#"): string {
  if (typeof url !== "string" || !url.trim()) return fallback;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("mailto:") || lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("/") || lower.startsWith("#")) return url.trim();
  return fallback;
}

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

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

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

  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // ONE video element — always mounted, never remounted
  // This is the key: keeping the same DOM node means playback never interrupts
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay muted loop on mount
  useEffect(() => {
    if (!hasVideo || isEmbed) return;
    const t = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [hasVideo, isEmbed]);

  // Scroll-lock helpers
  const savedScrollY = useRef(0);
  const isLocked = useRef(false);
  function lockScroll() {
    if (isLocked.current) return;
    savedScrollY.current = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY.current}px`;
    document.body.style.width = "100%";
    isLocked.current = true;
  }
  function unlockScroll() {
    if (!isLocked.current) return;
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY.current);
    isLocked.current = false;
  }

  // How many px of scroll delta = full expansion
  const EXPAND_PX = 420;
  const accumulated = useRef(0);
  const progressRef = useRef(0);
  const unlockedRef = useRef(false);

  // Continuous scroll-driven thumbnail: lock page while expanding, release at 95%
  useEffect(() => {
    if (!hasThumb) return;

    function heroInView() {
      if (!heroRef.current) return false;
      const rect = heroRef.current.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
    }

    function applyDelta(delta: number) {
      if (unlockedRef.current) return; // already released, ignore

      // Lock on first downward movement while hero is visible
      if (delta > 0 && heroInView()) lockScroll();

      if (!isLocked.current) return;

      accumulated.current = Math.max(0, Math.min(EXPAND_PX, accumulated.current + delta));
      const p = accumulated.current / EXPAND_PX;
      progressRef.current = p;
      setScrollProgress(p);

      // Release at 100% — fully expanded, then let the page scroll freely
      if (p >= 1) {
        unlockedRef.current = true;
        setScrollProgress(1);
        progressRef.current = 1;
        unlockScroll();
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (unlockedRef.current) return;
      if (!heroInView()) return;
      e.preventDefault();
      applyDelta(e.deltaY);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (unlockedRef.current) return;
      if (!heroInView()) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 5) return;
      e.preventDefault();
      touchStartY = e.touches[0].clientY;
      applyDelta(dy * 2); // touch needs a bit more sensitivity
    };

    // Reset when hero scrolls back into view at top
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // If hero top is back near viewport top, reset everything
      if (rect.top > -20 && unlockedRef.current) {
        unlockedRef.current = false;
        accumulated.current = 0;
        progressRef.current = 0;
        setScrollProgress(0);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      unlockScroll(); // safety: release on unmount
    };
  }, [hasThumb]); // eslint-disable-line react-hooks/exhaustive-deps

  const thumbActive = scrollProgress > 0.01;
  const thumbExpanded = scrollProgress > 0.99;

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
            modelUrl={hero3dModel?.modelFile?.asset?.url ?? null}
            headBoneName={hero3dModel?.headBoneName ?? "Head"}
            cameraDistance={hero3dModel?.cameraDistance ?? 4.5}
            cameraHeight={hero3dModel?.cameraHeight ?? 1.0}
            modelScale={hero3dModel?.modelScale ?? 1.0}
            modelRotationY={hero3dModel?.modelRotationY ?? 0}
            headTrackIntensity={hero3dModel?.headTrackIntensity ?? 0.6}
            fullWidthMode={true}
          />
        </div>
      )}
      {heroDisplay === "image" && heroImage && (
        <div className="absolute inset-0 z-[1]">
          <Image src={urlFor(heroImage).width(1400).height(900).url()} alt={heroImage.alt || "Noa Plinke — 3D Gameplay Animator portfolio hero"} fill className="object-cover object-center" priority />
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
      {hasThumb && (() => {
        const heroW = heroRef.current?.offsetWidth ?? 0;
        const heroH = heroRef.current?.offsetHeight ?? 0;
        const p = scrollProgress;
        const thumbW   = heroW > 0 ? lerp(288, heroW, p) : (p > 0.01 ? "100%" : "288px");
        const thumbH   = heroH > 0 ? lerp(192, heroH, p) : (p > 0.01 ? "100%" : "192px");
        const thumbBot = lerp(20, 0, p);
        const thumbRt  = lerp(20, 0, p);
        const thumbBR  = lerp(14, 0, p);
        const borderW  = lerp(2, 0, p);
        const shadowOp = lerp(0.5, 0, p);
        return (
          <div
            style={{
              position:     "absolute",
              bottom:       thumbBot,
              right:        thumbRt,
              width:        typeof thumbW === "number" ? `${thumbW}px` : thumbW,
              height:       typeof thumbH === "number" ? `${thumbH}px` : thumbH,
              borderRadius: `${thumbBR}px`,
              overflow:     "hidden",
              border:       `${borderW}px solid rgba(255,255,255,0.15)`,
              boxShadow:    `0 20px 60px rgba(0,0,0,${shadowOp})`,
              zIndex:       10,
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
              {thumbExpanded ? (
                (() => {
                  const ytId = getYouTubeId(videoUrl!);
                  const vmId = getVimeoId(videoUrl!);
                  if (ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&controls=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" style={{ border:"none" }} />;
                  if (vmId) return <iframe src={`https://player.vimeo.com/video/${vmId}?autoplay=1&muted=1&background=1`} className="w-full h-full" allow="autoplay; fullscreen" style={{ border:"none" }} />;
                  return null;
                })()
              ) : posterUrl ? (
                <Image src={posterUrl} alt="Noa Plinke gameplay animation showreel" fill className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background:"rgba(255,255,255,0.04)" }} />
              )}
            </>
          )}

          {/* ── Fallback: only a poster image, no video ── */}
          {!hasVideo && posterUrl && (
            <Image src={posterUrl} alt="Noa Plinke gameplay animation showreel thumbnail" fill className="object-cover" />
          )}

          {/* "Scroll to expand" hint — fades out as scroll progresses */}
          {scrollProgress < 0.15 && (
            <div
              className="absolute bottom-0 left-0 right-0 py-2 text-center text-white/50 text-[10px] font-medium uppercase tracking-widest pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)", opacity: 1 - scrollProgress / 0.15 }}
            >
              Scroll to expand
            </div>
          )}
        </div>
        );
      })()}

      {/* z-4: Text content — fades out as thumbnail expands */}
      <div
        className="flex flex-col md:flex-row min-h-[75vh] relative"
        style={{
          zIndex:        4,
          opacity:       Math.max(0, 1 - scrollProgress * 2.5),
          pointerEvents: scrollProgress > 0.4 ? "none" : "auto",
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
          {showPlayBadge && hasVideo && scrollProgress < 0.05 && (
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
