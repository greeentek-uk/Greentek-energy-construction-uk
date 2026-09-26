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

/**
 * Every fixed piece of wording a page can reword. The one list both the save
 * (readPageSections) and the editor are typed from, so a label can't be added
 * to one and forgotten in the other.
 */
export const SECTION_LABEL_KEYS = [
  "heroHeading",
  "heroHighlight",
  "heroBody",
  "servicesHeading",
  "servicesIntro",
  "problemEyebrow",
  "includedHeading",
  "caseStudyEyebrow",
  "caseStudyHeading",
  "caseStudyText",
  "caseStudyButton",
  "caseStudyLink",
  "pricingEyebrow",
  "pricingIncludedHeading",
  "accreditationsHeading",
  "testimonialsEyebrow",
  "testimonialsHeading",
  "testimonialsSubheading",
  "faqHeading",
  "ctaEyebrow",
  "ctaHeading",
  "ctaDescription",
] as const;

export type SectionLabelKey = (typeof SECTION_LABEL_KEYS)[number];

/** Fixed section labels a page can reword. Blank means "use the built-in wording". */
export type SectionLabels = Partial<Record<SectionLabelKey, string>>;

/**
 * The kinds of page that carry section overrides. Each shows a different set
 * of sections, and the editor only offers the labels that page really renders
 * — a field that silently does nothing is worse than no field.
 */
export type SectionPageKind = "service" | "location" | "locationService" | "project";

const CASE_STUDY: SectionLabelKey[] = [
  "caseStudyEyebrow",
  "caseStudyHeading",
  "caseStudyText",
  "caseStudyButton",
  "caseStudyLink",
];
const SERVICE_BODY: SectionLabelKey[] = [
  "problemEyebrow",
  "includedHeading",
  ...CASE_STUDY,
  "testimonialsEyebrow",
  "testimonialsHeading",
  "testimonialsSubheading",
  "accreditationsHeading",
  "pricingEyebrow",
  "pricingIncludedHeading",
  "faqHeading",
];
const CTA: SectionLabelKey[] = ["ctaEyebrow", "ctaHeading", "ctaDescription"];

export const LABELS_BY_KIND: Record<SectionPageKind, SectionLabelKey[]> = {
  service: ["heroHeading", "heroHighlight", "heroBody", ...SERVICE_BODY, ...CTA],
  location: [
    "heroHeading",
    "heroHighlight",
    "heroBody",
    "servicesHeading",
    "servicesIntro",
    "faqHeading",
    ...CTA,
    "accreditationsHeading",
  ],
  // The hero has its own fields on the location + service form.
  locationService: [...SERVICE_BODY, ...CTA],
  project: [
    "problemEyebrow",
    "testimonialsEyebrow",
    "testimonialsHeading",
    "testimonialsSubheading",
    "accreditationsHeading",
    "pricingEyebrow",
    "pricingIncludedHeading",
    "faqHeading",
    ...CTA,
  ],
};

/** Which of the Process / Stats overrides a kind of page renders. */
export const BLOCKS_BY_KIND: Record<SectionPageKind, { process: boolean; stats: boolean }> = {
  service: { process: true, stats: true },
  location: { process: false, stats: true },
  locationService: { process: true, stats: true },
  project: { process: true, stats: true },
};

export interface PageSectionOverrides {
  labels?: SectionLabels;
  /** Replaces the shared Process block on this page only. Null = use the shared one. */
  process?: ProcessContent | null;
  /** Replaces the shared Stats block on this page only. Null = use the shared one. */
  stats?: StatsContent | null;
}

/** The case study wording a page asked for, in ProjectCaseStudy's shape. */
export function caseStudyLabels(overrides: PageSectionOverrides | null | undefined) {
  const l = overrides?.labels;
  return {
    eyebrow: l?.caseStudyEyebrow?.trim(),
    heading: l?.caseStudyHeading?.trim(),
    text: l?.caseStudyText?.trim(),
    button: l?.caseStudyButton?.trim(),
    link: l?.caseStudyLink?.trim(),
  };
}

/** The label a page asked for, or the built-in default. */
export function label(
  overrides: PageSectionOverrides | null | undefined,
  key: SectionLabelKey,
  fallback: string,
): string {
  return overrides?.labels?.[key]?.trim() || fallback;
}
