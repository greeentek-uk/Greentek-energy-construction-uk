import type { ProblemSection, ServicePricing } from "@/data/site";

/**
 * Readers for the problem and "What it costs" sections posted by
 * ProblemSectionFields / PricingSectionFields.
 *
 * Plain module, not a server action: a "use server" file may only export async
 * functions, and these are shared by the service save and the location +
 * service save, which post the same field names.
 */

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The problem section, or null when its heading or every card is blank — null
 * rather than a half-empty object, so clearing the heading in the panel
 * reliably hides the section.
 */
export function readProblemSection(formData: FormData): ProblemSection | null {
  const text = (name: string) => String(formData.get(name) || "").trim();
  const cards = [0, 1, 2, 3]
    .map((i) => ({ title: text(`problemCardTitle_${i}`), body: text(`problemCardBody_${i}`) }))
    .filter((card) => card.title);
  const heading = text("problemHeading");
  if (!heading || cards.length === 0) return null;
  return {
    heading,
    intro: String(formData.get("problemIntro") || "").trim(),
    cards,
    ctaLabel: text("problemCta") || "Get a free survey",
  };
}

/** The "What it costs" section, or null when the heading is blank. */
export function readPricingSection(formData: FormData): ServicePricing | null {
  const text = (name: string) => String(formData.get(name) || "").trim();
  const heading = text("pricingHeading");
  if (!heading) return null;
  return {
    heading,
    intro: text("pricingIntro"),
    factors: [0, 1, 2, 3]
      .map((i) => ({ title: text(`pricingFactorTitle_${i}`), body: text(`pricingFactorBody_${i}`) }))
      .filter((f) => f.title),
    included: splitLines(String(formData.get("pricingIncluded") || "")),
    note: text("pricingNote"),
    ctaLabel: text("pricingCta") || "Get a fixed-price quote",
  };
}
