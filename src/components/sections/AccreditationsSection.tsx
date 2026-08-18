import { getPageContent } from "@/lib/cms";
import AccreditationsSectionClient from "./AccreditationsSectionClient";

export default async function AccreditationsSection() {
  const content = await getPageContent("accreditations");
  return <AccreditationsSectionClient {...content} />;
}
