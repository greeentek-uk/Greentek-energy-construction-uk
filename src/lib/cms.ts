import { cache } from "react";
import { getServices } from "./db/services";
import { getProjects } from "./db/projects";
import { getLocations } from "./db/locations";
import { getSettings } from "./db/settings";
import { getBlogPosts } from "./db/blogPosts";
import { getSeoOverrides } from "./db/seoOverrides";
import { getBlockPublished } from "./db/pageContent";
import type { SiteConfig } from "@/data/site";
import type { BlogPost } from "@/data/blogs";
import type { SeoOverrides } from "@/lib/seo";
import type { PageContentMap, PageContentKey } from "@/data/pageContent";

/** Assembles the same shape every page already consumes, from parallel collection reads. Cached per-request so Header/Footer/page body sharing one request only hit Mongo once. */
export const getCurrentSiteConfig = cache(async (): Promise<SiteConfig> => {
  const [settings, services, projects, locations] = await Promise.all([
    getSettings(),
    getServices(),
    getProjects(),
    getLocations(),
  ]);
  return { ...settings, services, projects, locations };
});

export const getCurrentBlogPosts = cache((): Promise<BlogPost[]> => getBlogPosts());

export const getCurrentSeoOverrides = cache((): Promise<SeoOverrides> => getSeoOverrides());

/** Published-only read for public pages. Throws if the seed script hasn't run yet — a loud failure beats a silently blank section. */
export const getPageContent = cache(
  async <K extends PageContentKey>(key: K): Promise<PageContentMap[K]> => {
    const content = await getBlockPublished(key);
    if (!content) {
      throw new Error(
        `Page content block "${key}" not found — run \`npm run seed:page-content\`.`,
      );
    }
    return content;
  },
);
