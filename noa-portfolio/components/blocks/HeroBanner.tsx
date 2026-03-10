"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";
import { Maximize2, Minimize2 } from "lucide-react";

// Dynamic import — Three.js is client-only and heavy
const HeroCharacter3D = dynamic(
  () => import("../ui/HeroCharacter3D").then((mod) => mod.HeroCharacter3D),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/10 text-sm"
      style={{ background: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #0f2a3f)" }}>
      Loading 3D...
    </div>
  )}
);

/* Organic rotations + size variants for tags */
const TAG_ROTATIONS = [-8, 3, -4, 6, -2, 5, -6, 3, -5, 4];
const TAG_SIZES = ["text-sm", "text-base", "text-sm", "text-base", "text-xs", "text-sm", "text-base", "text-sm", "text-xs", "text-base"];

function getVideoUrl(heroVideo: any): string | null {
  if (!heroVideo) return null;
  // Uploaded file — asset is dereferenced by GROQ
  if (heroVideo.videoFile?.asset?.url) return heroVideo.videoFile.asset.url;
  // YouTube / Vimeo embed
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

export function HeroBanner(props: any) {
  const {
    heading = "Animation that hits different",
    subtitle = "",
    heroImage,
    heroVideo,
    heroDisplay = "image",
    heroRightVideo,
    hero3dModel,
    secondaryThumbnail,
    showPlayBadge = true,
    autoplayVideo = false,
    tags = [],
    ctaLabel = "SEND ME AN EMAIL",
    ctaLink = "#",
  } = props;

  const videoUrl = getVideoUrl(heroVideo);
  const hasVideo = !!videoUrl;
  const isEmbed = hasVideo && isEmbedUrl(videoUrl!);

  const [videoState, setVideoState] = useState<"idle" | "small" | "large">(
    hasVideo && autoplayVideo ? "small" : "idle"
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = useCallback(() => {
    if (!hasVideo) return;
    setVideoState("small");
    // For direct video files, play after state update
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  }, [hasVideo]);

  const handleEnlarge = useCallback(() => {
    setVideoState("large");
  }, []);

  const handleMinimize = useCallback(() => {
    setVideoState("small");
  }, []);

  const handleCloseVideo = useCallback(() => {
    setVideoState("idle");
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  /* ── Render video element ── */
  const renderVideoPlayer = (expanded: boolean) => {
    if (!videoUrl) return null;

    const classes = `w-full h-full object-cover ${expanded ? "rounded-card" : "rounded-[14px]"}`;

    if (isEmbed) {
      const ytId = getYouTubeId(videoUrl);
      const vmId = getVimeoId(videoUrl);
      if (ytId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&rel=0`}
            className={classes}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
          />
        );
      }
      if (vmId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vmId}?autoplay=1`}
            className={classes}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: "none" }}
          />
        );
      }
    }

    // Direct video file
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        className={classes}
        controls
        muted={autoplayVideo}
        autoPlay={autoplayVideo || videoState !== "idle"}
        playsInline
        loop
      />
    );
  };

  return (
    <section
      id="home"
      className="rounded-card relative overflow-hidden pt-20"
      style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="grain-overlay" />

      {/* ── ENLARGED VIDEO OVERLAY ── */}
      {videoState === "large" && (
        <div
          className="absolute inset-0 z-[50] flex items-center justify-center p-6 md:p-10"
          style={{ background: "rgba(14,14,16,0.92)" }}
        >
          <div className="relative w-full max-w-[1100px] aspect-video rounded-card overflow-hidden">
            {renderVideoPlayer(true)}

            {/* Minimize button — small corner button, doesn't block video */}
            <button
              onClick={handleMinimize}
              className="absolute top-3 left-3 z-[15] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Minimize2 size={14} /> Minimize
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleCloseVideo}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-all"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-[75vh] relative z-[2]">
        {/* ── LEFT SIDE ── */}
        <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <ScrollReveal>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                {heading}
              </h1>
            </ScrollReveal>
            {subtitle && (
              <ScrollReveal delay={0.1}>
                <p className="text-white/50 text-base leading-relaxed max-w-md">
                  {subtitle}
                </p>
              </ScrollReveal>
            )}
          </div>

          {/* ── Specialty tags — larger, organic, fill the space ── */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-8 pb-4">
              {tags.map((tag: string, i: number) => (
                <ScrollReveal key={tag} delay={0.08 + i * 0.04}>
                  <span
                    className={`inline-block px-4 md:px-5 py-2 md:py-2.5 rounded-full ${TAG_SIZES[i % TAG_SIZES.length]} text-white/75 border border-white/20 backdrop-blur-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-default whitespace-nowrap`}
                    style={{
                      transform: `rotate(${TAG_ROTATIONS[i % TAG_ROTATIONS.length]}deg)`,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {tag}
                  </span>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDE — Hero image + video thumbnail ── */}
        <div className="w-full md:w-[55%] relative p-0 md:pr-5 md:pb-5 min-h-[400px] md:min-h-[500px]">
          <div className="w-full h-full rounded-card overflow-hidden relative">
            {heroDisplay === "3d" ? (
              <HeroCharacter3D
                modelUrl={hero3dModel?.modelFile?.asset?.url || null}
                headBoneName={hero3dModel?.headBoneName || "Head"}
                cameraDistance={hero3dModel?.cameraDistance || 4.5}
                cameraHeight={hero3dModel?.cameraHeight || 1.0}
                modelScale={hero3dModel?.modelScale || 1.0}
                headTrackIntensity={hero3dModel?.headTrackIntensity || 0.6}
              />
            ) : heroDisplay === "video" && heroRightVideo ? (
              (() => {
                const rvUrl = heroRightVideo.videoFile?.asset?.url || heroRightVideo.embedUrl || null;
                const rvEmbed = rvUrl && isEmbedUrl(rvUrl);
                const rvAutoplay = heroRightVideo.autoplay !== false;
                const posterUrl = heroRightVideo.posterImage
                  ? urlFor(heroRightVideo.posterImage).width(1200).height(800).url()
                  : undefined;

                if (!rvUrl) {
                  return (
                    <div
                      className="w-full h-full flex items-center justify-center text-white/20 text-sm"
                      style={{ background: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #0f2a3f)" }}
                    >
                      Upload a hero video in the CMS
                    </div>
                  );
                }

                if (rvEmbed) {
                  const ytId = getYouTubeId(rvUrl);
                  const vmId = getVimeoId(rvUrl);
                  if (ytId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=${rvAutoplay ? 1 : 0}&mute=1&loop=1&playlist=${ytId}&rel=0&controls=0`}
                        className="w-full h-full object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        style={{ border: "none" }}
                      />
                    );
                  }
                  if (vmId) {
                    return (
                      <iframe
                        src={`https://player.vimeo.com/video/${vmId}?autoplay=${rvAutoplay ? 1 : 0}&muted=1&loop=1&background=1`}
                        className="w-full h-full object-cover"
                        allow="autoplay; fullscreen"
                        style={{ border: "none" }}
                      />
                    );
                  }
                }

                return (
                  <video
                    src={rvUrl}
                    className="w-full h-full object-cover"
                    autoPlay={rvAutoplay}
                    muted
                    loop
                    playsInline
                    poster={posterUrl}
                  />
                );
              })()
            ) : heroImage ? (
              <Image
                src={urlFor(heroImage).width(1200).height(800).url()}
                alt={heroImage.alt || "Hero image"}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white/20 text-sm"
                style={{ background: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #0f2a3f)" }}
              >
                1200×800px — Hero Image
              </div>
            )}

            {/* ── Video thumbnail frame (bottom-right) ── */}
            <div className="absolute bottom-5 right-5 z-[6]">
              {/* Play badge — positioned on top-left of video thumbnail */}
              {showPlayBadge && hasVideo && videoState === "idle" && (
                <div
                  className="absolute -top-12 -left-12 z-[15]"
                  onClick={handlePlayClick}
                >
                  <RotatingBadge />
                </div>
              )}

              {videoState === "small" ? (
                /* Video playing in small thumbnail */
                <div className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/20 shadow-2xl relative">
                  {renderVideoPlayer(false)}

                  {/* Enlarge button — small corner button, doesn't block video */}
                  <button
                    onClick={handleEnlarge}
                    className="absolute top-2 right-2 z-[15] flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <Maximize2 size={12} /> Enlarge
                  </button>
                </div>
              ) : (
                /* Static thumbnail */
                secondaryThumbnail ? (
                  <div className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl">
                    <Image
                      src={urlFor(secondaryThumbnail).width(480).height(320).url()}
                      alt="Video thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-60 h-40 md:w-72 md:h-48 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center text-white/20 text-xs"
                    style={{ background: "linear-gradient(135deg, #1a2a1a, #2a3a2a)" }}
                    onClick={hasVideo ? handlePlayClick : undefined}
                  >
                    {hasVideo ? "Click play to watch" : "480×320 — Video Thumbnail"}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
