import type { PageSectionOverrides } from "@/data/pageSections";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const LABEL_FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: "problemEyebrow", label: "Problem section — small label", placeholder: "Sound familiar?" },
  { name: "includedHeading", label: "“What’s included” heading", placeholder: "What's Included" },
  { name: "pricingEyebrow", label: "Costs section — small label", placeholder: "What it costs" },
  {
    name: "pricingIncludedHeading",
    label: "Costs — list heading",
    placeholder: "Every quote includes",
  },
  {
    name: "accreditationsHeading",
    label: "Accreditations heading",
    placeholder: "Fully Accredited & Certified.",
  },
  {
    name: "testimonialsEyebrow",
    label: "Reviews — small label",
    placeholder: "What our customers say",
  },
  { name: "testimonialsHeading", label: "Reviews — heading", placeholder: "Trusted by homeowners" },
  { name: "testimonialsSubheading", label: "Reviews — text", placeholder: "Real reviews…" },
  { name: "ctaEyebrow", label: "Final CTA — small label", placeholder: "Free Quote" },
  { name: "ctaHeading", label: "Final CTA — heading", placeholder: "Get a Free … Quote" },
  { name: "ctaDescription", label: "Final CTA — text", placeholder: "Tell us about your project…" },
];

/**
 * Per-page overrides for the sections that otherwise come from a shared block
 * or a fixed label, so each page can carry its own wording.
 *
 * Collapsed by default and blank by default: an untouched page keeps the
 * shared copy, and only what someone deliberately writes here is stored.
 */
export default function PageSectionsEditor({
  initial,
}: {
  initial?: PageSectionOverrides | null;
}) {
  return (
    <details className="border-t border-white/10 pt-4">
      <summary className="cursor-pointer font-bold text-white text-sm">
        Page Sections — headings, process steps and stats for this page
      </summary>
      <p className="text-xs text-white/50 mt-2">
        Everything here is optional. Leave a field blank and this page uses the shared wording;
        fill it in and only this page changes. Use it to keep pages from reading like the same
        template repeated.
      </p>

      <div className="mt-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#c5eb02]">
          Section headings
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {LABEL_FIELDS.map((field) => (
            <div key={field.name}>
              <label className={label}>{field.label}</label>
              <input
                name={`label_${field.name}`}
                defaultValue={
                  initial?.labels?.[field.name as keyof typeof initial.labels] ?? ""
                }
                placeholder={field.placeholder}
                className={input}
              />
            </div>
          ))}
        </div>
      </div>

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
            <input name="processEyebrow" defaultValue={initial?.process?.eyebrow} className={input} />
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
    </details>
  );
}
