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

  // Build ordered list.
  const allOrdered: any[] =
    homepageOrder && homepageOrder.length > 0 ? homepageOrder : fallbackOrder;

  // Find current jam by _id (reliable even when slug not yet set in CMS).
  const currentIndex = allOrdered.findIndex((j: any) => j._id === jam._id);

  // Walk to nearest item with a navigable slug.
  const prevJam = (() => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (allOrdered[i].slug?.current) return allOrdered[i];
    }
    return null;
  })();
  const nextJam = (() => {
    for (let i = currentIndex + 1; i < allOrdered.length; i++) {
      if (allOrdered[i].slug?.current) return allOrdered[i];
    }
    return null;
  })();

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <GameDetail
        jam={jam}
        prevJam={prevJam}
        nextJam={nextJam}
        currentIndex={currentIndex}
        totalJams={allOrdered.length}
      />
    </main>
  );
}
