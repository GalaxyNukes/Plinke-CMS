import { MetadataRoute } from "next";
import { client } from "@/sanity/sanity.client";
import { groq } from "next-sanity";

const BASE_URL = "https://noaplinke.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // Dynamic project routes (if /projects/[slug] pages exist)
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    if (client) {
      const projects = await client.fetch<{ slug: string; _updatedAt: string }[]>(
        groq`*[_type == "project" && defined(slug.current)]{
          "slug": slug.current,
          _updatedAt
        }`
      );
      projectRoutes = projects.map((p) => ({
        url: `${BASE_URL}/projects/${p.slug}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // CMS unavailable during build — skip dynamic routes
  }

  // Dynamic game jam routes
  let gameRoutes: MetadataRoute.Sitemap = [];
  try {
    if (client) {
      const jams = await client.fetch<{ slug: string; _updatedAt: string }[]>(
        groq`*[_type == "gameJam" && defined(slug.current)]{
          "slug": slug.current,
          _updatedAt
        }`
      );
      gameRoutes = jams.map((j) => ({
        url: `${BASE_URL}/games/${j.slug}`,
        lastModified: new Date(j._updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // CMS unavailable during build — skip dynamic routes
  }

  return [...staticRoutes, ...projectRoutes, ...gameRoutes];
}
