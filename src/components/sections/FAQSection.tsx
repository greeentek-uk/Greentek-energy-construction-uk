import { getPageContent } from "@/lib/cms";
import FAQSectionClient from "./FAQSectionClient";

export default async function FAQSection() {
  const content = await getPageContent("faq");
  return <FAQSectionClient {...content} />;
}
