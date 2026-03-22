import type { Metadata } from "next";
import { client } from "@/sanity/sanity.client";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let themeStyle = "";
  try {
    if (!client) throw new Error("CMS not connected");
    const settings = await client.fetch(siteSettingsQuery);
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
  } catch (e) {
    // CMS not connected yet — defaults from globals.css are used
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
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
      <body>{children}</body>
    </html>
  );
}
