import type { MetadataRoute } from "next";
import { getCurrentBlogPosts, getCurrentSiteConfig } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.greentekenergy.co.uk";

  const [blogPosts, siteConfig] = await Promise.all([
    getCurrentBlogPosts(),
    getCurrentSiteConfig(),
  ]);

  const routes = [
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

  const sitemapRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : route === "/blog" ? 0.9 : 0.8,
  }));

  // Add blog posts
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Add individual service pages
  const serviceRoutes = siteConfig.services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Add individual project pages
  const projectRoutes = siteConfig.projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Add individual location pages
  const locationRoutes = siteConfig.locations.map((location) => ({
    url: `${baseUrl}/locations/${location.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Add location + service landing pages
  const locationServiceRoutes = siteConfig.locations.flatMap((location) =>
    siteConfig.services.map((service) => ({
      url: `${baseUrl}/locations/${location.slug}/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [
    ...sitemapRoutes,
    ...blogRoutes,
    ...serviceRoutes,
    ...projectRoutes,
    ...locationRoutes,
    ...locationServiceRoutes,
  ];
}
