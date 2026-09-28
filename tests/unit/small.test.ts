import { parseStat } from "@/lib/stats";
import { describe, expect, it } from "vitest";
import { whatsappUrl } from "@/lib/whatsapp";
import { BROWSER_FORWARDABLE_EVENTS, isStandardEvent } from "@/lib/metaEvents";
import { enquiryPhotoFolder } from "@/lib/db/enquiries";
import { resolveLiveSiteUrl } from "@/lib/revalidate";
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
