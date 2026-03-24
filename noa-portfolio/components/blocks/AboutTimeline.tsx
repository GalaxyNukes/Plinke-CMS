"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

export function AboutTimeline(props: any) {
  const {
    sectionTitle = "About",
    profilePhoto,
    bio,
    tools = [],
    timeline = [],
  } = props;

  return (
    <section
      id="about"
      className="rounded-card -mt-5 relative z-[4] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-12" style={{ color: "var(--text-dark)" }}>
          {sectionTitle}
        </h2>
      </ScrollReveal>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left — Photo + Tools */}
        <div className="w-full md:w-[38%]">
          <ScrollReveal delay={0.1}>
            <div className="w-full aspect-[4/5] rounded-card overflow-hidden mb-6 relative">
              {profilePhoto ? (
                <Image
                  src={urlFor(profilePhoto).width(600).height(750).url()}
                  alt={profilePhoto.alt || "Profile photo"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1a1a2e, #2a1a4e)" }}
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center font-display font-extrabold text-4xl"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))", color: "var(--bg-dark)" }}
                  >
                    NP
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Tools */}
          {tools.length > 0 && (
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool: string) => (
                  <span
                    key={tool}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[var(--text-dark)] hover:text-white cursor-default"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-muted)" }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Right — Bio + Timeline */}
        <div className="w-full md:w-[62%]">
          {/* Bio */}
          {bio && (
            <ScrollReveal delay={0.1}>
              <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>About Me</h3>
              <div className="portable-text mb-12" style={{ color: "var(--text-muted)" }}>
                <PortableText value={bio} />
              </div>
            </ScrollReveal>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <>
              <ScrollReveal delay={0.2}>
                <h3 className="font-display text-2xl font-bold mb-7" style={{ color: "var(--text-dark)" }}>Experience</h3>
              </ScrollReveal>

              <div className="relative pl-7 border-l-2 border-gray-200">
                {timeline.map((entry: any, i: number) => {
                  const hasSlug = !!entry.slug?.current;
                  const inner = (
                    <div className={`relative ${i < timeline.length - 1 ? "mb-9" : ""}`}>
                      {/* Dot */}
                      <div
                        className={`absolute -left-[calc(1.75rem+1px)] top-1.5 w-3.5 h-3.5 rounded-full border-[3px] ${
                          i === 0 ? "animate-pulse-accent" : ""
                        }`}
                        style={{
                          background: "var(--accent)",
                          borderColor: "var(--bg-light)",
                        }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-secondary)" }}>
                        {entry.period}
                      </span>
                      <div className="flex items-center gap-2 mt-1 mb-0.5">
                        <h4 className="font-display text-lg font-bold" style={{ color: "var(--text-dark)" }}>
                          {entry.role}
                        </h4>
                        {hasSlug && (
                          <ArrowUpRight size={15} style={{ color: "var(--text-muted)" }} className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <span className="text-sm font-semibold block mb-2" style={{ color: "var(--text-muted)" }}>
                        {entry.company}
                      </span>
                      {entry.description && (
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
                          {entry.description}
                        </p>
                      )}
                    </div>
                  );
                  return (
                    <ScrollReveal key={i} delay={0.2 + i * 0.1}>
                      {hasSlug ? (
                        <Link
                          href={`/experience/${entry.slug.current}`}
                          className="group block hover:opacity-80 transition-opacity"
                        >
                          {inner}
                        </Link>
                      ) : inner}
                    </ScrollReveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
