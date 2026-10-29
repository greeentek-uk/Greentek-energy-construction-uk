import { describe, expect, it } from "vitest";
import { grantCheck } from "@/lib/grantCheck";
import { isLikelyEmail, isLikelyUkPhone, suggestEmail } from "@/lib/quoteForm";

describe("grantCheck", () => {
  it("an owner replacing a gas boiler is likely — no EPC needed since April 2026", () => {
    const check = grantCheck({ postcode: "WV1 1AA", is_homeowner: "yes", current_heating: "gas" });
    expect(check.verdict).toBe("likely");
    expect(check.summary).toBe("Likely — owner, replacing a gas boiler");
  });

  it("flags the off-gas uplift for oil and LPG", () => {
    expect(grantCheck({ postcode: "CF10 1AA", is_homeowner: "yes", current_heating: "oil" }).summary).toBe(
      "Likely — owner, replacing an oil boiler · could get £9,000 if there's no mains gas",
    );
    expect(grantCheck({ postcode: "B1 1AA", is_homeowner: "no", current_heating: "lpg" }).summary).not.toContain("£9,000");
  });

  it("unknown heating or a purchase in progress needs a call", () => {
    expect(grantCheck({ postcode: "ST19 9JX", is_homeowner: "yes", current_heating: "other" }).verdict).toBe("check");
    expect(grantCheck({ postcode: "B1 1AA", is_homeowner: "buying", current_heating: "gas" }).verdict).toBe("check");
  });

  it("tenants, existing heat pumps and Scotland/NI are unlikely", () => {
    expect(grantCheck({ postcode: "B1 1AA", is_homeowner: "no", current_heating: "gas" }).verdict).toBe("unlikely");
    expect(grantCheck({ postcode: "B1 1AA", is_homeowner: "yes", current_heating: "heat_pump" }).verdict).toBe("unlikely");
    expect(grantCheck({ postcode: "G1 1AA", is_homeowner: "yes", current_heating: "gas" }).verdict).toBe("unlikely");
    expect(grantCheck({ postcode: "BT1 1AA", is_homeowner: "yes", current_heating: "gas" }).verdict).toBe("unlikely");
    // Gloucester (GL) and Berwick (TD15) aren't mistaken for Scotland.
    expect(grantCheck({ postcode: "GL1 1AA", is_homeowner: "yes", current_heating: "gas" }).verdict).toBe("likely");
    expect(grantCheck({ postcode: "TD15 1AA", is_homeowner: "yes", current_heating: "gas" }).verdict).toBe("likely");
  });
});

describe("contact checks", () => {
  it("accepts UK numbers however they're typed", () => {
    for (const ok of ["07930 827644", "+447930827644", "+44 (0)7930 827644", "0044 7930 827644", "0121 496 0000", "01902 123456"]) {
      expect(isLikelyUkPhone(ok), ok).toBe(true);
    }
    for (const bad of ["12345", "0793082764", "079308276444", "+1 415 555 0100", "08000000000x"]) {
      expect(isLikelyUkPhone(bad), bad).toBe(false);
    }
  });

  it("checks the email's shape and offers fixes for common typos only", () => {
    expect(isLikelyEmail("jo@example.co.uk")).toBe(true);
    expect(isLikelyEmail("jo@example")).toBe(false);
    expect(isLikelyEmail("jo example.com")).toBe(false);
    expect(suggestEmail("Jo@Gmial.com")).toBe("jo@gmail.com");
    expect(suggestEmail("jo@yahoo.co")).toBe("jo@yahoo.co.uk");
    expect(suggestEmail("jo@gmail.com")).toBeNull();
    expect(suggestEmail("jo@smallbusiness.co.uk")).toBeNull();
  });
});
