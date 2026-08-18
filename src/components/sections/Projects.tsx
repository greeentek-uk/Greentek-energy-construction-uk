import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const [{ projects }, content] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("projects-preview"),
  ]);
  return <ProjectsClient projects={projects} {...content} />;
}
