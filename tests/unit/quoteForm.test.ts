import { describe, expect, it } from "vitest";
import {
  budgetOptions,
  heroServiceOptions,
  isAllowedPhoto,
  isLikelyPostcode,
  optionLabel,
  ownerOptions,
  serviceLabel,
  serviceOptions,
  timelineOptions,
} from "@/lib/quoteForm";

describe("isLikelyPostcode", () => {
  it.each(["WV1 1AA", "wv11aa", "B1 1AA", "CF10 1EP", "SW1A 2AA", "M1 1AE", " EC1A 1BB "])("accepts %s", (pc) => {
    expect(isLikelyPostcode(pc)).toBe(true);
  });
  it.each(["hello", "12345", "", "WV1 1AA extra"])("rejects %j", (pc) => {
    expect(isLikelyPostcode(pc)).toBe(false);
  });
});

describe("isAllowedPhoto", () => {
  it.each([
    ["a.jpg", "image/jpeg"],
    ["a.JPEG", ""],
    ["a.png", "image/png"],
    ["IMG_0001.HEIC", ""],
    ["photo", "image/heic"],
  ])("allows %s (%s)", (name, type) => expect(isAllowedPhoto({ name, type })).toBe(true));

  it.each([
    ["a.gif", "image/gif"],
    ["a.webp", "image/webp"],
    ["a.pdf", "application/pdf"],
    ["a.jpg.exe", "application/octet-stream"],
  ])("refuses %s (%s)", (name, type) => expect(isAllowedPhoto({ name, type })).toBe(false));
});

describe("options", () => {
  it("construction list is exactly what was asked for, in order", () => {
    expect(heroServiceOptions.construction.map((o) => o.label)).toEqual([
      "Full property", "Kitchen", "Bathroom", "Extension", "Loft conversion", "Living space", "Multiple areas", "Not sure yet",
    ]);
  });

  it("every option value is unique across both lists", () => {
    const values = [...heroServiceOptions.construction, ...heroServiceOptions.energy, ...serviceOptions].map((o) => o.value).filter(Boolean);
    expect(new Set(values).size).toBe(values.length);
  });

  it("timeline, budget and owner lists match the brief", () => {
    expect(timelineOptions.filter((o) => o.value).map((o) => o.label)).toEqual(["As soon as possible", "Within 1–3 months", "Within 3–6 months"]);
    expect(budgetOptions.filter((o) => o.value).map((o) => o.label)).toEqual([
      "Under £25,000", "£25,000–£50,000", "£50,000–£100,000", "More than £100,000", "I need guidance",
    ]);
    expect(ownerOptions.map((o) => o.label)).toEqual(["Yes", "No", "Buying the property"]);
  });

  it("labels values for the email", () => {
    expect(serviceLabel("construction_kitchen")).toBe("Construction — Kitchen");
    expect(serviceLabel("energy_heat_pump")).toBe("Energy — Air source heat pump");
    expect(serviceLabel("solar_storage")).toBe("Solar PV & Battery Storage");
    expect(serviceLabel("unknown")).toBe("");
    expect(optionLabel(budgetOptions, "guidance")).toBe("I need guidance");
    expect(optionLabel(budgetOptions, "")).toBe("");
  });
});
