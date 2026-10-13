import { describe, expect, it } from "vitest";
import { LANDING_PAGES, landingPage } from "@/lib/landingPages";
import { LANDING_PAGE_DEFAULTS } from "@/data/landingDefaults";
import { PAGE_CONTENT_KEYS } from "@/data/pageContent";
import { isOfferedService, serviceLabel } from "@/lib/quoteForm";
import { pagesShowingBlock } from "@/data/adminPages";
import { RESERVED_SLUGS } from "@/data/pages";

describe("ad landing pages", () => {
  it.each(LANDING_PAGES.map((p) => [p.slug, p] as const))("%s is wired up end to end", (_slug, page) => {
    expect(PAGE_CONTENT_KEYS).toContain(page.block);
    expect(LANDING_PAGE_DEFAULTS[page.block], "seeded, or the page throws").toBeDefined();
    // The fixed service is one the full form lists, so the closing form
    // preselects it and the inbox names it.
    expect(isOfferedService(page.service)).toBe(true);
    expect(serviceLabel(page.service)).not.toBe("");
    expect(pagesShowingBlock(page.block).map((p) => p.path)).toContain(`/lp/${page.slug}`);
  });

  it("drafted copy fills every section", () => {
    for (const content of Object.values(LANDING_PAGE_DEFAULTS)) {
      for (const [key, value] of Object.entries(content)) {
        expect(Array.isArray(value) ? value.length : String(value).trim().length, key).toBeGreaterThan(0);
      }
    }
  });

  it("lookup and reserved slug", () => {
    expect(landingPage("kitchen-renovation")?.block).toBe("lp-kitchen-renovation");
    expect(landingPage("nope")).toBeUndefined();
    expect(RESERVED_SLUGS).toContain("lp");
  });
});
