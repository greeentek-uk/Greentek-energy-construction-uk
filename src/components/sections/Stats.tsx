import { getPageContent } from "@/lib/cms";
import StatsClient from "./StatsClient";

export default async function Stats() {
  const content = await getPageContent("stats");
  return <StatsClient {...content} />;
}
