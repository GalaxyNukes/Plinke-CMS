"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
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
  const typeOptions = ["All", "Projects", "Demoreels"];
  const categoryOptions = ["All", ...categories];

  const [activeType, setActiveType] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter logic: type first, then category
  const filtered = projects.filter((p: any) => {
    const typeMatch =
      activeType === "All" ||
      (activeType === "Projects" && (p.projectType === "Project" || !p.projectType)) ||
      (activeType === "Demoreels" && p.projectType === "Demoreel");
    const catMatch =
      activeCategory === "All" || p.categories?.includes(activeCategory);
    return typeMatch && catMatch;
  });

  return (
    <section
      id="portfolio"
      className="rounded-card -mt-5 relative z-[2] px-6 md:px-10 py-14"
      style={{ background: "var(--bg-light)" }}
    >
      <ScrollReveal>
        <h2
          className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-8"
          style={{ color: "var(--text-dark)" }}
        >
          {sectionTitle}
        </h2>
      </ScrollReveal>

      {/* Filters */}
      {showFilters && (
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {/* Type dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all"
                style={{
                  background: activeType !== "All" ? "var(--text-dark)" : "transparent",
                  color: activeType !== "All" ? "white" : "var(--text-dark)",
                  borderColor: activeType !== "All" ? "var(--text-dark)" : "#e5e7eb",
                }}
              >
                {activeType === "All" ? "Type" : activeType}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 min-w-[160px] rounded-xl overflow-hidden shadow-xl z-20 border"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  {typeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setActiveType(opt);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{
                        color:
                          activeType === opt
                            ? "var(--accent-secondary)"
                            : "var(--text-dark)",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div
              className="hidden sm:block w-px h-6"
              style={{ background: "rgba(0,0,0,0.1)" }}
            />

            {/* Category pills */}
            {categoryOptions.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  activeCategory === cat
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No projects match the selected filters.
          </p>
        </div>
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

function ProjectCard({
  project,
  delay = 0,
  large = false,
}: {
  project: any;
  delay?: number;
  large?: boolean;
}) {
  const href = project.slug?.current
    ? `/projects/${project.slug.current}`
    : project.projectLink || "#";

  return (
    <ScrollReveal delay={delay}>
      <a
        href={href}
        className="card-hover block rounded-[14px] overflow-hidden group"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="overflow-hidden rounded-[14px]">
          {project.thumbnail ? (
            <Image
              src={urlFor(project.thumbnail)
                .width(800)
                .height(large ? 400 : 320)
                .url()}
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
            {project.projectType && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    project.projectType === "Demoreel"
                      ? "rgba(201,251,0,0.12)"
                      : "rgba(123,97,255,0.12)",
                  color:
                    project.projectType === "Demoreel"
                      ? "var(--accent)"
                      : "var(--accent-secondary)",
                }}
              >
                {project.projectType}
              </span>
            )}
            {project.categories?.map((c: string) => (
              <span
                key={c}
                className="text-xs font-semibold"
                style={{ color: "var(--accent-secondary)" }}
              >
                【✦ {c}】
              </span>
            ))}
            {project.year && (
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                【{project.year}】
              </span>
            )}
          </div>
          <h3
            className="font-display text-xl font-bold mb-1"
            style={{ color: "var(--text-dark)" }}
          >
            {project.title}
          </h3>
          {project.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {project.description}
            </p>
          )}
        </div>
      </a>
    </ScrollReveal>
  );
}
