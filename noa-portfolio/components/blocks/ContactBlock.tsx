"use client";

import { Mail, Download } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

export function ContactBlock(props: any) {
  const {
    heading = "Let's make something awesome",
    ctaLabel = "Send me an email",
    ctaLink = "mailto:hello@noaplinke.com",
    cvFile,
    cvLabel = "Download CV",
    backgroundColor = "dark",
  } = props;

  const isDark = backgroundColor === "dark";
  const cvUrl = cvFile?.asset?.url;

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
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03] hover:bg-white"
              style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
            >
              <Mail size={16} /> {ctaLabel}
            </a>

            {cvUrl && (
              <a
                href={cvUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03] border"
                style={{
                  background: "transparent",
                  color: isDark ? "white" : "var(--text-dark)",
                  borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
                }}
              >
                <Download size={16} /> {cvLabel}
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
