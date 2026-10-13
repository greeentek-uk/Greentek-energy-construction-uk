import { describe, expect, it } from "vitest";
import {
  allBudgetOptions,
  budgetOptions,
  budgetOptionsFor,
  heroServiceOptions,
  isAllowedPhoto,
  isLikelyPostcode,
  optionLabel,
  ownerOptions,
  isOfferedService,
  serviceLabel,
  serviceOptionValue,
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
  it("construction list matches the service pages, in order", () => {
    expect(heroServiceOptions.construction.map((o) => o.label)).toEqual([
      "Full home renovation", "Kitchen renovation", "Bathroom renovation", "Single storey extension", "Loft conversion",
      "Living room improvements", "Commercial planned maintenance", "Multiple areas", "Not sure yet",
    ]);
  });

  it("every option value is unique across both lists", () => {
    const values = [...heroServiceOptions.construction, ...heroServiceOptions.energy].map((o) => o.value).filter(Boolean);
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
    expect(serviceLabel("construction_kitchen")).toBe("Construction — Kitchen renovation");
    expect(serviceLabel("energy_heat_pump")).toBe("Energy — Air source heat pump");
    expect(serviceLabel("solar_storage")).toBe("Solar PV & Battery Storage");
    expect(serviceLabel("energy_battery"), "retired values still read in the email").toBe("Energy — Battery storage");
    expect(serviceLabel("unknown")).toBe("");
    expect(optionLabel(budgetOptions, "guidance")).toBe("I need guidance");
    expect(optionLabel(budgetOptions, "")).toBe("");
  });

  it("bathrooms and kitchens get their own budget bands, and every band is named in the email", () => {
    const labels = (service: string) => budgetOptionsFor(service).filter((o) => o.value).map((o) => o.label);
    expect(labels("construction_bathroom")).toEqual(["£2,999–£5,999", "£6,000–£9,999", "£10,000 or more", "I need guidance"]);
    expect(labels("construction_kitchen")).toEqual(["£4,999–£9,999", "£10,000–£19,999", "£20,000 or more", "I need guidance"]);
    expect(budgetOptionsFor("solar_pv")).toBe(budgetOptions);
    expect(budgetOptionsFor("")).toBe(budgetOptions);
    expect(optionLabel(allBudgetOptions, "bathroom_6k_10k")).toBe("£6,000–£9,999");
    expect(optionLabel(allBudgetOptions, "bathroom_3k_6k"), "a retired band is still named").toBe("£3,000–£6,000");
    expect(optionLabel(allBudgetOptions, "50k_100k")).toBe("£50,000–£100,000");
  });
});

describe("serviceOptionValue", () => {
  it("picks the specific option for a service page", () => {
    expect(serviceOptionValue({ slug: "kitchen-renovations", formCategory: "refurb_extension" })).toBe("construction_kitchen");
    expect(serviceOptionValue({ slug: "solar-pv-installations", formCategory: "solar_storage" })).toBe("energy_solar_pv");
  });

  it("falls back to the category for a service the forms don't list yet", () => {
    expect(serviceOptionValue({ slug: "new-thing", formCategory: "insulation" })).toBe("insulation");
    expect(isOfferedService("insulation")).toBe(false);
    expect(serviceLabel("insulation")).toBe("Insulation");
  });
});
