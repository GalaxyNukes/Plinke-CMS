"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { ScrollReveal } from "../ui/ScrollReveal";

export function PortfolioGrid(props: any) {
  const {
    sectionTitle = "Portfolio",
    showFilters = true,
    projects = [],
    viewAllLink,
    settings,
  } = props;

  const categories = settings?.projectCategories || ["Procedural Animation", "Keyframe Animation", "Motion Capture"];
  const filterOptions = ["All", ...categories];
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? projects
    : projects.filter((p: any) => p.categories?.includes(active));

  return (
    <section
      id="portfolio"
      className="rounded-card -mt-5 relative z-[2] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: "var(--text-dark)" }}>
          {sectionTitle}
        </h2>
      </ScrollReveal>

      {/* Filters */}
      {showFilters && (
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-2.5 mb-10">
            {filterOptions.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  active === cat
                    ? "bg-[var(--text-dark)] text-white border-[var(--text-dark)]"
                    : "bg-transparent text-[var(--text-dark)] border-gray-200 hover:border-[var(--text-dark)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Grid — first 2 large */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {filtered.slice(0, 2).map((p: any, i: number) => (
            <ProjectCard key={p._id || i} project={p} delay={i * 0.1} large />
          ))}
        </div>
      )}

      {/* Grid — rest in 3 cols */}
      {filtered.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {filtered.slice(2).map((p: any, i: number) => (
            <ProjectCard key={p._id || i} project={p} delay={i * 0.1} />
          ))}
        </div>
      )}

      {/* View All */}
      {viewAllLink && (
        <ScrollReveal>
          <a
            href={viewAllLink}
            className="flex items-center justify-center gap-2 w-full py-5 rounded-[14px] border border-gray-200 text-sm font-bold uppercase tracking-widest hover:bg-[var(--text-dark)] hover:text-white hover:border-[var(--text-dark)] transition-all"
            style={{ color: "var(--text-dark)" }}
          >
            View All <ArrowUpRight size={16} />
          </a>
        </ScrollReveal>
      )}
    </section>
  );
}

function ProjectCard({ project, delay = 0, large = false }: { project: any; delay?: number; large?: boolean }) {
  return (
    <ScrollReveal delay={delay}>
      <a
        href={project.projectLink || "#"}
        className="card-hover block rounded-[14px] overflow-hidden group"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="overflow-hidden rounded-[14px]">
          {project.thumbnail ? (
            <Image
              src={urlFor(project.thumbnail).width(800).height(large ? 400 : 320).url()}
              alt={project.thumbnail.alt || project.title}
              width={800}
              height={large ? 400 : 320}
              className="w-full object-cover img-zoom"
              style={{ height: large ? "320px" : "240px" }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center text-white/20 text-sm img-zoom"
              style={{
                height: large ? "320px" : "240px",
                background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
              }}
            >
              800×{large ? 400 : 320} — Project Image
            </div>
          )}
        </div>
        <div className="p-4 pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {project.categories?.map((c: string) => (
              <span key={c} className="text-xs font-semibold" style={{ color: "var(--accent-secondary)" }}>
                【✦ {c}】
              </span>
            ))}
            {project.year && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>【{project.year}】</span>
            )}
          </div>
          <h3 className="font-display text-xl font-bold mb-1" style={{ color: "var(--text-dark)" }}>
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {project.description}
            </p>
          )}
        </div>
      </a>
    </ScrollReveal>
  );
}
