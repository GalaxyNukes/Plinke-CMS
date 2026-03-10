import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["cdn.sanity.io", "asset.sanity.io"];
const MAX_SIZE_BYTES = 80 * 1024 * 1024; // 80 MB — generous for 3D models
const FETCH_TIMEOUT_MS = 15_000;          // 15 s

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // ── Validate URL structure ──────────────────────────────────────────────
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url param" }, { status: 400 });
  }

  if (parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only HTTPS URLs allowed" }, { status: 403 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json({ error: "URL host not allowed" }, { status: 403 });
  }

  // ── Fetch with timeout ──────────────────────────────────────────────────
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(raw, {
      headers: { "User-Agent": "noa-portfolio/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Never forward upstream error body — only normalised status
      const status = response.status >= 400 && response.status < 600
        ? response.status : 502;
      return NextResponse.json({ error: "Upstream error" }, { status });
    }

    // ── Size guard ─────────────────────────────────────────────────────────
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":  "model/gltf-binary",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        // CORS header moved to next.config.js headers() for the /api/proxy-glb route
      },
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    // Don't log or return internal error details to the client
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}
