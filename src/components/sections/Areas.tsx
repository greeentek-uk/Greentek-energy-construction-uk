import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { resolveAreaHref } from "@/lib/areaLinks";
import AreasClient from "./AreasClient";

export default async function Areas() {
  const [content, siteConfig] = await Promise.all([
    getPageContent("areas"),
    getCurrentSiteConfig(),
  ]);

  // Each ticker name becomes a link to the page that covers it.
  const tickerLinks = content.tickerItems.map((name) => ({
    name,
    href: resolveAreaHref(name, siteConfig.locations),
  }));

  return <AreasClient {...content} tickerLinks={tickerLinks} />;
}
