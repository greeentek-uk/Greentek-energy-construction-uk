import { getCurrentSiteConfig } from "@/lib/cms";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const { projects } = await getCurrentSiteConfig();
  return <ProjectsClient projects={projects} />;
}
