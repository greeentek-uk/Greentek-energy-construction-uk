import type { MetadataRoute } from "next";
import { getCurrentBlogPosts, getCurrentSiteConfig, getCurrentSeoOverrides } from "@/lib/cms";
import { getSitemapConfig } from "@/lib/db/sitemapSettings";
import { getPublishedPages } from "@/lib/db/pages";
import { isExcluded } from "@/lib/sitemapConfig";
import { SITE_URL } from "@/lib/structuredData";

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES = [
  "",
  "/about",
  "/services",
  "/energy-solutions",
  "/home-solutions",
  "/projects",
  "/locations",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, siteConfig, config, overrides, pages] = await Promise.all([
    getCurrentBlogPosts(),
    getCurrentSiteConfig(),
    getSitemapConfig(),
    getCurrentSeoOverrides(),
    getPublishedPages(),
  ]);

  const entries: Entry[] = [];

  /**
   * Adds one URL unless the admin excluded it.
   *
   * A page marked noindex is dropped automatically: listing a URL you've told
   * Google not to index is a contradiction that shows up as a coverage warning
   * in Search Console, so the two settings are kept consistent here rather than
   * relying on whoever edits them to remember.
   */
  function add(path: string, entry: Omit<Entry, "url">) {
    if (isExcluded(path, config.excludedPaths)) return;
    const override = overrides[path];
    if (override?.noindex || override?.excludeFromSitemap) return;

    entries.push({
      url: `${SITE_URL}${path}`,
      ...entry,
      ...(override?.sitemapPriority !== undefined
        ? { priority: override.sitemapPriority }
        : {}),
      ...(override?.sitemapChangeFreq
        ? { changeFrequency: override.sitemapChangeFreq as Entry["changeFrequency"] }
        : {}),
    });
  }

  // Pages created in the panel are always listed — they exist because someone
  // deliberately published them, so there's no section toggle to forget.
  for (const page of pages) {
    add(`/${page.slug}`, {
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  if (config.includeStaticPages) {
    for (const route of STATIC_ROUTES) {
      add(route, {
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route === "/blog" ? 0.9 : config.staticPriority,
      });
    }
  }

  const { services, projects, locations, locationServices, blog } = config.sections;

  if (services.enabled) {
    for (const service of siteConfig.services) {
      add(`/services/${service.slug}`, {
        lastModified: new Date(),
        changeFrequency: services.changeFrequency as Entry["changeFrequency"],
        priority: services.priority,
      });
    }
  }

  if (projects.enabled) {
    for (const project of siteConfig.projects) {
      add(`/projects/${project.slug}`, {
        lastModified: new Date(),
        changeFrequency: projects.changeFrequency as Entry["changeFrequency"],
        priority: projects.priority,
      });
    }
  }

  if (locations.enabled) {
    for (const location of siteConfig.locations) {
      add(`/locations/${location.slug}`, {
        lastModified: new Date(),
        changeFrequency: locations.changeFrequency as Entry["changeFrequency"],
        priority: locations.priority,
      });
    }
  }

  if (locationServices.enabled) {
    for (const location of siteConfig.locations) {
      for (const service of siteConfig.services) {
        add(`/locations/${location.slug}/${service.slug}`, {
          lastModified: new Date(),
          changeFrequency: locationServices.changeFrequency as Entry["changeFrequency"],
          priority: locationServices.priority,
        });
      }
    }
  }

  if (blog.enabled) {
    for (const post of blogPosts) {
      add(`/blog/${post.slug}`, {
        lastModified: new Date(post.date),
        changeFrequency: blog.changeFrequency as Entry["changeFrequency"],
        priority: blog.priority,
      });
    }
  }

  return entries;
}
