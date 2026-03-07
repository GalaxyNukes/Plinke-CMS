"use client";

import { Mail } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

export function ContactBlock(props: any) {
  const {
    heading = "Let's make something awesome",
    ctaLabel = "Send me an email",
    ctaLink = "mailto:hello@noaplinke.com",
    backgroundColor = "dark",
  } = props;

  const isDark = backgroundColor === "dark";

  // Split heading: last word gets accent color
  const words = heading.split(" ");
  const lastWord = words.pop();
  const restOfHeading = words.join(" ");

  return (
    <section
      className="rounded-card -mt-5 relative z-[5] py-20 px-10 text-center overflow-hidden"
      style={{ background: isDark ? "var(--bg-dark)" : "var(--bg-light)" }}
    >
      {isDark && <div className="grain-overlay" />}
      <div className="relative z-10">
        <ScrollReveal>
          <h2
            className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight"
            style={{ color: isDark ? "white" : "var(--text-dark)" }}
          >
            {restOfHeading}{" "}
            <span style={{ color: "var(--accent)" }}>{lastWord}</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03] hover:bg-white"
            style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
          >
            <Mail size={16} /> {ctaLabel}
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
