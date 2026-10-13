import { describe, expect, it } from "vitest";
import { adsSendTo, e164, EMPTY_GOOGLE_ADS } from "@/lib/googleAds";
import { campaignRows, pagePath } from "@/lib/attribution";

const ads = { conversionId: "AW-123456789", leadLabel: "LeadLbl", callLabel: "CallLbl", whatsappLabel: "" };

describe("adsSendTo", () => {
  it("maps real intent to its conversion action", () => {
    expect(adsSendTo(ads, "Lead", {})).toBe("AW-123456789/LeadLbl");
    expect(adsSendTo(ads, "Contact", { content_name: "phone" })).toBe("AW-123456789/CallLbl");
  });

  it("ignores everything that isn't a conversion, or has no label", () => {
    expect(adsSendTo(ads, "StartQuote", {})).toBeNull();
    expect(adsSendTo(ads, "PageView", {})).toBeNull();
    expect(adsSendTo(ads, "Contact", { content_name: "email" })).toBeNull();
    expect(adsSendTo(ads, "Contact", { content_name: "whatsapp" }), "blank label").toBeNull();
    expect(adsSendTo(EMPTY_GOOGLE_ADS, "Lead", {})).toBeNull();
    expect(adsSendTo({ ...ads, conversionId: "G-ABC123" }, "Lead", {}), "a GA4 id isn't an Ads id").toBeNull();
  });
});

describe("e164", () => {
  it.each([
    ["07700 900123", "+447700900123"],
    ["+44 7700 900123", "+447700900123"],
    ["0044 7700 900123", "+447700900123"],
    ["", ""],
  ])("%j → %j", (input, out) => expect(e164(input)).toBe(out));
});

describe("campaignRows", () => {
  it("names the paid click and the UTM tags", () => {
    const url =
      "https://www.greentekenergy.co.uk/lp/kitchen-renovation?gclid=abc&utm_source=google&utm_medium=cpc&utm_campaign=Kitchens%20WM&utm_term=kitchen%20fitters";
    expect(campaignRows(url)).toEqual([
      ["Paid click", "Google Ads"],
      ["Source", "google"],
      ["Medium", "cpc"],
      ["Campaign", "Kitchens WM"],
      ["Keyword", "kitchen fitters"],
    ]);
    expect(campaignRows("https://x.test/?fbclid=1")).toEqual([["Paid click", "Meta (Facebook / Instagram)"]]);
  });

  it("is empty for untagged or bad input, and caps lengths", () => {
    expect(campaignRows("https://x.test/contact")).toEqual([]);
    expect(campaignRows("not a url")).toEqual([]);
    expect(campaignRows(undefined)).toEqual([]);
    expect(campaignRows(`https://x.test/?utm_campaign=${"a".repeat(500)}`)[0][1]).toHaveLength(150);
  });

  it("pagePath drops the query", () => {
    expect(pagePath("https://x.test/lp/bathroom-renovation?gclid=1")).toBe("/lp/bathroom-renovation");
    expect(pagePath(42)).toBe("");
  });
});
