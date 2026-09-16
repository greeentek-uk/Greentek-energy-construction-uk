import { getPageContent } from "@/lib/cms";
import AboutUsClient from "./AboutUsClient";

export default async function AboutUs() {
  const content = await getPageContent("about-us-slide");
  return <AboutUsClient {...content} />;
}
