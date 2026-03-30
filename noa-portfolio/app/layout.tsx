import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { client } from "@/sanity/sanity.client";
import { buildGoogleFontsUrl, DISPLAY_FONTS, BODY_FONTS } from "@/sanity/lib/fontData";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import "./globals.css";

// ── Site-wide metadata (dynamic — picks up CMS OG image if set) ─────────────
export async function generateMetadata(): Promise<Metadata> {
  let ogImageUrl: string | null = null;
  let description = "Portfolio of Noa Plinke, a 3D Gameplay Animator specializing in combat systems, procedural motion, and game development.";
  try {
    if (client) {
      const settings = await client.fetch(siteSettingsQuery);
      ogImageUrl = settings?.ogImage?.asset?.url ?? null;
      if (settings?.siteDescription) description = settings.siteDescription;
    }
  } catch { /* fall through to defaults */ }

  const images = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630, alt: "Noa Plinke — 3D Gameplay Animator" }]
    : undefined; // falls back to /opengraph-image auto-generated route

  return {
    metadataBase: new URL("https://noaplinke.com"),
    title: {
      default: "Noa Plinke — 3D Gameplay Animator",
      template: "%s | Noa Plinke",
    },
    description,
    keywords: [
      "3D Gameplay Animator",
      "Gameplay Animation",
      "Procedural Animation",
      "Combat Animation",
      "Unreal Engine",
      "Maya",
      "Game Development",
      "Motion Capture",
      "Noa Plinke",
    ],
    authors: [{ name: "Noa Plinke", url: "https://noaplinke.com" }],
    creator: "Noa Plinke",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://noaplinke.com",
      siteName: "Noa Plinke — 3D Gameplay Animator",
      title: "Noa Plinke — 3D Gameplay Animator",
      description,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: "Noa Plinke — 3D Gameplay Animator",
      description,
      creator: "@noaplinke",
      ...(images && { images: images.map(i => i.url) }),
    },
    alternates: {
      canonical: "https://noaplinke.com",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const revalidate = 60;

/** Sanitise a value that will be embedded inside a CSS :root {} block.
 *  Only allow valid hex colours — strip anything else entirely. */
function safeCssHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) return value;
  return null;
}

// ── JSON-LD structured data ──────────────────────────────────────────────────
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Noa Plinke",
  url: "https://noaplinke.com",
  jobTitle: "3D Gameplay Animator",
  description:
    "3D Gameplay Animator specializing in combat systems, procedural motion, and game development.",
  knowsAbout: [
    "3D Animation",
    "Gameplay Animation",
    "Procedural Animation",
    "Combat Systems",
    "Unreal Engine",
    "Maya",
    "Motion Capture",
    "Game Development",
  ],
  sameAs: [
    "https://www.linkedin.com/in/noaplinke",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Noa Plinke — 3D Gameplay Animator",
  url: "https://noaplinke.com",
  description:
    "Portfolio of Noa Plinke, a 3D Gameplay Animator specializing in combat systems, procedural motion, and game development.",
  author: {
    "@type": "Person",
    name: "Noa Plinke",
  },
};

