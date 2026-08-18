import { getPageContent } from "@/lib/cms";
import WhyUsClient from "./WhyUsClient";

export default async function WhyUs() {
  const content = await getPageContent("why-us");
  return <WhyUsClient {...content} />;
}
