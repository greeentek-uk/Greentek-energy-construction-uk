import type { Metadata } from "next";
import { cache } from "react";
import { getCurrentSeoOverrides, getCurrentSiteConfig } from "@/lib/cms";
import { getSeoTemplates } from "@/lib/db/seoSettings";
import { SITE_URL } from "@/lib/structuredData";
import { applyTemplate, type SeoTemplates, type TemplateVars } from "@/lib/seoTemplates";
import type { SeoOverride } from "@/lib/seoTypes";

export type { SeoOverride, SeoOverrides } from "@/lib/seoTypes";

export const getCurrentSeoTemplates = cache((): Promise<SeoTemplates> => getSeoTemplates());

/** Looks up an admin-set override for a route path, e.g. "/services/solar-pv-installations". */
export async function getSeoOverride(path: string): Promise<SeoOverride | undefined> {
  const overrides = await getCurrentSeoOverrides();
  return overrides[path];
}

/** Which site-wide template a route uses. */
export type PageKind =
  | "home"
  | "service"
  | "location"
  | "locationService"
  | "project"
  | "blog"
  | "generic";

export interface SeoDefaults {
  title: string;
  description: string;
  /** Picks the site-wide template; omit for a plain page with no template. */
  kind?: PageKind;
  /** Extra values for `%service%`, `%location%` and friends. */
  vars?: TemplateVars;
  /** Page's own share image, used when no override and no site default. */
  image?: string;
  /** Overrides the og:type, e.g. "article" for a blog post. */
  ogType?: string;
}

function absoluteUrl(value: string): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function templateFor(templates: SeoTemplates, kind: PageKind | undefined) {
  switch (kind) {
    case "home":
      return templates.home;
    case "service":
      return templates.service;
    case "location":
      return templates.location;
    case "locationService":
      return templates.locationService;
    case "project":
      return templates.project;
    case "blog":
      return templates.blog;
    default:
      return { title: templates.defaultTitle, description: "" };
  }
}

/**
 * Builds a page's full metadata: title, description, canonical, robots
 * directives, Open Graph and Twitter cards.
 *
 * Resolution order for every value is the same — the admin's per-page override
 * wins, then the site-wide template for that page type, then the value the page
 * computed for itself. That ordering is what lets someone restyle every
 * location page at once without losing a title they hand-wrote for one of them.
 */
export async function withSeoOverride(
  path: string,
  defaults: SeoDefaults,
): Promise<Metadata> {
  const [override, templates, site] = await Promise.all([
    getSeoOverride(path),
    getCurrentSeoTemplates(),
    getCurrentSiteConfig(),
  ]);

  const now = new Date();
  const vars: TemplateVars = {
    sep: templates.separator,
    sitename: site.name,
    sitedescription: site.description,
    tagline: site.description.split(/[.\-—]/)[0]?.trim(),
    title: defaults.title,
    excerpt: defaults.description,
    year: String(now.getFullYear()),
    month: now.toLocaleString("en-GB", { month: "long" }),
    ...defaults.vars,
  };

  const template = templateFor(templates, defaults.kind);
  const templatedTitle = applyTemplate(template.title, vars);
  const templatedDescription = applyTemplate(template.description, vars);

  const title = override?.title?.trim() || templatedTitle || defaults.title;
  const description =
    override?.description?.trim() || templatedDescription || defaults.description;

  const canonical = override?.canonical?.trim() || path;

  const image = absoluteUrl(
    override?.ogImage?.trim() || defaults.image || templates.defaultOgImage,
  );
  const twitterImage = absoluteUrl(override?.twitterImage?.trim() || "") || image;

  const ogTitle = override?.ogTitle?.trim() || title;
  const ogDescription = override?.ogDescription?.trim() || description;

  const robots =
    override?.noindex ||
    override?.nofollow ||
    override?.noarchive ||
    override?.nosnippet ||
    override?.noimageindex ||
    override?.maxSnippet ||
    override?.maxImagePreview
      ? {
          index: !override.noindex,
          follow: !override.nofollow,
          nocache: Boolean(override.noarchive),
          googleBot: {
            index: !override.noindex,
            follow: !override.nofollow,
            noimageindex: Boolean(override.noimageindex),
            ...(override.maxSnippet ? { "max-snippet": Number(override.maxSnippet) } : {}),
            ...(override.maxImagePreview
              ? { "max-image-preview": override.maxImagePreview }
              : {}),
          },
        }
      : undefined;

  return {
    // An override is the exact, final title the admin typed, so it must not be
    // run through the root layout's "%s | Greentek" suffix a second time.
    title: { absolute: title },
    description,
    alternates: { canonical },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: absoluteUrl(canonical),
      siteName: site.name,
      type: (override?.ogType || defaults.ogType || "website") as "website",
      locale: "en_GB",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: (override?.twitterCard ||
        templates.defaultTwitterCard ||
        "summary_large_image") as "summary_large_image",
      title: override?.twitterTitle?.trim() || ogTitle,
      description: override?.twitterDescription?.trim() || ogDescription,
      ...(templates.twitterSite ? { site: templates.twitterSite } : {}),
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  };
}
