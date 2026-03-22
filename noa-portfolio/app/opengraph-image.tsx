import { ImageResponse } from "next/og";
import { client } from "@/sanity/sanity.client";
import { siteSettingsQuery } from "@/sanity/lib/queries";

export const runtime = "edge";
export const alt = "Noa Plinke — 3D Gameplay Animator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // If a custom OG image is uploaded in the CMS, fetch it and re-serve it
  // with explicit image headers so social crawlers accept it correctly.
  try {
    if (client) {
      const settings = await client.fetch(siteSettingsQuery);
      const cmsUrl: string | null = settings?.ogImage?.asset?.url ?? null;
      if (cmsUrl) {
        const finalUrl = `${cmsUrl}?w=1200&h=630&fit=crop&auto=format&fm=png`;
        const upstream = await fetch(finalUrl);
        if (upstream.ok) {
          const buffer = await upstream.arrayBuffer();
          return new Response(buffer, {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        }
      }
    }
  } catch { /* fall through to generated image */ }

  // ── Fallback: branded generated image ─────────────────────────────────────
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0e0e10 0%, #1a1a2e 50%, #0e0e10 100%)",
          position: "relative",
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #c9fb0022 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Lime top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#c9fb00",
          }}
        />
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #7b61ff44 0%, transparent 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#c9fb00" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: "18px", fontWeight: 600, color: "#c9fb00", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              noaplinke.com
            </span>
          </div>
          <h1 style={{ fontFamily: "sans-serif", fontSize: "72px", fontWeight: 800, color: "#ffffff", lineHeight: 1.0, margin: 0, letterSpacing: "-0.02em" }}>
            Noa Plinke
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: "28px", fontWeight: 400, color: "#7b61ff", margin: 0, letterSpacing: "0.02em" }}>
            3D Gameplay Animator
          </p>
          <p style={{ fontFamily: "sans-serif", fontSize: "20px", color: "#7a7a80", margin: 0, maxWidth: "700px", lineHeight: 1.5 }}>
            Combat systems · Procedural motion · Game development
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
