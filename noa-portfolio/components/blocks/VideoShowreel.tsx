"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  return match?.[1] || null;
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
}

export function VideoShowreel(props: any) {
  const {
    sectionTitle,
    videoSource,
    posterImage,
    autoplay = false,
    caption,
  } = props;

  const type = videoSource?.type || "youtube";
  const embedUrl = videoSource?.embedUrl || "";

  const renderVideo = () => {
    if (type === "youtube" && embedUrl) {
      const id = getYouTubeId(embedUrl);
      if (!id) return null;
      return (
        <iframe
          src={`https://www.youtube.com/embed/${id}${autoplay ? "?autoplay=1&mute=1" : ""}`}
          className="w-full aspect-video rounded-card"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (type === "vimeo" && embedUrl) {
      const id = getVimeoId(embedUrl);
      if (!id) return null;
      return (
        <iframe
          src={`https://player.vimeo.com/video/${id}${autoplay ? "?autoplay=1&muted=1" : ""}`}
          className="w-full aspect-video rounded-card"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      );
    }

    if (type === "upload" && videoSource?.videoFile?.asset) {
      return (
        <video
          className="w-full aspect-video rounded-card"
          controls
          autoPlay={autoplay}
          muted={autoplay}
          poster={posterImage ? urlFor(posterImage).width(1280).height(720).url() : undefined}
        >
          <source src={videoSource.videoFile.asset.url} />
        </video>
      );
    }

    // Placeholder
    return (
      <div
        className="w-full aspect-video rounded-card flex items-center justify-center text-white/20 text-sm"
        style={{ background: "linear-gradient(135deg, #0a0a1a, #1a1a3a)" }}
      >
        Video Showreel — Add a YouTube URL, Vimeo URL, or upload a video file
      </div>
    );
  };

  return (
    <section
      className="rounded-card -mt-5 relative z-[3] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      {sectionTitle && (
        <ScrollReveal>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-10" style={{ color: "var(--text-dark)" }}>
            {sectionTitle}
          </h2>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.1}>
        {renderVideo()}
      </ScrollReveal>

      {caption && (
        <ScrollReveal delay={0.2}>
          <p className="text-center mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            {caption}
          </p>
        </ScrollReveal>
      )}
    </section>
  );
}
