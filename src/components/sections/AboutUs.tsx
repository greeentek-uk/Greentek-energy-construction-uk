import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import AboutUsClient from "./AboutUsClient";

export default async function AboutUs() {
  const [{ projects }, content] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("about-us-slide"),
  ]);
  return <AboutUsClient projects={projects} {...content} />;
}
