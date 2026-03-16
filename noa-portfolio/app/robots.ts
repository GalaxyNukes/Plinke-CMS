import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio/", // Keep Sanity Studio out of search index
    },
    sitemap: "https://noaplinke.com/sitemap.xml",
  };
}
