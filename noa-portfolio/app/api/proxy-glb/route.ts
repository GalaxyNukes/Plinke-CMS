import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies a .glb file from Sanity CDN to avoid CORS issues when
 * THREE.js GLTFLoader tries to fetch it directly from the browser.
 *
 * Usage: /api/proxy-glb?url=https://cdn.sanity.io/files/...
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow Sanity CDN URLs for security
  const isSanityCdn =
    url.startsWith("https://cdn.sanity.io/") ||
    url.startsWith("https://asset.sanity.io/");

  if (!isSanityCdn) {
    return NextResponse.json({ error: "Only Sanity CDN URLs allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "noa-portfolio/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream fetch failed: ${response.status}` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[proxy-glb] Error:", err);
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 500 });
  }
}
