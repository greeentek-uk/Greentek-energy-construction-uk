/**
 * Per-route SEO overrides. Flat rather than nested so the admin form can post
 * it as plain FormData fields without bespoke serialisation.
 *
 * A type alias rather than an interface: that gives it an implicit index
 * signature, which the Mongo driver's update types require.
 *
 * Every field is optional: a blank one falls through to the site-wide template
 * (lib/seoTemplates.ts), and then to the page's own computed default.
 */
export type SeoOverride = {
  title?: string;
  description?: string;
  /** Absolute or root-relative URL. Blank means "this page's own path". */
  canonical?: string;

  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  /** "-1" for unlimited, "0" for none, or a character count. */
  maxSnippet?: string;
  maxImagePreview?: "none" | "standard" | "large";

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;

  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  /** Sitemap handling. A noindex page is dropped from the sitemap regardless. */
  excludeFromSitemap?: boolean;
  sitemapPriority?: number;
  sitemapChangeFreq?: string;
};

export type SeoOverrides = Record<string, SeoOverride>;

export const OG_TYPES = ["website", "article", "profile", "business.business"];
export const TWITTER_CARDS = ["summary_large_image", "summary"];
export const CHANGE_FREQUENCIES = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

/** Builds the `robots` meta value Google reads, or null when nothing is restricted. */
export function robotsDirectives(override: SeoOverride | undefined) {
  if (!override) return null;

  const extras: string[] = [];
  if (override.noarchive) extras.push("noarchive");
  if (override.nosnippet) extras.push("nosnippet");
  if (override.noimageindex) extras.push("noimageindex");
  if (override.maxSnippet) extras.push(`max-snippet:${override.maxSnippet}`);
  if (override.maxImagePreview) extras.push(`max-image-preview:${override.maxImagePreview}`);

  if (!override.noindex && !override.nofollow && extras.length === 0) return null;

  return {
    index: !override.noindex,
    follow: !override.nofollow,
    ...(extras.length ? { "max-snippet": undefined } : {}),
    googleBot: {
      index: !override.noindex,
      follow: !override.nofollow,
    },
    extras,
  };
}
