"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import { RotatingBadge } from "../ui/RotatingBadge";

const TAG_ROTATIONS = [-12, 3, -6, 8, -3, 5, -9, 4, -5, 7];

export function HeroBanner(props: any) {
  const {
    heading = "Animation that hits different",
    subtitle = "",
    heroImage,
    secondaryThumbnail,
    showPlayBadge = true,
    tags = [],
    ctaLabel = "SEND ME AN EMAIL",
    ctaLink = "#",
  } = props;

  return (
    <section
      id="home"
      className="rounded-card relative overflow-hidden pt-20"
      style={{ background: "var(--bg-dark)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="grain-overlay" />

      <div className="flex flex-col md:flex-row min-h-[75vh] relative z-[2]">
        {/* Left side */}
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

          {/* Scattered tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2.5 max-w-[500px] pt-6">
              {tags.map((tag: string, i: number) => (
                <ScrollReveal key={tag} delay={0.1 + i * 0.05}>
                  <span
                    className="inline-block px-4 py-2 rounded-full text-[13px] text-white/70 border border-white/20 backdrop-blur-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-default"
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

        {/* Right side — Hero image */}
        <div className="w-full md:w-[55%] relative p-0 md:pr-5 md:pb-5 min-h-[400px] md:min-h-[500px]">
          <div className="w-full h-full rounded-card overflow-hidden relative">
            {heroImage ? (
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

            {showPlayBadge && <RotatingBadge />}

            {/* Secondary thumbnail */}
            {secondaryThumbnail && (
              <div className="absolute bottom-5 right-5 w-60 h-40 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl z-[6]">
                <Image
                  src={urlFor(secondaryThumbnail).width(480).height(320).url()}
                  alt="Secondary thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {!secondaryThumbnail && (
              <div
                className="absolute bottom-5 right-5 w-60 h-40 rounded-[14px] overflow-hidden border-2 border-white/10 shadow-2xl z-[6] flex items-center justify-center text-white/20 text-xs"
                style={{ background: "linear-gradient(135deg, #1a2a1a, #2a3a2a)" }}
              >
                480×320 — Video Thumbnail
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
