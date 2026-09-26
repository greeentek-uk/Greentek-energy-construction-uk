import {
  BLOCKS_BY_KIND,
  LABELS_BY_KIND,
  type PageSectionOverrides,
  type SectionLabelKey,
  type SectionPageKind,
} from "@/data/pageSections";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const LABEL_FIELDS: Record<
  SectionLabelKey,
  { label: string; placeholder: string; multiline?: boolean }
> = {
  heroHeading: {
    label: "Hero — heading (the page's H1)",
    placeholder: "The page's title",
  },
  heroHighlight: {
    label: "Hero — highlighted end of the heading",
    placeholder: "Shown in brand green after the heading",
  },
  heroBody: {
    label: "Hero — text",
    placeholder: "The description",
    multiline: true,
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

/**
 * Per-page overrides for the sections that otherwise come from a shared block
 * or a fixed label, so each page can carry its own wording.
 *
 * Collapsed by default and blank by default: an untouched page keeps the
 * shared copy, and only what someone deliberately writes here is stored.
 */
export default function PageSectionsEditor({
  initial,
  kind,
  placeholders,
}: {
  initial?: PageSectionOverrides | null;
  /** Which page this is for — decides which fields are offered. */
  kind: SectionPageKind;
  /** This page's actual fallback wording, where the form knows it. */
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
        it in and only this page changes. Use it to keep pages from reading like the same template
        repeated.
      </p>

      <div className="mt-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#c5eb02]">
          Section headings
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {LABELS_BY_KIND[kind].map((key) => {
            const field = LABEL_FIELDS[key];
            const props = {
              name: `label_${key}`,
              defaultValue: initial?.labels?.[key] ?? "",
              placeholder: placeholders?.[key] ?? field.placeholder,
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
      </div>

      {blocks.process && (
        <>
          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#c5eb02]">
              <input
                type="checkbox"
                name="overrideProcess"
                defaultChecked={Boolean(initial?.process?.steps?.length)}
                className="accent-[#c5eb02]"
              />
              Give this page its own process steps
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Small label</label>
                <input
                  name="processEyebrow"
                  defaultValue={initial?.process?.eyebrow}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Subheading</label>
                <input
                  name="processSubheading"
                  defaultValue={initial?.process?.subheading}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Heading — first line</label>
                <input
                  name="processHeadingLine1"
                  defaultValue={initial?.process?.headingLine1}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Heading — second line</label>
                <input
                  name="processHeadingLine2"
                  defaultValue={initial?.process?.headingLine2}
                  className={input}
                />
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
                        defaultValue={initial?.process?.steps?.[i]?.number}
                        placeholder={String(i + 1).padStart(2, "0")}
                        className={input}
                      />
                    </div>
                    <div>
                      <label className={label}>Step {i + 1} title</label>
                      <input
                        name={`processStepTitle_${i}`}
                        defaultValue={initial?.process?.steps?.[i]?.title}
                        className={input}
                      />
                    </div>
                  </div>
                  <label className={label}>Step {i + 1} text</label>
                  <textarea
                    name={`processStepBody_${i}`}
                    defaultValue={initial?.process?.steps?.[i]?.body}
                    rows={2}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {blocks.stats && (
        <>
          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#c5eb02]">
              <input
                type="checkbox"
                name="overrideStats"
                defaultChecked={Boolean(initial?.stats?.items?.length)}
                className="accent-[#c5eb02]"
              />
              Give this page its own stats
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
                  <label className={label}>Figure {i + 1}</label>
                  <input
                    name={`statValue_${i}`}
                    defaultValue={initial?.stats?.items?.[i]?.value}
                    placeholder="500+"
                    className={input}
                  />
                  <label className={label}>Label</label>
                  <input
                    name={`statLabel_${i}`}
                    defaultValue={initial?.stats?.items?.[i]?.label}
                    placeholder="Projects Completed"
                    className={input}
                  />
                  <label className={label}>Description</label>
                  <textarea
                    name={`statDescription_${i}`}
                    defaultValue={initial?.stats?.items?.[i]?.description}
                    rows={2}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </details>
  );
}
