import { getPageContent } from "@/lib/cms";
import HeroSectionClient from "./HeroSectionClient";

export default async function HeroSection() {
  const content = await getPageContent("home-hero");
  return <HeroSectionClient {...content} />;
}
