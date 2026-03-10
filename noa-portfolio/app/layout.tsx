import type { Metadata } from "next";
import { client } from "@/sanity/sanity.client";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noa Plinke — 3D Gameplay Animator",
  description: "Portfolio of Noa Plinke, a 3D Gameplay Animator specializing in combat systems, procedural motion, and game development.",
};

export const revalidate = 60;

/** Sanitise a value that will be embedded inside a CSS :root {} block.
 *  Only allow valid hex colours — strip anything else entirely. */
function safeCssHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Strict: must be exactly #rrggbb or #rrggbbaa
  if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) return value;
  return null;
}

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
      </head>
      <body>{children}</body>
    </html>
  );
}
