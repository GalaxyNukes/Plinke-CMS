"use client";

import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";

const maxWidthMap: Record<string, string> = {
  narrow: "640px",
  medium: "860px",
  full: "100%",
};

const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-6 rounded-[14px] overflow-hidden">
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt || "Content image"}
          width={1200}
          height={675}
          className="w-full h-auto"
        />
      </div>
    ),
  },
};

export function RichTextBlock(props: any) {
  const {
    sectionTitle,
    content,
    backgroundColor = "light",
    maxWidth = "medium",
  } = props;

  const isDark = backgroundColor === "dark";

  return (
    <section
      className="rounded-card -mt-5 relative z-[3] px-6 md:px-10 py-14"
      style={{ background: isDark ? "var(--bg-dark)" : "var(--bg-light)" }}
    >
      {isDark && <div className="grain-overlay" />}
      <div className="relative z-10 mx-auto" style={{ maxWidth: maxWidthMap[maxWidth] || "860px" }}>
        {sectionTitle && (
          <ScrollReveal>
            <h2
              className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-10"
              style={{ color: isDark ? "var(--text-primary)" : "var(--text-dark)" }}
            >
              {sectionTitle}
            </h2>
          </ScrollReveal>
        )}
        {content && (
          <ScrollReveal delay={0.1}>
            <div
              className="portable-text"
              style={{ color: isDark ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
            >
              <PortableText value={content} components={portableTextComponents} />
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
