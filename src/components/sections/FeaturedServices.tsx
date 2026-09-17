import { getPageContent } from "@/lib/cms";
import FeaturedServicesClient from "./FeaturedServicesClient";

export default async function FeaturedServices() {
  const [content, accreditations] = await Promise.all([
    getPageContent("featured-services"),
    getPageContent("accreditations"),
  ]);

  if (!content.items?.length) return null;

  return <FeaturedServicesClient {...content} logos={accreditations.logos} />;
}
