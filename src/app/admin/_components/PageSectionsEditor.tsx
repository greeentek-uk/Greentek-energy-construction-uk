import {
  BLOCKS_BY_KIND,
  LABELS_BY_KIND,
  type PageSectionOverrides,
  type SectionLabelKey,
  type SectionPageKind,
} from "@/data/pageSections";
import { InheritanceNote } from "./ServiceSectionFields";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const LABEL_FIELDS: Record<
  SectionLabelKey,
  { label: string; placeholder: string; multiline?: boolean }
> = {
  heroHeading: {
    label: "Hero — heading (the page's whole H1)",
    placeholder: "The page's title",
  },
  heroHighlight: {
    label: "Hero — words to show in green (copy them from the heading; blank = all white)",
    placeholder: "Nothing highlighted",
  },
  heroBody: {
    label: "Hero — text",
    placeholder: "The description",
    multiline: true,
  },
  formHeading: {
    label: "Quote form box — heading",
    placeholder: "Get a free quote",
  },
  formSubheading: {
    label: "Quote form box — text under the heading",
    placeholder: "Four quick steps. We reply within one business day.",
  },
  heroCallLabel: {
    label: "Hero — call button",
    placeholder: "Consult an Expert",
  },
  heroWhatsappLabel: {
    label: "Hero — WhatsApp button",
    placeholder: "Contact on WhatsApp",
  },
  financeHeading: {
    label: "Finance strip — text",
    placeholder: "Finance options available using",
  },
  financeLinkLabel: {
    label: "Finance strip — link",
    placeholder: "Explore financing options",
  },
  servicesHeading: {
    label: "Services list — heading",
    placeholder: "Services in …",
  },
  servicesIntro: {
    label: "Services list — text",
    placeholder: "Every service below is delivered by our in-house team…",
    multiline: true,
  },
  areasHeading: {
    label: "Areas covered — heading",
    placeholder: "Areas we cover around …",
  },
  areasIntro: {
    label: "Areas covered — text",
    placeholder: "The same in-house team works across …",
    multiline: true,
  },
  problemEyebrow: {
    label: "Problem section — small label",
    placeholder: "Sound familiar?",
  },
  includedHeading: {
    label: "“What’s included” heading",
    placeholder: "What's Included",
  },
  caseStudyEyebrow: {
    label: "Case study — small label",
    placeholder: "Case study",
  },
  caseStudyHeading: {
    label: "Case study — heading",
    placeholder: "The project's title",
  },
  caseStudyText: {
    label: "Case study — text",
    placeholder: "The project's description",
    multiline: true,
  },
  caseStudyButton: {
    label: "Case study — button",
    placeholder: "I want results like this",
  },
  caseStudyLink: {
    label: "Case study — link to project",
    placeholder: "See the full project",
  },
  pricingEyebrow: {
    label: "Costs section — small label",
    placeholder: "What it costs",
  },
  pricingIncludedHeading: {
    label: "Costs — list heading",
    placeholder: "Every quote includes",
  },
  accreditationsHeading: {
    label: "Accreditations heading",
    placeholder: "Fully Accredited & Certified.",
  },
  testimonialsEyebrow: {
    label: "Reviews — small label",
    placeholder: "What our customers say",
  },
  testimonialsHeading: {
    label: "Reviews — heading",
    placeholder: "Trusted by homeowners",
  },
  testimonialsSubheading: {
    label: "Reviews — text",
    placeholder: "Real reviews…",
  },
  faqHeading: {
    label: "FAQs — heading",
    placeholder: "Frequently asked questions",
  },
  ctaEyebrow: { label: "Final CTA — small label", placeholder: "Free Quote" },
  ctaHeading: {
    label: "Final CTA — heading",
    placeholder: "Get a Free … Quote",
  },
  ctaDescription: {
    label: "Final CTA — text",
    placeholder: "Tell us about your project…",
    multiline: true,
  },
};

interface OverrideProps {
  initial?: PageSectionOverrides | null;
  /**
   * What this page shows today where it has no override of its own — the
   * service's, or the shared block. Labels show it as the placeholder; the
   * process and stats fields start from it, and whatever is changed from it is
   * saved as the page's own (see _actions/inheritance.ts).
   */
  inherited?: PageSectionOverrides | null;
}

/**
 * The inputs for some of a page's labels. The page editors render one of
 * these inside each section, with that section's keys from LABEL_GROUPS, so a
 * heading is edited next to the copy under it.
 */
