import type { Metadata } from "next";
import { client } from "@/sanity/sanity.client";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noa Plinke — 3D Gameplay Animator",
  description: "Portfolio of Noa Plinke, a 3D Gameplay Animator specializing in combat systems, procedural motion, and game development.",
};

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let themeStyle = "";
  try {
    const settings = await client.fetch(siteSettingsQuery);
    if (settings?.theme) {
      const t = settings.theme;
      themeStyle = `:root {
        ${t.bgDark?.hex ? `--bg-dark: ${t.bgDark.hex};` : ""}
        ${t.bgLight?.hex ? `--bg-light: ${t.bgLight.hex};` : ""}
        ${t.accent?.hex ? `--accent: ${t.accent.hex};` : ""}
        ${t.accentSecondary?.hex ? `--accent-secondary: ${t.accentSecondary.hex};` : ""}
      }`;
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
