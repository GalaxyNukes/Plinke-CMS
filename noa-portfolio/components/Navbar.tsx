"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  settings: any;
}

export function Navbar({ settings }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navLinks = settings?.navLinks || [
    { label: "Home", href: "#home" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Games", href: "#games" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  const email = settings?.email || "hello@noaplinke.com";
  const siteName = settings?.siteName || "Noa Plinke";

  // On non-home pages, anchor links become /#section so the browser
  // navigates to the homepage and then scrolls to the right section.
  function resolveHref(href: string) {
    if (!href) return "/";
    if (href.startsWith("#") && !isHomePage) return `/${href}`;
    return href;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5">
      <div
        className="max-w-[1320px] mx-auto mt-4 px-6 py-3 rounded-full flex items-center justify-between"
        style={{
          background: "rgba(14,14,16,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo — always navigates to homepage */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-extrabold text-sm"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))", color: "var(--bg-dark)" }}
          >
            {siteName.charAt(0)}
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">
            {siteName.toUpperCase()}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link: any) => (
            <a
              key={link.label}
              href={resolveHref(link.href)}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.03]"
            style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bg-dark)" }} />
            Send me an email
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden max-w-[1320px] mx-auto mt-2 p-6 rounded-2xl flex flex-col gap-4"
          style={{ background: "rgba(14,14,16,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {navLinks.map((link: any) => (
            <a
              key={link.label}
              href={resolveHref(link.href)}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-base font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider mt-2"
            style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
          >
            Send me an email
          </a>
        </div>
      )}
    </nav>
  );
}
