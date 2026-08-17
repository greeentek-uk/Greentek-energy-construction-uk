import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import { getCurrentSiteConfig } from "@/lib/cms";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProjectsPageClient from "./ProjectsPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/projects", {
    title: "Our Project Gallery",
    description:
      "Explore Greentek's track record of solar PV, heat pump, insulation, and construction projects across the West Midlands and Wales.",
  });
}

export default async function ProjectsPage() {
  const { projects } = await getCurrentSiteConfig();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProjectsPageClient projects={projects} />
      <Footer />
    </div>
  );
}
