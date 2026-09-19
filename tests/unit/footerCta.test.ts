import { describe, expect, it } from "vitest";
import {
  DEFAULT_FOOTER_CTA,
  footerCtaHref,
  normalizeFooterCtaSettings,
  normalizeOverridePath,
  resolveFooterCta,
  type FooterCta,
  type FooterCtaSettings,
} from "@/lib/footerCta";

function cta(heading: string): FooterCta {
  return { ...DEFAULT_FOOTER_CTA, heading };
}

const SETTINGS: FooterCtaSettings = {
  default: cta("default"),
  overrides: [
    { path: "/finance", cta: cta("finance") },
    { path: "/locations/*", cta: cta("all locations") },
    { path: "/locations/cardiff/*", cta: cta("cardiff combos") },
    { path: "/locations/cardiff/solar-pv-installations", cta: cta("cardiff solar") },
  ],
};

describe("resolveFooterCta", () => {
  it("uses the default where nothing matches", () => {
    expect(resolveFooterCta("/", SETTINGS).heading).toBe("default");
    expect(resolveFooterCta("/services/loft-insulation", SETTINGS).heading).toBe("default");
  });

  it("prefers an exact page, ignoring a trailing slash", () => {
    expect(resolveFooterCta("/finance", SETTINGS).heading).toBe("finance");
    expect(resolveFooterCta("/finance/", SETTINGS).heading).toBe("finance");
    expect(resolveFooterCta("/locations/cardiff/solar-pv-installations", SETTINGS).heading).toBe(
      "cardiff solar",
    );
  });

  it("falls back to the most specific wildcard", () => {
    expect(resolveFooterCta("/locations/cardiff/loft-insulation", SETTINGS).heading).toBe(
      "cardiff combos",
    );
    expect(resolveFooterCta("/locations/swansea", SETTINGS).heading).toBe("all locations");
  });

  it("doesn't treat a wildcard as matching its own parent", () => {
    // "/locations/*" covers pages under /locations, not the index page itself.
    expect(resolveFooterCta("/locations", SETTINGS).heading).toBe("default");
  });
});

describe("footerCtaHref", () => {
  const phone = "0333 533 4567";

  it("builds WhatsApp and call links from the company phone", () => {
    expect(footerCtaHref({ ...DEFAULT_FOOTER_CTA.primary, linkType: "whatsapp" }, phone)).toEqual({
      href: "https://wa.me/443335334567",
      external: true,
    });
    expect(footerCtaHref({ ...DEFAULT_FOOTER_CTA.primary, linkType: "call" }, phone)).toEqual({
      href: "tel:03335334567",
      external: false,
    });
  });

  it("opens full URLs in a new tab but keeps site paths in the same one", () => {
    const url = { show: true, label: "x", linkType: "url" as const, href: "" };
    expect(footerCtaHref({ ...url, href: "/finance" }, phone)).toEqual({ href: "/finance", external: false });
    expect(footerCtaHref({ ...url, href: "https://example.com" }, phone).external).toBe(true);
  });
});

describe("the default reproduces the footer as it was", () => {
  it("keeps the WhatsApp button and the /contact button the e2e test relies on", () => {
    const phone = "0333 533 4567";
    expect(footerCtaHref(DEFAULT_FOOTER_CTA.primary, phone).href).toBe("https://wa.me/443335334567");
    expect(footerCtaHref(DEFAULT_FOOTER_CTA.secondary, phone).href).toBe("/contact");
  });

  it("is what an empty database returns", () => {
    expect(normalizeFooterCtaSettings(null).default).toEqual(DEFAULT_FOOTER_CTA);
  });
});

describe("normalizeOverridePath", () => {
  it("tidies what someone types", () => {
    expect(normalizeOverridePath("finance")).toBe("/finance");
    expect(normalizeOverridePath("/finance/")).toBe("/finance");
    expect(normalizeOverridePath("https://www.greentekenergy.co.uk/services/loft-insulation")).toBe(
      "/services/loft-insulation",
    );
    expect(normalizeOverridePath("/services/*")).toBe("/services/*");
  });

  it("rejects blanks, admin paths and wildcards in the middle", () => {
    expect(normalizeOverridePath("  ")).toBeNull();
    expect(normalizeOverridePath("/admin/footer-cta")).toBeNull();
    expect(normalizeOverridePath("/locations/*/solar")).toBeNull();
  });
});
