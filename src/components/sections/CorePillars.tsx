import { getPageContent } from "@/lib/cms";
import CorePillarsClient from "./CorePillarsClient";

export default async function CorePillars() {
  const content = await getPageContent("core-pillars");
  return <CorePillarsClient {...content} />;
}