export function LabelFields({
  keys,
  initial,
  inherited,
  placeholders,
}: OverrideProps & {
  keys: readonly SectionLabelKey[];
  /** This page's actual fallback wording, where the form knows it. */
  placeholders?: Partial<Record<SectionLabelKey, string>>;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {keys.map((key) => {
        const field = LABEL_FIELDS[key];
        const props = {
          name: `label_${key}`,
          defaultValue: initial?.labels?.[key] ?? "",
          placeholder: inherited?.labels?.[key] || placeholders?.[key] || field.placeholder,
          className: input,
        };
        return (
          <div key={key} className={field.multiline ? "sm:col-span-2" : undefined}>
            <label className={label}>{field.label}</label>
            {field.multiline ? <textarea {...props} rows={2} /> : <input {...props} />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * "How we work" steps. Pre-filled with the inherited ones; edited steps are
 * saved as this page's own, untouched ones keep following (inheritance.ts).
 */
export function ProcessFields({
  initial,
  inherited,
  inheritedFrom = "the shared block",
}: OverrideProps & { inheritedFrom?: string }) {
  const own = Boolean(initial?.process?.steps?.length);
  const process = own ? initial?.process : inherited?.process;
  return (
    <div className="space-y-4">
      <InheritanceNote
        own={own}
        // Nothing to follow (the project form passes no inherited copy): no note.
        inheritedFrom={inherited?.process ? inheritedFrom : undefined}
        resetName="resetProcess"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Small label</label>
          <input name="processEyebrow" defaultValue={process?.eyebrow} className={input} />
        </div>
        <div>
          <label className={label}>Subheading</label>
          <input name="processSubheading" defaultValue={process?.subheading} className={input} />
        </div>
        <div>
          <label className={label}>Heading — first line</label>
          <input name="processHeadingLine1" defaultValue={process?.headingLine1} className={input} />
        </div>
        <div>
          <label className={label}>Heading — second line</label>
          <input name="processHeadingLine2" defaultValue={process?.headingLine2} className={input} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
            <div className="grid grid-cols-[4rem_1fr] gap-2">
              <div>
                <label className={label}>No.</label>
                <input
                  name={`processStepNumber_${i}`}
                  defaultValue={process?.steps?.[i]?.number}
                  placeholder={String(i + 1).padStart(2, "0")}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Step {i + 1} title</label>
                <input
                  name={`processStepTitle_${i}`}
                  defaultValue={process?.steps?.[i]?.title}
                  className={input}
                />
              </div>
            </div>
            <label className={label}>Step {i + 1} text</label>
            <textarea
              name={`processStepBody_${i}`}
              defaultValue={process?.steps?.[i]?.body}
              rows={2}
              className={input}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The three headline figures, following the same rule as ProcessFields. */
export function StatsFields({
  initial,
  inherited,
  inheritedFrom = "the shared block",
}: OverrideProps & { inheritedFrom?: string }) {
  const own = Boolean(initial?.stats?.items?.length);
  const stats = own ? initial?.stats : inherited?.stats;
  return (
    <div className="space-y-4">
      <InheritanceNote
        own={own}
        inheritedFrom={inherited?.stats ? inheritedFrom : undefined}
        resetName="resetStats"
      />
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
            <label className={label}>Figure {i + 1}</label>
            <input
              name={`statValue_${i}`}
              defaultValue={stats?.items?.[i]?.value}
              placeholder="500+"
              className={input}
            />
            <label className={label}>Label</label>
            <input
              name={`statLabel_${i}`}
              defaultValue={stats?.items?.[i]?.label}
              placeholder="Projects Completed"
              className={input}
            />
            <label className={label}>Description</label>
            <textarea
              name={`statDescription_${i}`}
              defaultValue={stats?.items?.[i]?.description}
              rows={2}
              className={input}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Every label and block override for a page in one collapsed box — still used
 * by the project form. The service, location and location + service editors
 * place the pieces above inside each section instead.
 */
export default function PageSectionsEditor({
  initial,
  inherited,
  kind,
  placeholders,
}: OverrideProps & {
  /** Which page this is for — decides which fields are offered. */
  kind: SectionPageKind;
  placeholders?: Partial<Record<SectionLabelKey, string>>;
}) {
  const blocks = BLOCKS_BY_KIND[kind];
  return (
    <details className="border-t border-white/10 pt-4">
      <summary className="cursor-pointer font-bold text-white text-sm">
        Page Sections — every heading, label and button on this page
      </summary>
      <p className="text-xs text-white/50 mt-2">
        Everything here is optional. Leave a field blank and this page uses the shared wording; fill
        it in and only this page changes.
      </p>
      <div className="mt-5">
        <LabelFields
          keys={LABELS_BY_KIND[kind]}
          initial={initial}
          inherited={inherited}
          placeholders={placeholders}
        />
      </div>
      {blocks.process && (
        <div className="mt-6">
          <ProcessFields initial={initial} inherited={inherited} />
        </div>
      )}
      {blocks.stats && (
        <div className="mt-6">
          <StatsFields initial={initial} inherited={inherited} />
        </div>
      )}
    </details>
  );
}
