"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "./ui/ScrollReveal";
import { SoftwareIconList } from "./ui/SoftwareIcons";

interface ExperienceDetailProps {
  entry: any;
  prevEntry: any | null;
  nextEntry: any | null;
  currentIndex: number;
  totalEntries: number;
}

export function ExperienceDetail({
  entry,
  prevEntry,
  nextEntry,
  currentIndex,
  totalEntries,
}: ExperienceDetailProps) {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevEntry?.slug?.current) {
        router.push(`/experience/${prevEntry.slug.current}`);
      } else if (e.key === "ArrowRight" && nextEntry?.slug?.current) {
        router.push(`/experience/${nextEntry.slug.current}`);
      } else if (e.key === "Escape") {
        router.push("/#about");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevEntry, nextEntry, router]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = touchStart - e.changedTouches[0].clientX;
      if (diff > 80 && nextEntry?.slug?.current) router.push(`/experience/${nextEntry.slug.current}`);
      else if (diff < -80 && prevEntry?.slug?.current) router.push(`/experience/${prevEntry.slug.current}`);
      setTouchStart(null);
    },
    [touchStart, prevEntry, nextEntry, router]
  );

  const displayDescription = entry.detailDescription || entry.description;

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
              href="/#about"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
            >
              <ChevronLeft size={16} /> Back to Experience
            </Link>
            <span className="text-white/30 text-sm font-mono">
              {currentIndex + 1} / {totalEntries}
            </span>
          </div>

          {/* Thumbnail */}
          {entry.thumbnail && (
            <ScrollReveal>
              <div className="relative rounded-card overflow-hidden mb-8" style={{ maxHeight: "440px" }}>
                <Image
                  src={urlFor(entry.thumbnail).width(1280).height(500).fit("crop").crop("focalpoint").url()}
                  alt={entry.thumbnail.alt || `${entry.role} at ${entry.company}`}
                  width={1280}
                  height={500}
                  className="w-full object-cover rounded-card"
                  style={{ maxHeight: "440px" }}
                  priority
                />
              </div>
            </ScrollReveal>
          )}

          {/* Period badge */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.period && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ color: "var(--accent-secondary)", borderColor: "rgba(123,97,255,0.3)", background: "rgba(123,97,255,0.1)" }}
                >
                  <Calendar size={11} /> {entry.period}
                </span>
              )}
              {entry.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-white/15 text-white/40">
                  <MapPin size={11} /> {entry.location}
                </span>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {entry.role}
              </h1>
              {entry.software?.length > 0 && (
                <SoftwareIconList software={entry.software} size={22} />
              )}
            </div>
          </ScrollReveal>

          {entry.company && (
            <ScrollReveal delay={0.18}>
              <p className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
                {entry.company}
              </p>
            </ScrollReveal>
          )}

          {displayDescription && (
            <ScrollReveal delay={0.2}>
              <p className="text-white/50 text-lg leading-relaxed max-w-2xl mb-6" style={{ whiteSpace: "pre-wrap" }}>
                {displayDescription}
              </p>
            </ScrollReveal>
          )}

          {/* Highlights */}
          {entry.highlights?.length > 0 && (
            <ScrollReveal delay={0.25}>
              <ul className="flex flex-col gap-3 max-w-2xl mb-6">
                {entry.highlights.map((highlight: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 text-sm leading-relaxed">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                    {highlight}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Prev / Next Navigation ── */}
      <section
        className="rounded-card -mt-5 relative z-[3] overflow-hidden"
        style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="grain-overlay" />
        <div className="relative z-[2] grid grid-cols-2">
          {prevEntry?.slug?.current ? (
            <Link
              href={`/experience/${prevEntry.slug.current}`}
              className="group flex items-center gap-4 p-6 md:p-10 border-r border-white/10 hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/40 transition-all shrink-0">
                <ArrowLeft size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Previous</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {prevEntry.role}
                </span>
                <span className="text-white/30 text-xs truncate block">{prevEntry.company}</span>
              </div>
            </Link>
          ) : (
            <div className="p-6 md:p-10 border-r border-white/10" />
          )}

          {nextEntry?.slug?.current ? (
            <Link
              href={`/experience/${nextEntry.slug.current}`}
              className="group flex items-center justify-end gap-4 p-6 md:p-10 hover:bg-white/[0.03] transition-colors text-right"
            >
              <div className="min-w-0">
                <span className="text-white/30 text-xs uppercase tracking-wider block mb-1">Next</span>
                <span className="text-white font-display font-bold text-sm md:text-base truncate block">
                  {nextEntry.role}
                </span>
                <span className="text-white/30 text-xs truncate block">{nextEntry.company}</span>
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
