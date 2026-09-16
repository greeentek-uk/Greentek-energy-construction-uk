import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { DEFAULT_PROJECT_COUNT } from "@/data/pageContent";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const [{ projects }, content] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("projects-preview"),
  ]);
  // Sliced here rather than in the client component so the extra cards are
  // never sent to the browser or rendered into the HTML at all.
  const limit = content.projectCount || DEFAULT_PROJECT_COUNT;

  return <ProjectsClient projects={projects.slice(0, limit)} {...content} />;
}
