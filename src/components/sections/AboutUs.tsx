import { getCurrentSiteConfig } from "@/lib/cms";
import AboutUsClient from "./AboutUsClient";

export default async function AboutUs() {
  const { projects } = await getCurrentSiteConfig();
  return <AboutUsClient projects={projects} />;
}
