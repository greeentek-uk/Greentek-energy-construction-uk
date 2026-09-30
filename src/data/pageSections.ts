import type { ProcessContent, StatsContent, TestimonialsContent } from "./pageContent";

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
  "formHeading",
  "formSubheading",
  "heroCallLabel",
  "heroWhatsappLabel",
  "financeHeading",
  "financeLinkLabel",
  "servicesHeading",
  "servicesIntro",
  "areasHeading",
  "areasIntro",
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
/**
 * The hero's quote-form box and buttons, and the finance strip under it —
 * shared blocks that used to read identically on every service and location
 * page (the form heading was the same H2 on 83 URLs).
 */
const HERO_BOX: SectionLabelKey[] = ["formHeading", "formSubheading", "heroCallLabel", "heroWhatsappLabel"];
const FINANCE: SectionLabelKey[] = ["financeHeading", "financeLinkLabel"];

export const LABELS_BY_KIND: Record<SectionPageKind, SectionLabelKey[]> = {
  service: ["heroHeading", "heroHighlight", "heroBody", ...HERO_BOX, ...FINANCE, ...SERVICE_BODY, ...CTA],
  location: [
    "heroHeading",
    "heroHighlight",
    "heroBody",
    ...HERO_BOX,
    ...FINANCE,
    "servicesHeading",
    "servicesIntro",
    "areasHeading",
    "areasIntro",
    ...CASE_STUDY,
    "testimonialsEyebrow",
    "testimonialsHeading",
    "testimonialsSubheading",
    "faqHeading",
    ...CTA,
    "accreditationsHeading",
  ],
  // The H1 and hero text have their own fields on the location + service form.
  locationService: [...HERO_BOX, ...FINANCE, ...SERVICE_BODY, ...CTA],
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

/**
 * The same labels, grouped by the section of the page they sit in, so each
 * editor can put a section's headings next to that section's copy instead of
 * in one box of every label at the bottom.
 *
 * Every label a kind offers must appear in exactly one group — a label the form
 * doesn't render would be posted blank and wiped on save. The unit test checks.
 */
export const LABEL_GROUPS = {
  service: {
    hero: ["heroHeading", "heroHighlight", "heroBody", ...HERO_BOX],
    finance: FINANCE,
    problem: ["problemEyebrow"],
    included: ["includedHeading"],
    caseStudy: CASE_STUDY,
    testimonials: ["testimonialsEyebrow", "testimonialsHeading", "testimonialsSubheading"],
    accreditations: ["accreditationsHeading"],
    pricing: ["pricingEyebrow", "pricingIncludedHeading"],
    faq: ["faqHeading"],
    cta: CTA,
  },
  location: {
    hero: ["heroHeading", "heroHighlight", "heroBody", ...HERO_BOX],
    finance: FINANCE,
    services: ["servicesHeading", "servicesIntro"],
    areas: ["areasHeading", "areasIntro"],
    caseStudy: CASE_STUDY,
    testimonials: ["testimonialsEyebrow", "testimonialsHeading", "testimonialsSubheading"],
    faq: ["faqHeading"],
    cta: CTA,
    accreditations: ["accreditationsHeading"],
  },
  // The hero H1 is a top-level field on this form, not a label.
  locationService: {
    hero: HERO_BOX,
    finance: FINANCE,
    problem: ["problemEyebrow"],
    included: ["includedHeading"],
    caseStudy: CASE_STUDY,
    testimonials: ["testimonialsEyebrow", "testimonialsHeading", "testimonialsSubheading"],
    accreditations: ["accreditationsHeading"],
    pricing: ["pricingEyebrow", "pricingIncludedHeading"],
    faq: ["faqHeading"],
    cta: CTA,
  },
} satisfies Record<Exclude<SectionPageKind, "project">, Record<string, SectionLabelKey[]>>;

/** Which of the Process / Stats overrides a kind of page renders. */
export const BLOCKS_BY_KIND: Record<SectionPageKind, { process: boolean; stats: boolean }> = {
  service: { process: true, stats: true },
  location: { process: true, stats: true },
  locationService: { process: true, stats: true },
  project: { process: true, stats: true },
};

export interface PageSectionOverrides {
  labels?: SectionLabels;
  /** Replaces the shared Process block on this page only. Null = use the shared one. */
  process?: ProcessContent | null;
  /** Replaces the shared Stats block on this page only. Null = use the shared one. */
  stats?: StatsContent | null;
  /**
   * Which of the shared reviews this page shows, in order, by `reviewKey`.
   * Unset = inherit (the service's choice on a combo, else every review).
   * Reviews are picked, never written per page: they're real customers' words.
   */
  reviews?: string[];
}

type Review = TestimonialsContent["items"][number];

/**
 * A review's identity for page selections: its name and the start of its
 * words, not its position, so reordering or adding reviews in the shared list
 * doesn't silently swap which ones a page shows.
 */
export function reviewKey(review: Pick<Review, "name" | "quote">): string {
  return `${review.name.trim()}::${review.quote.trim().slice(0, 40)}`;
}

/** The shared reviews as the editors' picker lists them. */
export function reviewPool(items: Review[]) {
  return items.map((r) => ({ key: reviewKey(r), name: r.name, role: r.role, quote: r.quote }));
}

/**
 * The reviews a page shows: its chosen ones in its order, or all of them.
 * A selection whose reviews have all since been deleted falls back to all,
 * rather than leaving an empty testimonials section.
 */
export function selectReviews<T extends Pick<Review, "name" | "quote">>(
  items: T[],
  keys: string[] | undefined,
): T[] {
  if (!keys?.length) return items;
  const byKey = new Map(items.map((r) => [reviewKey(r), r]));
  const picked = keys.map((k) => byKey.get(k)).filter((r): r is T => Boolean(r));
  return picked.length ? picked : items;
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
