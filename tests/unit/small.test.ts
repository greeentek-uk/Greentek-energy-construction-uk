import { parseStat } from "@/lib/stats";
import { describe, expect, it } from "vitest";
import { whatsappUrl } from "@/lib/whatsapp";
import { BROWSER_FORWARDABLE_EVENTS, isStandardEvent } from "@/lib/metaEvents";
import { enquiryPhotoFolder } from "@/lib/db/enquiries";
import { resolveLiveSiteUrl } from "@/lib/revalidate";
import { splitHeading } from "@/lib/heroHeading";
import { sanitizeRichText, toRelativeIfOwnSite } from "@/lib/richText";
import { buildBlogPostingJsonLd } from "@/lib/structuredData";
import type { BlogPost } from "@/data/blogs";
import { PRODUCTION_SITE_URL } from "@/lib/structuredData";

describe("whatsappUrl", () => {
  it.each([
    ["0333 533 4567", "https://wa.me/443335334567"],
    ["+44 333 533 4567", "https://wa.me/443335334567"],
    ["0044 7700 900123", "https://wa.me/447700900123"],
  ])("%s", (phone, url) => expect(whatsappUrl(phone)).toBe(url));
});

describe("Meta events", () => {
  it("routes standard vs custom events correctly", () => {
    expect(isStandardEvent("Lead")).toBe(true);
    expect(isStandardEvent("StartQuote")).toBe(false);
  });

  it("never lets the browser report a Lead", () => {
    expect(BROWSER_FORWARDABLE_EVENTS).not.toContain("Lead");
  });
});

describe("enquiryPhotoFolder", () => {
  it("zero-pads so folders sort in order", () => {
    expect(enquiryPhotoFolder(1)).toBe("enquiry-photos/00001");
    expect(enquiryPhotoFolder(12345)).toBe("enquiry-photos/12345");
  });
});

describe("parseStat", () => {
  it("splits the number from the text around it", () => {
    expect(parseStat("500+")).toMatchObject({ target: 500, decimals: 0, prefix: "", suffix: "+" });
    expect(parseStat("98%")).toMatchObject({ target: 98, suffix: "%" });
  });

  it("keeps a leading symbol in front rather than moving it after the number", () => {
    // The old split turned "£2m" into "2£m".
    expect(parseStat("£2m")).toMatchObject({ target: 2, prefix: "£", suffix: "m" });
  });

  it("counts decimals and thousands separators in full", () => {
    expect(parseStat("4.9")).toMatchObject({ target: 4.9, decimals: 1 });
    // The old pattern stopped at the comma and counted to 1.
    expect(parseStat("1,200+")).toMatchObject({ target: 1200, grouped: true, suffix: "+" });
  });

  it("returns null when there's nothing to count", () => {
    expect(parseStat("Fully accredited")).toBeNull();
  });
});

describe("resolveLiveSiteUrl", () => {
  // A localhost canonical once made the local panel think it was the live
  // site, so saves never cleared production's cache.
  it("never targets localhost", () => {
    expect(resolveLiveSiteUrl({}, "http://localhost:3000")).toBe(PRODUCTION_SITE_URL);
    expect(resolveLiveSiteUrl({}, "http://127.0.0.1:3002")).toBe(PRODUCTION_SITE_URL);
  });

  it("uses a real canonical origin as-is", () => {
    expect(resolveLiveSiteUrl({}, "https://www.example.co.uk")).toBe("https://www.example.co.uk");
  });

  it("prefers LIVE_SITE_URL, without a trailing slash", () => {
    expect(
      resolveLiveSiteUrl({ LIVE_SITE_URL: "https://staging.example.co.uk/" }, "http://localhost:3000"),
    ).toBe("https://staging.example.co.uk");
  });
});

describe("splitHeading", () => {
  it("highlights the named words wherever they sit in the H1", () => {
    expect(splitHeading("Cardiff's Loft Insulation Specialists", "Loft Insulation")).toEqual({
      before: "Cardiff's ",
      highlight: "Loft Insulation",
      after: " Specialists",
    });
  });

  it("ignores case but keeps the heading's own casing", () => {
    expect(splitHeading("Solar PV in Cardiff", "cardiff")?.highlight).toBe("Cardiff");
  });

  // Blank or mistyped means plain white — never text appended to the H1.
  it.each([undefined, "", "   ", "Swansea"])("no highlight for %j", (highlight) => {
    expect(splitHeading("Solar PV in Cardiff", highlight)).toBeNull();
  });
});

describe("own-site links in rich text", () => {
  it.each([
    ["https://www.greentekenergy.co.uk/finance", "/finance"],
    ["https://greentekenergy.co.uk/locations/cardiff?x=1#faq", "/locations/cardiff?x=1#faq"],
    ["https://www.greentekenergy.co.uk", "/"],
    ["http://greentekenergy.co.uk/", "/"],
  ])("%s → %s", (from, to) => expect(toRelativeIfOwnSite(from)).toBe(to));

  it("leaves other sites alone, including look-alike hosts", () => {
    expect(toRelativeIfOwnSite("https://greentekenergy.co.uk.evil.com/x")).toBe(
      "https://greentekenergy.co.uk.evil.com/x",
    );
    expect(toRelativeIfOwnSite("https://ideal4finance.com/")).toBe("https://ideal4finance.com/");
  });

  it("saves them as same-tab internal links", () => {
    expect(
      sanitizeRichText('<a href="https://www.greentekenergy.co.uk/finance" target="_blank" rel="noopener noreferrer">x</a>'),
    ).toBe(
      '<a href="/finance">x</a>',
    );
  });
});

describe("external links", () => {
  it("still open in a new tab with noopener", () => {
    expect(sanitizeRichText('<a href="https://ideal4finance.com/">x</a>')).toBe(
      '<a href="https://ideal4finance.com/" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });
});

describe("blog post author schema", () => {
  const post = { title: "T", slug: "t", excerpt: "E", date: "2026-05-23", coverImage: "/c.jpg" } as BlogPost;
  it("names a Person when the post has an author", () => {
    const jsonLd = buildBlogPostingJsonLd(post, "https://www.example.co.uk", {
      slug: "andy", name: "Andy Smith", role: "Surveyor", bio: "", photo: "/a.jpg", profileUrl: "https://linkedin.com/in/andy",
    });
    expect(jsonLd.author).toMatchObject({
      "@type": "Person", name: "Andy Smith", jobTitle: "Surveyor", url: "https://linkedin.com/in/andy", image: "https://www.example.co.uk/a.jpg",
    });
  });
  it("falls back to the company", () => {
    expect(buildBlogPostingJsonLd(post, "https://www.example.co.uk").author).toEqual({ "@type": "Organization", name: "Greentek" });
  });
});
