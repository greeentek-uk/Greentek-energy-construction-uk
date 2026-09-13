export interface SitemapSectionConfig {
  enabled: boolean;
  priority: number;
  changeFrequency: string;
}

export interface SitemapConfig {
  includeStaticPages: boolean;
  staticPriority: number;
  sections: {
    services: SitemapSectionConfig;
    projects: SitemapSectionConfig;
    locations: SitemapSectionConfig;
    locationServices: SitemapSectionConfig;
    blog: SitemapSectionConfig;
  };
  /** Exact paths or `/prefix/*` globs to leave out. */
  excludedPaths: string[];
}

export const SITEMAP_SECTION_LABELS: Record<
  keyof SitemapConfig["sections"],
  { label: string; help: string }
> = {
  services: { label: "Service pages", help: "/services/…" },
  projects: { label: "Project pages", help: "/projects/…" },
  locations: { label: "Location pages", help: "/locations/…" },
  locationServices: {
    label: "Location + service pages",
    help: "/locations/…/… — the largest group by far",
  },
  blog: { label: "Blog posts", help: "/blog/…" },
};

export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
  includeStaticPages: true,
  staticPriority: 0.8,
  sections: {
    services: { enabled: true, priority: 0.8, changeFrequency: "monthly" },
    projects: { enabled: true, priority: 0.7, changeFrequency: "monthly" },
    locations: { enabled: true, priority: 0.8, changeFrequency: "monthly" },
    locationServices: { enabled: true, priority: 0.7, changeFrequency: "monthly" },
    blog: { enabled: true, priority: 0.8, changeFrequency: "monthly" },
  },
  excludedPaths: [],
};

export function normalizeSitemapConfig(
  input: Partial<SitemapConfig> | null | undefined,
): SitemapConfig {
  if (!input) return DEFAULT_SITEMAP_CONFIG;
  const sections = { ...DEFAULT_SITEMAP_CONFIG.sections };
  for (const key of Object.keys(sections) as (keyof typeof sections)[]) {
    sections[key] = { ...sections[key], ...input.sections?.[key] };
  }
  return {
    includeStaticPages: input.includeStaticPages ?? true,
    staticPriority: input.staticPriority ?? DEFAULT_SITEMAP_CONFIG.staticPriority,
    sections,
    excludedPaths: Array.isArray(input.excludedPaths) ? input.excludedPaths : [],
  };
}

/** Supports exact paths and a trailing `/*` wildcard, which is all an admin needs here. */
export function isExcluded(path: string, patterns: string[]): boolean {
  return patterns.some((raw) => {
    const pattern = raw.trim();
    if (!pattern) return false;
    if (pattern.endsWith("/*")) return path.startsWith(pattern.slice(0, -1));
    if (pattern.endsWith("*")) return path.startsWith(pattern.slice(0, -1));
    return path === pattern;
  });
}
