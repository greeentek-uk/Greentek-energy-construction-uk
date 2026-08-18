import { getPageContent } from "@/lib/cms";
import WhyChooseUsClient from "./WhyChooseUsClient";

export default async function WhyChooseUs() {
  const content = await getPageContent("home-why-choose-us");
  return <WhyChooseUsClient {...content} />;
}
