import { client } from "@/sanity/sanity.client";
import {
  gameJamBySlugQuery,
  allGameJamSlugsQuery,
  homepageGameOrderQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import { GameDetail } from "@/components/GameDetail";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  if (!client) return [];
  const jams = await client.fetch(allGameJamSlugsQuery);
  return jams
    .filter((j: any) => j.slug?.current)
    .map((j: any) => ({ slug: j.slug.current }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!client) return { title: "Game" };
  const jam = await client.fetch(gameJamBySlugQuery, { slug: params.slug });
  return {
    title: jam ? `${jam.gameTitle} — Noa Plinke` : "Game Not Found",
    description: jam?.detailDescription || jam?.description || "",
  };
}

export default async function GamePage({ params }: { params: { slug: string } }) {
  if (!client) return notFound();

  const [jam, homepageOrder, fallbackOrder, settings] = await Promise.all([
    client.fetch(gameJamBySlugQuery, { slug: params.slug }),
    client.fetch(homepageGameOrderQuery),
    client.fetch(allGameJamSlugsQuery),
    client.fetch(siteSettingsQuery),
  ]);

  if (!jam) return notFound();

  // Use homepage gameJamsGrid order; fall back to date-desc
  const orderedJams: any[] =
    homepageOrder && homepageOrder.length > 0 ? homepageOrder : fallbackOrder;

  const currentIndex = orderedJams.findIndex(
    (j: any) => j.slug?.current === params.slug
  );
  const prevJam = currentIndex > 0 ? orderedJams[currentIndex - 1] : null;
  const nextJam =
    currentIndex < orderedJams.length - 1 ? orderedJams[currentIndex + 1] : null;

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <GameDetail
        jam={jam}
        prevJam={prevJam}
        nextJam={nextJam}
        currentIndex={currentIndex}
        totalJams={orderedJams.length}
      />
    </main>
  );
}
