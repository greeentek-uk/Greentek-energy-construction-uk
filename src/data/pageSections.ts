import type { ProcessContent, StatsContent } from "./pageContent";

/**
 * Per-page overrides for sections that otherwise come from a shared block or a
 * fixed label in the code.
 *
 * The point is SEO: 77 service, location and location + service pages that all
 * say "What's Included" and run the identical four process steps read as one
 * template repeated, which is exactly what search engines discount. Anything
 * left blank falls back to the shared wording, so a page only carries the copy
 * someone deliberately wrote for it.
 */

/** Fixed section labels a page can reword. Blank means "use the built-in wording". */
export interface SectionLabels {
  problemEyebrow?: string;
  includedHeading?: string;
  pricingEyebrow?: string;
  pricingIncludedHeading?: string;
  accreditationsHeading?: string;
  testimonialsEyebrow?: string;
  testimonialsHeading?: string;
  testimonialsSubheading?: string;
  ctaEyebrow?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

export interface PageSectionOverrides {
  labels?: SectionLabels;
  /** Replaces the shared Process block on this page only. Null = use the shared one. */
  process?: ProcessContent | null;
  /** Replaces the shared Stats block on this page only. Null = use the shared one. */
  stats?: StatsContent | null;
}

/** The label a page asked for, or the built-in default. */
export function label(
  overrides: PageSectionOverrides | null | undefined,
  key: keyof SectionLabels,
  fallback: string,
): string {
  return overrides?.labels?.[key]?.trim() || fallback;
}
