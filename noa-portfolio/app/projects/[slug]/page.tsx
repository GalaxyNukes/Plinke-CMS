import { client } from "@/sanity/sanity.client";
import { projectBySlugQuery, allProjectSlugsQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { ProjectDetail } from "@/components/ProjectDetail";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";

export const revalidate = 60;

// Generate static paths for all projects
export async function generateStaticParams() {
  if (!client) return [];
  const projects = await client.fetch(allProjectSlugsQuery);
  return projects
    .filter((p: any) => p.slug?.current)
    .map((p: any) => ({ slug: p.slug.current }));
}

// Dynamic metadata per project
export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!client) return { title: "Project" };
  const project = await client.fetch(projectBySlugQuery, { slug: params.slug });
  return {
    title: project ? `${project.title} — Noa Plinke` : "Project Not Found",
    description: project?.description || "",
  };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  if (!client) return notFound();

  const [project, allProjects, settings] = await Promise.all([
    client.fetch(projectBySlugQuery, { slug: params.slug }),
    client.fetch(allProjectSlugsQuery),
    client.fetch(siteSettingsQuery),
  ]);

  if (!project) return notFound();

  // Find current index and compute prev/next
  const currentIndex = allProjects.findIndex(
    (p: any) => p.slug?.current === params.slug
  );
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <ProjectDetail
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        currentIndex={currentIndex}
        totalProjects={allProjects.length}
      />
    </main>
  );
}
