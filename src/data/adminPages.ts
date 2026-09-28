import type { PageContentKey } from "./pageContent";

/**
 * The panel's map of the site, page by page.
 *
 * Page Content used to be one list split into "Shared Sections" and "Page
 * Headers", so the About hero sat next to the homepage FAQ and nothing said
 * which page a block was on or where on it. The panel is organised by page
 * instead: pick the page, then its sections in the order they appear on it.
 *
 * Blocks shared between pages are listed on each page that shows them — the
 * block editor names every one, so it's clear an edit reaches all of them.
 *
 * Order matters: it is the order the sections render, top to bottom. Keep it
 * in step with the page's JSX when a section is added or moved.
 */
export interface ContentPageSection {
  key: PageContentKey;
  /** Shown under the section name, where its role on this page isn't obvious. */
  note?: string;
}

export interface ContentPage {
  id: string;
  label: string;
  /** The public URL, for the "View live" link. */
  path: string;
  sections: ContentPageSection[];
  /** Where the individual pages of this kind are edited, for index pages. */
  children?: { label: string; href: string };
}

export const CONTENT_PAGES: ContentPage[] = [
  {
    id: "home",
    label: "Home page",
    path: "/",
    sections: [
      {
        key: "home-hero",
        note: "Also sets the rating badge and quote-form heading on every service and location page",
      },
      { key: "finance-banner" },
      { key: "projects-preview" },
      { key: "testimonials" },
      { key: "about-us-slide" },
      { key: "featured-services" },
      { key: "accreditations", note: "The logos inside Featured Services" },
      { key: "stats" },
      { key: "process" },
      { key: "areas" },
      { key: "faq" },
    ],
  },
  {
    id: "about",
    label: "About page",
    path: "/about",
    sections: [
      { key: "about-page", note: "Hero and our journey" },
      { key: "why-us" },
      { key: "about-us-slide" },
      { key: "home-why-choose-us" },
      { key: "brands" },
      { key: "process" },
    ],
  },
  {
    id: "services",
    label: "Services page",
    path: "/services",
    sections: [
      { key: "services-page-header" },
      { key: "verticals", note: "How services are grouped on this page" },
      { key: "process" },
      { key: "projects-preview" },
    ],
    children: { label: "Edit each service page", href: "/admin/services" },
  },
  {
    id: "home-solutions",
    label: "Home Solutions page",
    path: "/home-solutions",
    sections: [{ key: "verticals" }, { key: "process" }],
  },
  {
    id: "energy-solutions",
    label: "Energy Solutions page",
    path: "/energy-solutions",
    sections: [{ key: "verticals" }, { key: "process" }],
  },
  {
    id: "locations",
    label: "Locations page",
    path: "/locations",
    sections: [{ key: "locations-page-header" }],
    children: { label: "Edit each location page", href: "/admin/locations" },
  },
  {
    id: "projects",
    label: "Projects page",
    path: "/projects",
    sections: [{ key: "projects-page-header" }],
    children: { label: "Edit each project page", href: "/admin/projects" },
  },
  {
    id: "shared",
    label: "Shared on service & location pages",
    path: "/services",
    // Every service, location and location + service page shows these unless
    // that page gives itself its own (stats and process can be overridden
    // per page in its editor).
    sections: [
      { key: "home-hero", note: "Rating badge and quote-form heading in the hero" },
      { key: "finance-banner" },
      { key: "stats", note: "Unless the page has its own figures" },
      { key: "testimonials" },
      { key: "process", note: "Unless the page has its own steps" },
      { key: "accreditations" },
    ],
  },
];

/** Blocks no page renders at the moment — listed so they aren't lost. */
export const UNUSED_BLOCKS: PageContentKey[] = ["core-pillars"];

export function getContentPage(id: string): ContentPage | undefined {
  return CONTENT_PAGES.find((p) => p.id === id);
}

/** Every page a block appears on, for the "appears on" line in its editor. */
export function pagesShowingBlock(key: PageContentKey): ContentPage[] {
  return CONTENT_PAGES.filter((p) => p.sections.some((s) => s.key === key));
}
