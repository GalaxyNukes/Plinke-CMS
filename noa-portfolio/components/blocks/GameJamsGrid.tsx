"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Calendar, Users, ExternalLink, Gamepad2 } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SoftwareIconList } from "../ui/SoftwareIcons";
import { CollapsibleText } from "../ui/CollapsibleText";

function JamCard({ jam, delay = 0, large = false }: { jam: any; delay?: number; large?: boolean }) {
  const aspectClass = large ? "aspect-video" : "aspect-[4/3]";
  const hasSlug = !!jam.slug?.current;

  const cardInner = (
    <div
      className="card-hover rounded-[14px] overflow-hidden border border-black/5 h-full"
      style={{ background: "var(--bg-card)" }}
    >
      {/* Thumbnail */}
      <div className={`relative w-full overflow-hidden ${aspectClass}`}>
        {jam.thumbnail ? (
          <Image
            src={urlFor(jam.thumbnail).width(800).height(large ? 450 : 600).fit("crop").crop("focalpoint").url()}
            alt={jam.thumbnail.alt || jam.gameTitle}
            fill
            className="object-cover img-zoom"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-white/20 text-sm"
            style={{ background: "linear-gradient(135deg, #2a1a4e, #1a3a5c)" }}
          >
            Game Screenshot
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Top line: jam name + placement badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            {jam.jamName && (
              <span className="text-xs font-bold uppercase tracking-wider leading-tight" style={{ color: "var(--accent-secondary)" }}>
                {jam.jamName}
              </span>
            )}
            {jam.jamName && jam.genre && (
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                · {jam.genre}
              </span>
            )}
            {!jam.jamName && jam.genre && (
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {jam.genre}
              </span>
            )}
          </div>
          {jam.placement && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
              style={{ background: "rgba(201,251,0,0.1)", color: "var(--text-dark)" }}
            >
              <Trophy size={11} /> {jam.placement}
            </span>
          )}
        </div>

        {/* Title + software icons */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-display font-bold leading-tight ${large ? "text-2xl" : "text-xl"}`}
            style={{ color: "var(--text-dark)" }}
          >
            {jam.gameTitle}
          </h3>
          {jam.software?.length > 0 && (
            <div className="shrink-0 pt-0.5">
              <SoftwareIconList software={jam.software} size={18} />
            </div>
          )}
        </div>

        {/* Role */}
        {jam.role && (
          <p className="text-xs font-medium -mt-1" style={{ color: "var(--accent-secondary)" }}>
            {jam.role}
          </p>
        )}

        {/* Description */}
        {jam.description && (
          <CollapsibleText
            text={jam.description}
            wordLimit={20}
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          />
        )}

        {/* Meta + links */}
        <div className="flex flex-wrap justify-between items-center gap-y-2 mt-auto pt-1">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {jam.date && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Calendar size={13} /> {jam.date}
              </span>
            )}
            {jam.teamSize && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Users size={13} /> {jam.teamSize}
              </span>
            )}
            {jam.platform && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Gamepad2 size={13} /> {jam.platform}
              </span>
            )}
          </div>
          <div className="flex gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            {jam.playLink && (
              <a
                href={jam.playLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-dark)" }}
              >
                Play <ExternalLink size={13} />
              </a>
            )}
            {jam.videoLink && (
              <a
                href={jam.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-70 transition-opacity"
                style={{ color: "var(--accent-secondary)" }}
              >
                Watch <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ScrollReveal delay={delay}>
      {hasSlug ? (
        <Link href={`/games/${jam.slug.current}`} className="block h-full">
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </ScrollReveal>
  );
}

export function GameJamsGrid(props: any) {
  const { sectionTitle = "Games", jams = [] } = props;

  return (
    <section
      id="games"
      className="rounded-card -mt-5 relative z-[3] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2
          className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-10"
          style={{ color: "var(--text-dark)" }}
        >
          {sectionTitle}
        </h2>
      </ScrollReveal>

      {/* First 2 — large featured cards */}
      {jams.slice(0, 2).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {jams.slice(0, 2).map((jam: any, i: number) => (
            <JamCard key={jam._id || i} jam={jam} delay={i * 0.1} large />
          ))}
        </div>
      )}

      {/* Remaining — 3-column grid */}
      {jams.slice(2).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {jams.slice(2).map((jam: any, i: number) => (
            <JamCard key={jam._id || i} jam={jam} delay={i * 0.1} />
          ))}
        </div>
      )}
    </section>
  );
}
