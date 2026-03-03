"use client";

import Image from "next/image";
import { Trophy, Calendar, Users, ExternalLink } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";

export function GameJamsGrid(props: any) {
  const { sectionTitle = "Game Jams", jams = [] } = props;

  return (
    <section
      id="gamejams"
      className="rounded-card -mt-5 relative z-[3] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-10" style={{ color: "var(--text-dark)" }}>
          {sectionTitle}
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jams.map((jam: any, i: number) => (
          <ScrollReveal key={jam._id || i} delay={i * 0.1}>
            <div
              className="card-hover rounded-[14px] overflow-hidden border border-black/5"
              style={{ background: "var(--bg-card)" }}
            >
              {/* Thumbnail */}
              <div className="overflow-hidden">
                {jam.thumbnail ? (
                  <Image
                    src={urlFor(jam.thumbnail).width(600).height(280).url()}
                    alt={jam.thumbnail.alt || jam.gameTitle}
                    width={600}
                    height={280}
                    className="w-full h-[200px] object-cover img-zoom"
                  />
                ) : (
                  <div
                    className="w-full h-[200px] flex items-center justify-center text-white/20 text-sm img-zoom"
                    style={{ background: "linear-gradient(135deg, #2a1a4e, #1a3a5c)" }}
                  >
                    600×400 — Game Screenshot
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Jam name + placement */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-secondary)" }}>
                    {jam.jamName}
                  </span>
                  {jam.placement && (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(201,251,0,0.1)", color: "var(--text-dark)" }}
                    >
                      <Trophy size={12} /> {jam.placement}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                  {jam.gameTitle}
                </h3>

                {jam.description && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                    {jam.description}
                  </p>
                )}

                {/* Meta + play link */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
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
                  </div>
                  {jam.playLink && (
                    <a
                      href={jam.playLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-70 transition-opacity"
                      style={{ color: "var(--text-dark)" }}
                    >
                      Play it <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
