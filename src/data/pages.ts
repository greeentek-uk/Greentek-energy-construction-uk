import type { ContentBlock } from "./content";

/** A question/answer pair, rendered on the page and marked up as FAQPage schema. */
export interface FaqItem {
  question: string;
  /** Sanitized inline HTML — answers may contain links. */
  answer: string;
}

/**
 * A standalone page created from the admin panel.
 *
 * Distinct from services, locations and posts, which have their own shapes and
 * their own templates. This is the "everything else" type — cost guides, a
 * grants hub, a team page — so the person running the site can add pages
 * without a developer creating a route for each one.
 */
export interface SitePage {
  slug: string;
  title: string;
  /** Heading shown on the page; falls back to `title`. */
  heading?: string;
  subheading?: string;
  heroImage?: string;
  heroImageAlt?: string;
  content?: ContentBlock[];
  faqs?: FaqItem[];
  metaTitle?: string;
  metaDescription?: string;
  /** Draft pages render only for a signed-in admin and stay out of the sitemap. */
  published: boolean;
  /** Sitemap and listing order. */
  order?: number;
  updatedAt: string;
  createdAt: string;
}

/**
 * Reserved top-level slugs. A page here would be shadowed by an existing route
 * — Next resolves a static segment before a dynamic one — so the page would
 * save and then appear to do nothing.
 */
export const RESERVED_SLUGS = [
  "about", "blog", "contact", "services", "projects", "locations",
  "privacy", "terms", "energy-solutions", "home-solutions", "finance",
  "admin", "api", "sitemap.xml", "robots.txt", "llms.txt", "_next", "thank-you",
];