/** Sanitise a font family name — only allow letters, numbers, spaces */
function safeFontFamily(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^[a-zA-Z0-9 ]+$/.test(value.trim())) return value.trim();
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let themeStyle = "";
  let displayFontFamily = "Syne";
  let bodyFontFamily = "DM Sans";
  let fontsUrl = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";
  let customFontFaces = ""; // @font-face rules for uploaded fonts

  try {
    if (!client) throw new Error("CMS not connected");
    const settings = await client.fetch(siteSettingsQuery);

    // Theme colours
    if (settings?.theme) {
      const t = settings.theme;
      const vars: string[] = [];
      const bgDark          = safeCssHex(t.bgDark?.hex);
      const bgLight         = safeCssHex(t.bgLight?.hex);
      const accent          = safeCssHex(t.accent?.hex);
      const accentSecondary = safeCssHex(t.accentSecondary?.hex);
      if (bgDark)          vars.push(`--bg-dark: ${bgDark};`);
      if (bgLight)         vars.push(`--bg-light: ${bgLight};`);
      if (accent)          vars.push(`--accent: ${accent};`);
      if (accentSecondary) vars.push(`--accent-secondary: ${accentSecondary};`);
      if (vars.length) themeStyle = `:root { ${vars.join(" ")} }`;
    }

    // Typography — handle Google Fonts, bundled fonts, and custom uploaded fonts
    const df = settings?.displayFont;
    const bf = settings?.bodyFont;

    const googleFontsNeeded: { family: string; weights: number[] }[] = [];

    // Bundled fonts served from /public/fonts
    const BUNDLED_FONTS: Record<string, { name: string; file: string; format: string }> = {
      "__bundled__broyek":   { name: "Broyek",          file: "/fonts/Broyek-Regular.ttf",   format: "truetype" },
      "__bundled__froople":  { name: "Froople",          file: "/fonts/Froople.ttf",          format: "truetype" },
      "__bundled__juancock": { name: "Juan Cock",        file: "/fonts/JuanCock.otf",         format: "opentype" },
      "__bundled__juturu":   { name: "Juturu",           file: "/fonts/Juturu-VariableVF.ttf",format: "truetype" },
      "__bundled__mocha":    { name: "Mocha",            file: "/fonts/Mocha.otf",            format: "opentype" },
      "__bundled__nority":   { name: "Nority Display",  file: "/fonts/Nority-Display.otf",   format: "opentype" },
      "__bundled__roketto":  { name: "Roketto",          file: "/fonts/Roketto.ttf",          format: "truetype" },
      "__bundled__shoutback":{ name: "ShoutBack",        file: "/fonts/ShoutBack-Regular.otf",format: "opentype" },
    };

    function resolveFontSlot(slot: any, defaultFamily: string, fonts: typeof DISPLAY_FONTS) {
      const family: string = slot?.family || defaultFamily;

      if (BUNDLED_FONTS[family]) {
        const b = BUNDLED_FONTS[family];
        customFontFaces += `@font-face { font-family: '${b.name}'; src: url('${b.file}') format('${b.format}'); font-weight: 100 900; font-display: swap; }\n`;
        return b.name;
      }
      if (family === "__custom__") {
        const name = safeFontFamily(slot?.customName);
        const url  = slot?.customFile?.asset?.url;
        if (name && url) {
          const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
          const fmt = ext === "woff2" ? "woff2" : ext === "woff" ? "woff" : ext === "ttf" ? "truetype" : "opentype";
          customFontFaces += `@font-face { font-family: '${name}'; src: url('${url}') format('${fmt}'); font-weight: 100 900; font-display: swap; }\n`;
          return name;
        }
        return defaultFamily;
      }
      if (family === "__sep__" || family === "__sep2__") return defaultFamily;
      const raw = safeFontFamily(family);
      if (raw) {
        const info = fonts.find(f => f.value === raw);
        googleFontsNeeded.push({ family: raw, weights: info?.weights ?? [400, 600, 700, 800] });
        return raw;
      }
      return defaultFamily;
    }

    displayFontFamily = resolveFontSlot(df, "Syne", DISPLAY_FONTS);
    bodyFontFamily    = resolveFontSlot(bf, "DM Sans", BODY_FONTS);

    if (googleFontsNeeded.length > 0) {
      fontsUrl = buildGoogleFontsUrl(googleFontsNeeded);
    } else {
      fontsUrl = ""; // all fonts are local, no Google Fonts needed
    }
  } catch (e) {
    // CMS not connected yet — defaults used
  }

  // Merge font CSS variables into :root style
  const fontVars = `--font-display: '${displayFontFamily}'; --font-body: '${bodyFontFamily}';`;
  const rootStyle = themeStyle
    ? themeStyle.replace(":root {", `:root { ${fontVars}`)
    : `:root { ${fontVars} }`;
  const fullStyle = customFontFaces + rootStyle;
  return (
    <html lang="en">
      <head>
        {fontsUrl && <link rel="preconnect" href="https://fonts.googleapis.com" />}
        {fontsUrl && <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />}
        {fontsUrl && <link href={fontsUrl} rel="stylesheet" />}
        <style dangerouslySetInnerHTML={{ __html: fullStyle }} />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
