"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";

export function Testimonials(props: any) {
  const { sectionTitle = "What people say", quotes = [] } = props;

  return (
    <section
      className="rounded-card -mt-5 relative z-[3] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-10" style={{ color: "var(--text-dark)" }}>
          {sectionTitle}
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((q: any, i: number) => (
          <ScrollReveal key={q._id || i} delay={i * 0.1}>
            <div
              className="card-hover rounded-[14px] p-6 border border-black/5 relative"
              style={{ background: "var(--bg-card)" }}
            >
              <Quote
                size={32}
                className="absolute top-5 right-5 opacity-10"
                style={{ color: "var(--accent-secondary)" }}
              />
              <p className="text-base leading-relaxed mb-6 relative z-10" style={{ color: "var(--text-dark)" }}>
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {q.avatar ? (
                  <Image
                    src={urlFor(q.avatar).width(80).height(80).url()}
                    alt={q.author}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))", color: "var(--bg-dark)" }}
                  >
                    {q.author?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-dark)" }}>{q.author}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {q.role}{q.company ? ` — ${q.company}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
