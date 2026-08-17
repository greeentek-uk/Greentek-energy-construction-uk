import { cache } from "react";
import { getServices } from "./db/services";
import { getProjects } from "./db/projects";
import { getLocations } from "./db/locations";
import { getSettings } from "./db/settings";
import { getBlogPosts } from "./db/blogPosts";
import { getSeoOverrides } from "./db/seoOverrides";
import type { SiteConfig } from "@/data/site";
import type { BlogPost } from "@/data/blogs";
import type { SeoOverrides } from "@/lib/seo";

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
