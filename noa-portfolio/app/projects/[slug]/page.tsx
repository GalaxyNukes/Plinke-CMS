import { client } from "@/sanity/sanity.client";
import {
  projectBySlugQuery,
  allProjectSlugsQuery,
  homepageProjectOrderQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import { ProjectDetail } from "@/components/ProjectDetail";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  if (!client) return [];
  const projects = await client.fetch(allProjectSlugsQuery);
  return projects
    .filter((p: any) => p.slug?.current)
    .map((p: any) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!client) return { title: "Project" };
  const project = await client.fetch(projectBySlugQuery, { slug: params.slug });
  return {
    title: project ? `${project.title} — Noa Plinke` : "Project Not Found",
    description: project?.detailDescription || project?.description || "",
  };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  if (!client) return notFound();

  const [project, homepageOrder, fallbackOrder, settings] = await Promise.all([
    client.fetch(projectBySlugQuery, { slug: params.slug }),
    client.fetch(homepageProjectOrderQuery),
    client.fetch(allProjectSlugsQuery),
    client.fetch(siteSettingsQuery),
  ]);

  if (!project) return notFound();

  // Build ordered list, exclude demoreels from navigation.
  const allOrdered: any[] =
    (homepageOrder && homepageOrder.length > 0 ? homepageOrder : fallbackOrder)
      .filter((p: any) => p.projectType !== "Demoreel");

  // Find current project by _id (reliable even when slug not yet set in CMS).
  const currentIndex = allOrdered.findIndex((p: any) => p._id === project._id);

  // Walk backwards/forwards to find the nearest item that has a navigable slug.
  const prevProject = (() => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (allOrdered[i].slug?.current) return allOrdered[i];
    }
    return null;
  })();
  const nextProject = (() => {
    for (let i = currentIndex + 1; i < allOrdered.length; i++) {
      if (allOrdered[i].slug?.current) return allOrdered[i];
    }
    return null;
  })();

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <ProjectDetail
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        currentIndex={currentIndex}
        totalProjects={allOrdered.length}
      />
    </main>
  );
}
