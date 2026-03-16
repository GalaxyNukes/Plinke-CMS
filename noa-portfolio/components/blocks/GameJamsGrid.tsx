"use client";

import Image from "next/image";
import { Trophy, Calendar, Users, ExternalLink, Gamepad2 } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SoftwareIconList } from "../ui/SoftwareIcons";
import { CollapsibleText } from "../ui/CollapsibleText";

function JamCard({ jam, delay = 0, large = false }: { jam: any; delay?: number; large?: boolean }) {
  const imgH = large ? 320 : 240;
  const imgSrcH = large ? 400 : 280;

  return (
    <ScrollReveal delay={delay}>
      <div
        className="card-hover rounded-[14px] overflow-hidden border border-black/5 h-full"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Thumbnail */}
        <div className="overflow-hidden">
          {jam.thumbnail ? (
            <Image
              src={urlFor(jam.thumbnail).width(800).height(imgSrcH).url()}
              alt={jam.thumbnail.alt || jam.gameTitle}
              width={800}
              height={imgSrcH}
              className={`w-full object-cover img-zoom`}
              style={{ height: `${imgH}px` }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center text-white/20 text-sm img-zoom"
              style={{ height: `${imgH}px`, background: "linear-gradient(135deg, #2a1a4e, #1a3a5c)" }}
            >
              800×{imgSrcH} — Game Screenshot
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Top line: jam name + placement badge */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {jam.jamName && (
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-secondary)" }}>
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(201,251,0,0.1)", color: "var(--text-dark)" }}
              >
                <Trophy size={12} /> {jam.placement}
              </span>
            )}
          </div>

          {/* Title + software icons */}
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3
              className={`font-display font-bold ${large ? "text-2xl" : "text-xl"}`}
              style={{ color: "var(--text-dark)" }}
            >
              {jam.gameTitle}
            </h3>
            {jam.software?.length > 0 && (
              <SoftwareIconList software={jam.software} size={18} />
            )}
          </div>

          {/* Role */}
          {jam.role && (
            <p className="text-xs font-medium mb-2" style={{ color: "var(--accent-secondary)" }}>
              {jam.role}
            </p>
          )}

          {jam.description && (
            <CollapsibleText
              text={jam.description}
              wordLimit={20}
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--text-muted)" }}
            />
          )}

          {/* Meta + links */}
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-3">
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
            <div className="flex gap-3">
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
