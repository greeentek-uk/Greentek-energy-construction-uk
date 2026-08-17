import { getCurrentSiteConfig } from "@/lib/cms";

export interface RouteEntry {
  path: string;
  label: string;
  group: string;
}

/** Every route the site currently generates, used to drive the admin SEO editor and sitemap. */
export async function getAllRoutes(): Promise<RouteEntry[]> {
  const siteConfig = await getCurrentSiteConfig();

  const routes: RouteEntry[] = [
    { path: "/", label: "Home", group: "Static Pages" },
    { path: "/about", label: "About", group: "Static Pages" },
    { path: "/services", label: "Services (index)", group: "Static Pages" },
    { path: "/projects", label: "Projects (index)", group: "Static Pages" },
    { path: "/locations", label: "Locations (index)", group: "Static Pages" },
    {
      path: "/blog",
      label: "Blog (index) — post SEO is edited on each post",
      group: "Static Pages",
    },
    { path: "/contact", label: "Contact", group: "Static Pages" },
    { path: "/privacy", label: "Privacy Policy", group: "Static Pages" },
    { path: "/terms", label: "Terms of Service", group: "Static Pages" },
  ];

  for (const s of siteConfig.services) {
    routes.push({
      path: `/services/${s.slug}`,
      label: s.title,
      group: "Services",
    });
  }

  for (const p of siteConfig.projects) {
    routes.push({
      path: `/projects/${p.slug}`,
      label: p.title,
      group: "Projects",
    });
  }

  for (const l of siteConfig.locations) {
    routes.push({
      path: `/locations/${l.slug}`,
      label: l.name,
      group: "Locations",
    });
    for (const s of siteConfig.services) {
      routes.push({
        path: `/locations/${l.slug}/${s.slug}`,
        label: `${s.shortName} in ${l.name}`,
        group: "Location + Service Pages",
      });
    }
  }

  return routes;
}
