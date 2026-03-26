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

  // Use homepage portfolioGrid order; fall back to year-desc if not set up yet.
  // Always exclude demoreels — they should not appear in project prev/next navigation.
  const orderedProjects: any[] = (
    homepageOrder && homepageOrder.length > 0 ? homepageOrder : fallbackOrder
  ).filter((p: any) => p.projectType !== "Demoreel");

  const currentIndex = orderedProjects.findIndex(
    (p: any) => p.slug?.current === params.slug
  );
  const prevProject = currentIndex > 0 ? orderedProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < orderedProjects.length - 1 ? orderedProjects[currentIndex + 1] : null;

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <ProjectDetail
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        currentIndex={currentIndex}
        totalProjects={orderedProjects.length}
      />
    </main>
  );
}
