/**
 * Site-wide title and description templates.
 *
 * Every generated page runs its computed values through one of these, so the
 * house style for, say, every location+service page is changed in one place
 * instead of being re-typed per route.
 */
export interface TemplatePair {
  title: string;
  description: string;
}

export interface SeoTemplates {
  /** Character placed between title parts by the `%sep%` variable. */
  separator: string;
  /** Fallback used by any page type without its own template. */
  defaultTitle: string;
  home: TemplatePair;
  service: TemplatePair;
  location: TemplatePair;
  locationService: TemplatePair;
  project: TemplatePair;
  blog: TemplatePair;

  /** Used for OG/Twitter when a page sets no image of its own. */
  defaultOgImage: string;
  twitterSite: string;
  defaultTwitterCard: string;

  /** Site verification meta tags. */
  verification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
    baidu: string;
  };
}

export const DEFAULT_SEO_TEMPLATES: SeoTemplates = {
  separator: "|",
  defaultTitle: "%title% %sep% %sitename%",
  home: { title: "%sitename% %sep% %tagline%", description: "%sitedescription%" },
  service: {
    title: "%title% %sep% %sitename%",
    description: "%excerpt%",
  },
  location: {
    title: "%service_or_title% in %location% %sep% %sitename%",
    description: "%excerpt%",
  },
  locationService: {
    title: "%service% in %location% %sep% %sitename%",
    description: "%excerpt%",
  },
  project: { title: "%title% %sep% %sitename%", description: "%excerpt%" },
  blog: { title: "%title% %sep% %sitename%", description: "%excerpt%" },

  defaultOgImage: "",
  twitterSite: "",
  defaultTwitterCard: "summary_large_image",

  verification: { google: "", bing: "", yandex: "", pinterest: "", baidu: "" },
};

/** The placeholders an admin can use, shown as help text under each field. */
export const TEMPLATE_VARIABLES: { token: string; description: string }[] = [
  { token: "%title%", description: "The page or item's own title" },
  { token: "%sitename%", description: "Your company name" },
  { token: "%sitedescription%", description: "Your company description" },
  { token: "%tagline%", description: "Short company tagline" },
  { token: "%sep%", description: "The separator character set above" },
  { token: "%excerpt%", description: "The item's own description or excerpt" },
  { token: "%service%", description: "Service name (service and combo pages)" },
  { token: "%location%", description: "Location name (location and combo pages)" },
  { token: "%region%", description: "Location region" },
  { token: "%category%", description: "Category (projects and posts)" },
  { token: "%date%", description: "Publish date (posts)" },
  { token: "%year%", description: "Current year" },
  { token: "%month%", description: "Current month" },
];

export type TemplateVars = Record<string, string | undefined>;

/**
 * Substitutes `%token%` placeholders.
 *
 * Unknown or empty tokens are removed rather than left in the output — a title
 * reading "Solar PV in %location%" on a live page is worse than a slightly
 * short one. Leftover separators and doubled spaces are tidied afterwards.
 */
export function applyTemplate(template: string, vars: TemplateVars): string {
  if (!template.trim()) return "";

  const separator = vars.sep ?? "|";

  const replaced = template.replace(/%([a-z_]+)%/gi, (_match, token: string) => {
    const value = vars[token.toLowerCase()];
    return value ? value : "";
  });

  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return (
    replaced
      .replace(/\s{2,}/g, " ")
      // An empty variable can stand a connecting word up against the separator
      // or the end of the string ("Solar PV in | Greentek"). Drop the orphan.
      .replace(
        new RegExp(`\\s+(in|for|at|on|by|with|from|of|and|to)\\s*(?=${escapedSeparator}|$)`, "gi"),
        " ",
      )
      .replace(new RegExp(`^\\s*${escapedSeparator}\\s*`), "")
      .replace(new RegExp(`\\s*${escapedSeparator}\\s*$`), "")
      // Two separators left adjacent by a missing middle section.
      .replace(
        new RegExp(`${escapedSeparator}\\s*${escapedSeparator}`, "g"),
        separator,
      )
      .replace(/\s{2,}/g, " ")
      .replace(/\s+,/g, ",")
      .trim()
  );
}
