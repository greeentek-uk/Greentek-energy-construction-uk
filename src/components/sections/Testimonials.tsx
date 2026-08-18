import { getPageContent } from "@/lib/cms";
import TestimonialsClient from "./TestimonialsClient";

export default async function Testimonials() {
  const content = await getPageContent("testimonials");
  return <TestimonialsClient {...content} />;
}
