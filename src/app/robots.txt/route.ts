import { getRobotsConfig } from "@/lib/db/siteFiles";
import { buildRobotsTxt } from "@/lib/robotsConfig";
import { SITE_URL } from "@/lib/structuredData";

/**
 * Replaces the old `app/robots.ts`. Next's MetadataRoute.Robots helper can only
 * express a fixed rule object, but the admin builds arbitrary rules — per-bot
 * blocks, crawl delays, AI crawler rules — so we render the file ourselves.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const config = await getRobotsConfig();

  return new Response(buildRobotsTxt(config, SITE_URL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
