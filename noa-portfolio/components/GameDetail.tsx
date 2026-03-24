"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ExternalLink,
  Trophy,
  Calendar,
  Users,
  Gamepad2,
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "./ui/ScrollReveal";
import { SoftwareIconList } from "./ui/SoftwareIcons";

interface GameDetailProps {
  jam: any;
  prevJam: any | null;
  nextJam: any | null;
  currentIndex: number;
  totalJams: number;
}

export function GameDetail({
  jam,
  prevJam,
  nextJam,
  currentIndex,
  totalJams,
}: GameDetailProps) {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevJam) {
        router.push(`/games/${prevJam.slug.current}`);
      } else if (e.key === "ArrowRight" && nextJam) {
        router.push(`/games/${nextJam.slug.current}`);
      } else if (e.key === "Escape") {
        router.push("/#games");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevJam, nextJam, router]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = touchStart - e.changedTouches[0].clientX;
      if (diff > 80 && nextJam) router.push(`/games/${nextJam.slug.current}`);
      else if (diff < -80 && prevJam) router.push(`/games/${prevJam.slug.current}`);
      setTouchStart(null);
    },
    [touchStart, prevJam, nextJam, router]
  );

  const displayDescription = jam.detailDescription || jam.description;

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
              href="/#games"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
            >
              <ChevronLeft size={16} /> Back to Games
            </Link>
            <span className="text-white/30 text-sm font-mono">
              {currentIndex + 1} / {totalJams}
            </span>
          </div>

          {/* Thumbnail */}
          <ScrollReveal>
            <div className="relative rounded-card overflow-hidden mb-8">
              {jam.thumbnail ? (
                <Image
                  src={urlFor(jam.thumbnail).width(1280).height(640).url()}
                  alt={jam.thumbnail.alt || jam.gameTitle}
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
                    background: "linear-gradient(135deg, #2a1a4e, #1a3a5c)",
                  }}
                >
                  Game Screenshot
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Meta badges */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-4">
              {jam.jamName && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    color: "var(--accent-secondary)",
                    borderColor: "rgba(123,97,255,0.3)",
                    background: "rgba(123,97,255,0.1)",
                  }}
                >
                  {jam.jamName}
                </span>
              )}
              {jam.genre && (
                <span className="px-3 py-1 rounded-full text-xs border border-white/15 text-white/40">
                  {jam.genre}
                </span>
              )}
              {jam.placement && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(201,251,0,0.12)", color: "var(--accent)" }}
                >
                  <Trophy size={11} /> {jam.placement}
                </span>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {jam.gameTitle}
              </h1>
              {jam.software?.length > 0 && (
                <SoftwareIconList software={jam.software} size={22} />
              )}
            </div>
          </ScrollReveal>

          {/* Role */}
          {jam.role && (
            <ScrollReveal delay={0.18}>
              <p className="text-sm font-medium mb-3" style={{ color: "var(--accent-secondary)" }}>
                {jam.role}
              </p>
            </ScrollReveal>
          )}

          {/* Description */}
          {displayDescription && (
            <ScrollReveal delay={0.2}>
              <p className="text-white/50 text-lg leading-relaxed max-w-2xl mb-6" style={{ whiteSpace: "pre-wrap" }}>
                {displayDescription}
              </p>
            </ScrollReveal>
          )}

          {/* Meta row */}
          <ScrollReveal delay={0.22}>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
              {jam.date && (
                <span className="flex items-center gap-2">
                  <Calendar size={14} /> {jam.date}
                </span>
              )}
              {jam.teamSize && (
                <span className="flex items-center gap-2">
                  <Users size={14} /> Team of {jam.teamSize}
                </span>
              )}
              {jam.platform && (
                <span className="flex items-center gap-2">
                  <Gamepad2 size={14} /> {jam.platform}
                </span>
              )}
            </div>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap gap-3">
              {jam.playLink && (
                <a
                  href={jam.playLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03]"
                  style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
                >
                  Play Game <ExternalLink size={14} />
                </a>
              )}
              {jam.videoLink && (
                <a
                  href={jam.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
                >
                  Watch Trailer <ExternalLink size={14} />
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Prev / Next Navigation ── */}
      <section
        className="rounded-card -mt-5 relative z-[3] overflow-hidden"
        style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="grain-overlay" />
        <div className="relative z-[2] grid grid-cols-2">
          {prevJam ? (
            <Link
              href={`/games/${prevJam.slug.current}`}
              className="group flex items-center gap-4 p-6 md:p-10 border-r border-white/10 hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/40 transition-all shrink-0">
                <ArrowLeft size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Previous</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {prevJam.gameTitle}
                </span>
              </div>
            </Link>
          ) : (
            <div className="p-6 md:p-10 border-r border-white/10" />
          )}

          {nextJam ? (
            <Link
              href={`/games/${nextJam.slug.current}`}
              className="group flex items-center justify-end gap-4 p-6 md:p-10 hover:bg-white/[0.03] transition-colors text-right"
            >
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Next</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {nextJam.gameTitle}
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
        <div className="text-center pb-6 relative z-[2]">
          <span className="text-white/15 text-xs">Use ← → arrow keys or swipe to navigate</span>
        </div>
      </section>
    </div>
  );
}
