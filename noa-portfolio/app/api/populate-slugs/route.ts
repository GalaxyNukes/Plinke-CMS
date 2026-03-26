import { NextResponse } from "next/server";

// One-time utility route — populates slug fields for all projects + game jams
// that don't have one yet. Protected by a secret param.
// Usage: /api/populate-slugs?secret=plinke2026
// Safe to call multiple times — skips records that already have slugs.

const SECRET      = "plinke2026";
const PROJECT_ID  = "q97sn779";
const DATASET     = "production";
const TOKEN       = process.env.SANITY_WRITE_TOKEN ||
  "skETqukSwjBCTimmXA8SwSXtUAOUQ955jhCPxRMQ3bdtTB1UZUCfNBmpOgsQucXkV5CfGwQVI2zQizc0gaVw867IXPg46hwkG9HZBzofZ8flGhjcITxDxQPlttNE40auqwKmXBErxZnaEPZSKfsdNAo8QcbEz34RYnLhzDwP9pWc2sIrHr2E";
const BASE        = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data`;

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function sanityQuery(groq: string) {
  const res = await fetch(
    `${BASE}/query/${DATASET}?query=${encodeURIComponent(groq)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  return (await res.json()).result;
}

async function setSlug(id: string, slug: string) {
  const res = await fetch(`${BASE}/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      mutations: [{ patch: { id, set: { slug: { _type: "slug", current: slug } } } }],
    }),
  });
  if (!res.ok) throw new Error(`Patch failed for ${id}: ${res.status}`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];
  const usedSlugs = new Set<string>();

  // ── Projects ──
  const projects = await sanityQuery('*[_type == "project"]{_id, title, slug}');
  for (const p of projects) {
    if (p.slug?.current) {
      usedSlugs.add(p.slug.current);
      results.push(`SKIP project: ${p.title} (already has slug: ${p.slug.current})`);
      continue;
    }
    let base = toSlug(p.title);
    let slug = base; let n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);
    await setSlug(p._id, slug);
    results.push(`SET  project: ${p.title} → ${slug}`);
  }

  // ── Game Jams ──
  const jams = await sanityQuery('*[_type == "gameJam"]{_id, gameTitle, slug}');
  const usedJamSlugs = new Set<string>();
  for (const j of jams) {
    if (j.slug?.current) {
      usedJamSlugs.add(j.slug.current);
      results.push(`SKIP game: ${j.gameTitle} (already has slug: ${j.slug.current})`);
      continue;
    }
    let base = toSlug(j.gameTitle);
    let slug = base; let n = 2;
    while (usedJamSlugs.has(slug)) slug = `${base}-${n++}`;
    usedJamSlugs.add(slug);
    await setSlug(j._id, slug);
    results.push(`SET  game: ${j.gameTitle} → ${slug}`);
  }

  return NextResponse.json({ ok: true, results });
}
