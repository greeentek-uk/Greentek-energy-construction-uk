import { getLlmsConfig } from "@/lib/db/siteFiles";
import { buildLlmsTxt } from "@/lib/siteFileDefaults";

/** Serves /llms.txt — assembled from live content, or the admin's own text. */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const config = await getLlmsConfig();

  // Turning the file off has to 404 rather than serve an empty body, so
  // crawlers treat it as absent instead of as an empty site map.
  if (!config.enabled) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(await buildLlmsTxt(config), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
