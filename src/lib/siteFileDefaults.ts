import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { SITE_URL } from "@/lib/structuredData";
import type { LlmsConfig } from "@/lib/llmsConfig";

/**
 * Builds llms.txt from live content, following the llmstxt.org convention: an
 * H1, a blockquote summary, then link sections. Generated rather than typed out
 * so a new service or location appears without anyone editing the file.
 */
export async function buildLlmsTxt(config: LlmsConfig): Promise<string> {
  if (config.mode === "raw") {
    return config.raw.endsWith("\n") ? config.raw : `${config.raw}\n`;
  }

  const [site, posts] = await Promise.all([getCurrentSiteConfig(), getCurrentBlogPosts()]);

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${config.intro.trim() || site.description}`,
    "",
    `${site.name} is a UK construction and renewable energy contractor based in ${site.address.city}, ${site.address.region}. Contact: ${site.phone} / ${site.email}.`,
  ];

  if (config.includeCorePages) {
    lines.push(
      "",
      "## Core pages",
      "",
      `- [Home](${SITE_URL}/): Overview of services, projects and service areas.`,
      `- [About](${SITE_URL}/about): Company background, accreditations and process.`,
      `- [Services](${SITE_URL}/services): Full list of construction and energy services.`,
      `- [Projects](${SITE_URL}/projects): Completed work with before and after photos.`,
      `- [Locations](${SITE_URL}/locations): Areas covered across the West Midlands and Wales.`,
      `- [Blog](${SITE_URL}/blog): Guides and news on energy efficiency and refurbishment.`,
      `- [Contact](${SITE_URL}/contact): Quote requests and enquiries.`,
    );
  }

  if (config.includeServices && site.services.length) {
    lines.push(
      "",
      "## Services",
      "",
      ...site.services.map(
        (s) => `- [${s.title}](${SITE_URL}/services/${s.slug}): ${s.description}`,
      ),
    );
  }

  if (config.includeLocations && site.locations.length) {
    lines.push(
      "",
      "## Service areas",
      "",
      ...site.locations.map(
        (l) => `- [${l.name}](${SITE_URL}/locations/${l.slug}): ${l.tagline}`,
      ),
    );
  }

  if (config.includeBlog && posts.length && config.blogLimit > 0) {
    lines.push(
      "",
      "## Recent articles",
      "",
      ...posts
        .slice(0, config.blogLimit)
        .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`),
    );
  }

  if (config.includeOptional) {
    lines.push(
      "",
      "## Optional",
      "",
      `- [Privacy Policy](${SITE_URL}/privacy)`,
      `- [Terms of Service](${SITE_URL}/terms)`,
    );
  }

  lines.push("");
  return lines.join("\n");
}
