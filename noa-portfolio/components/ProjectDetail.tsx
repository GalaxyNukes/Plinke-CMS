"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ExternalLink, Play } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { SoftwareIconList } from "./ui/SoftwareIcons";

function getVideoUrl(video: any): string | null {
  if (!video) return null;
  if (video.videoFile?.asset?.url) return video.videoFile.asset.url;
  if (video.embedUrl) return video.embedUrl;
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

interface ProjectDetailProps {
  project: any;
  prevProject: any | null;
  nextProject: any | null;
  currentIndex: number;
  totalProjects: number;
}

export function ProjectDetail({
  project,
  prevProject,
  nextProject,
  currentIndex,
  totalProjects,
}: ProjectDetailProps) {
  const router = useRouter();
  const videoUrl = getVideoUrl(project.video);
  const [showVideo, setShowVideo] = useState(!!videoUrl);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevProject) {
        router.push(`/projects/${prevProject.slug.current}`);
      } else if (e.key === "ArrowRight" && nextProject) {
        router.push(`/projects/${nextProject.slug.current}`);
      } else if (e.key === "Escape") {
        router.push("/#portfolio");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevProject, nextProject, router]);

  // Touch/swipe detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = touchStart - e.changedTouches[0].clientX;
      const threshold = 80;
      if (diff > threshold && nextProject) {
        router.push(`/projects/${nextProject.slug.current}`);
      } else if (diff < -threshold && prevProject) {
        router.push(`/projects/${prevProject.slug.current}`);
      }
      setTouchStart(null);
    },
    [touchStart, prevProject, nextProject, router]
  );

  // Render video
  const renderVideo = () => {
    if (!videoUrl) return null;

    const ytId = getYouTubeId(videoUrl);
    if (ytId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&mute=1&rel=0&playlist=${ytId}`}
          className="w-full aspect-video rounded-card"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        />
      );
    }

    const vmId = getVimeoId(videoUrl);
    if (vmId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vmId}?autoplay=1&loop=1&muted=1`}
          className="w-full aspect-video rounded-card"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ border: "none" }}
        />
      );
    }

    // Direct file
    return (
      <video
        src={videoUrl}
        className="w-full aspect-video rounded-card"
        controls
        autoPlay
        loop
        muted
        playsInline
      />
    );
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Hero section ── */}
      <section
        className="rounded-card relative overflow-hidden pt-24 pb-10"
        style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="grain-overlay" />

        <div className="relative z-[2] px-6 md:px-10">
          {/* Back link + counter */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/#portfolio"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
            >
              <ChevronLeft size={16} /> Back to Portfolio
            </Link>
            <span className="text-white/30 text-sm font-mono">
              {currentIndex + 1} / {totalProjects}
            </span>
          </div>

          {/* Media: video or image */}
          <ScrollReveal>
            <div className="relative rounded-card overflow-hidden mb-8">
              {showVideo && videoUrl ? (
                renderVideo()
              ) : (
                <div className="relative">
                  {project.thumbnail ? (
                    <Image
                      src={urlFor(project.thumbnail).width(1280).height(640).url()}
                      alt={project.thumbnail.alt || project.title}
                      width={1280}
                      height={640}
                      className="w-full object-cover rounded-card"
                      style={{ maxHeight: "540px" }}
                      priority
                    />
                  ) : (
                    <div
                      className="w-full rounded-card flex items-center justify-center text-white/20 text-sm"
                      style={{
                        height: "400px",
                        background: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #0f2a3f)",
                      }}
                    >
                      Project Image
                    </div>
                  )}

                  {/* Play button overlay */}
                  {videoUrl && !showVideo && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors rounded-card group"
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        <Play size={32} fill="white" color="white" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Project info */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.categories?.map((c: string) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    color: "var(--accent-secondary)",
                    borderColor: "rgba(123,97,255,0.3)",
                    background: "rgba(123,97,255,0.1)",
                  }}
                >
                  {c}
                </span>
              ))}
              {project.year && (
                <span className="px-3 py-1 rounded-full text-xs border border-white/15 text-white/40">
                  {project.year}
                </span>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
              {project.software?.length > 0 && (
                <SoftwareIconList software={project.software} size={22} />
              )}
            </div>
          </ScrollReveal>

          {(project.detailDescription || project.description) && (
            <ScrollReveal delay={0.2}>
              <p className="text-white/50 text-lg leading-relaxed max-w-2xl mb-6">
                {project.detailDescription || project.description}
              </p>
            </ScrollReveal>
          )}

          {project.projectLink && (
            <ScrollReveal delay={0.25}>
              <a
                href={project.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03]"
                style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
              >
                View Project <ExternalLink size={14} />
              </a>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Case Study Content ── */}
      {project.caseStudyContent && project.caseStudyContent.length > 0 && (
        <section
          className="rounded-card -mt-5 relative z-[2] px-6 md:px-10 py-14"
          style={{ background: "var(--bg-light)" }}
        >
          <ScrollReveal>
            <div className="max-w-3xl mx-auto portable-text" style={{ color: "var(--text-dark)" }}>
              <PortableText
                value={project.caseStudyContent}
                components={{
                  types: {
                    image: ({ value }: any) => (
                      <div className="my-8 rounded-[14px] overflow-hidden">
                        <Image
                          src={urlFor(value).width(900).url()}
                          alt={value.alt || ""}
                          width={900}
                          height={500}
                          className="w-full object-cover"
                        />
                      </div>
                    ),
                  },
                }}
              />
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ── Prev / Next Navigation ── */}
      <section
        className="rounded-card -mt-5 relative z-[3] overflow-hidden"
        style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="grain-overlay" />
        <div className="relative z-[2] grid grid-cols-2">
          {/* Previous */}
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug.current}`}
              className="group flex items-center gap-4 p-6 md:p-10 border-r border-white/10 hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/40 transition-all shrink-0">
                <ArrowLeft size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Previous</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {prevProject.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="p-6 md:p-10 border-r border-white/10" />
          )}

          {/* Next */}
          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug.current}`}
              className="group flex items-center justify-end gap-4 p-6 md:p-10 hover:bg-white/[0.03] transition-colors text-right"
            >
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Next</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {nextProject.title}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/40 transition-all shrink-0">
                <ArrowRight size={18} />
              </div>
            </Link>
          ) : (
            <div className="p-6 md:p-10" />
          )}
        </div>

        {/* Keyboard hint */}
        <div className="text-center pb-6 relative z-[2]">
          <span className="text-white/15 text-xs">
            Use ← → arrow keys or swipe to navigate
          </span>
        </div>
      </section>
    </div>
  );
}
