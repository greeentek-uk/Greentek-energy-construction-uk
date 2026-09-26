import { describe, expect, it } from "vitest";
import { readPricingSection, readProblemSection } from "@/app/admin/_actions/serviceSections";

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("readProblemSection", () => {
  it("is null without a heading or a card, so a location page falls back to its service's", () => {
    expect(readProblemSection(form({}))).toBeNull();
    expect(readProblemSection(form({ problemHeading: "Cold rooms?" }))).toBeNull();
    expect(readProblemSection(form({ problemCardTitle_0: "Draughts" }))).toBeNull();
  });

  it("drops untitled cards and defaults the button text", () => {
    const out = readProblemSection(
      form({
        problemHeading: " Cold rooms in Solihull? ",
        problemIntro: "One\n\nTwo",
        problemCardTitle_0: "Draughts",
        problemCardBody_0: "Air gets in",
        problemCardBody_1: "Body with no title",
        problemCardTitle_2: "Bills",
      }),
    );
    expect(out).toEqual({
      heading: "Cold rooms in Solihull?",
      intro: "One\n\nTwo",
      cards: [
        { title: "Draughts", body: "Air gets in" },
        { title: "Bills", body: "" },
      ],
      ctaLabel: "Get a free survey",
    });
  });
});

describe("readPricingSection", () => {
  it("is null without a heading", () => {
    expect(readPricingSection(form({ pricingIntro: "Some text" }))).toBeNull();
  });

  it("splits the included list and keeps only titled factors", () => {
    const out = readPricingSection(
      form({
        pricingHeading: "What it costs",
        pricingFactorTitle_1: "Roof size",
        pricingFactorBody_1: "More panels",
        pricingIncluded: "Survey\n\n  Scaffolding \n",
      }),
    );
    expect(out?.factors).toEqual([{ title: "Roof size", body: "More panels" }]);
    expect(out?.included).toEqual(["Survey", "Scaffolding"]);
    expect(out?.ctaLabel).toBe("Get a fixed-price quote");
  });
});
