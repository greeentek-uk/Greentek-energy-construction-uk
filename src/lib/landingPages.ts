import type { LandingPageContent, PageContentKey } from "@/data/pageContent";
import { LANDING_PAGE_DEFAULTS } from "@/data/landingDefaults";

export const LANDING_PAGES = [
  {
    slug: "kitchen-renovation",
    block: "lp-kitchen-renovation",
    name: "Kitchen renovation",
    service: "construction_kitchen",
  },
  {
    slug: "bathroom-renovation",
    block: "lp-bathroom-renovation",
    name: "Bathroom renovation",
    service: "construction_bathroom",
  },
  {
    slug: "solar-panels",
    block: "lp-solar-panels",
    name: "Solar panels",
    service: "energy_solar_pv",
  },
  {
    slug: "air-source-heat-pumps",
    block: "lp-air-source-heat-pumps",
    name: "Air source heat pumps",
    service: "energy_heat_pump",
  },
] as const satisfies readonly { slug: string; block: PageContentKey; name: string; service: string }[];

export function landingPage(slug: string) {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

export function withLandingDefaults(
  block: (typeof LANDING_PAGES)[number]["block"],
  stored: Partial<LandingPageContent> | null | undefined,
): LandingPageContent {
  const defaults = LANDING_PAGE_DEFAULTS[block];
  const merged = { ...defaults } as Record<string, unknown>;
  for (const [key, value] of Object.entries(stored ?? {})) {
    if (!(key in defaults) || value === undefined || value === null) continue;
    if (Array.isArray(defaults[key as keyof LandingPageContent]) !== Array.isArray(value)) continue;
    merged[key] = value;
  }
  return merged as unknown as LandingPageContent;
}
