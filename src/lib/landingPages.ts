import type { PageContentKey } from "@/data/pageContent";

/**
 * The ad landing pages, at /lp/<slug> — the one list the route, its static
 * params and the admin's page map read from.
 *
 * Kept apart from /services on purpose: an ad page drops the menu, cuts the
 * copy to what sells and is tested and changed often, all of which would cost
 * the SEO pages their rankings. These are noindex and left out of the sitemap,
 * so the two never compete in search.
 *
 * `service` is the quote form's option value (lib/quoteForm.ts), so an enquiry
 * from here lands in the inbox exactly like one from the service page.
 */
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
] as const satisfies readonly { slug: string; block: PageContentKey; name: string; service: string }[];

export function landingPage(slug: string) {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
