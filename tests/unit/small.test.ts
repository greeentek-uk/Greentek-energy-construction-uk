import { describe, expect, it } from "vitest";
import { whatsappUrl } from "@/lib/whatsapp";
import { BROWSER_FORWARDABLE_EVENTS, isStandardEvent } from "@/lib/metaEvents";
import { enquiryPhotoFolder } from "@/lib/db/enquiries";

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
