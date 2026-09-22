import { getPageContent } from "@/lib/cms";
import type { StatsContent } from "@/data/pageContent";
import StatsClient from "./StatsClient";

/** `override` lets one page carry its own figures instead of the shared block. */
export default async function Stats({ override }: { override?: StatsContent | null }) {
  const content = override?.items?.length ? override : await getPageContent("stats");
  return <StatsClient {...content} />;
}
