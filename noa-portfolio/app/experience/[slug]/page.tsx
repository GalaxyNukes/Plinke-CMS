import { client } from "@/sanity/sanity.client";
import { homepageTimelineEntriesQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { ExperienceDetail } from "@/components/ExperienceDetail";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  if (!client) return [];
  const entries = await client.fetch(homepageTimelineEntriesQuery);
  if (!entries) return [];
  return entries
    .filter((e: any) => e?.slug?.current)
    .map((e: any) => ({ slug: e.slug.current }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!client) return { title: "Experience" };
  const entries = await client.fetch(homepageTimelineEntriesQuery);
  const entry = entries?.find((e: any) => e?.slug?.current === params.slug);
  return {
    title: entry ? `${entry.role} — Noa Plinke` : "Experience Not Found",
    description: entry?.detailDescription || entry?.description || "",
  };
}

export default async function ExperiencePage({ params }: { params: { slug: string } }) {
  if (!client) return notFound();

  const [entries, settings] = await Promise.all([
    client.fetch(homepageTimelineEntriesQuery),
    client.fetch(siteSettingsQuery),
  ]);

  if (!entries) return notFound();

  // Only show entries that have a slug
  const sluggedEntries = entries.filter((e: any) => e?.slug?.current);
  const currentIndex = sluggedEntries.findIndex((e: any) => e.slug.current === params.slug);
  if (currentIndex === -1) return notFound();

  const entry = sluggedEntries[currentIndex];
  const prevEntry = currentIndex > 0 ? sluggedEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < sluggedEntries.length - 1 ? sluggedEntries[currentIndex + 1] : null;

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <ExperienceDetail
        entry={entry}
        prevEntry={prevEntry}
        nextEntry={nextEntry}
        currentIndex={currentIndex}
        totalEntries={sluggedEntries.length}
      />
    </main>
  );
}
