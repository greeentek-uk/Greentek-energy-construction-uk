import type { ReactNode } from "react";
import type { ProblemSection, ServicePricing } from "@/data/site";

/**
 * The problem and "What it costs" editors, shared by the service form and the
 * location + service form so the two can't drift apart. Field names match the
 * readers in _actions/serviceSections.ts.
 *
 * With `overrideName` the section gets a tick box and is an *override*: left
 * unticked (or ticked but blank) the page keeps the service's own section, so
 * 66 location + service pages don't all need filling in to keep working.
 */

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

function SectionHeader({
  title,
  help,
  overrideName,
  overrideLabel,
  overriding,
}: {
  title: string;
  help: ReactNode;
  overrideName?: string;
  overrideLabel?: string;
  overriding?: boolean;
}) {
  return (
    <div>
      {overrideName ? (
        <label className="flex items-center gap-2 font-bold text-white text-sm">
          <input
            type="checkbox"
            name={overrideName}
            defaultChecked={overriding}
            className="accent-[#c5eb02]"
          />
          {overrideLabel ?? title}
        </label>
      ) : (
        <h3 className="font-bold text-white text-sm">{title}</h3>
      )}
      <p className="text-xs text-white/50 mt-1">{help}</p>
    </div>
  );
}

export function ProblemSectionFields({
  initial,
  overrideName,
  help,
}: {
  initial?: ProblemSection | null;
  /** Tick box name; set it to make this an optional per-page override. */
  overrideName?: string;
  help: ReactNode;
}) {
  return (
    <div className="border-t border-white/10 pt-4 space-y-4">
      <SectionHeader
        title="Problem Section"
        help={help}
        overrideName={overrideName}
        overrideLabel="Give this page its own problem section"
        overriding={Boolean(initial)}
      />
      <div>
        <label className={label}>Heading</label>
        <input name="problemHeading" defaultValue={initial?.heading} className={input} />
      </div>
      <div>
        <label className={label}>Intro (leave a blank line between paragraphs)</label>
        <textarea name="problemIntro" defaultValue={initial?.intro} rows={5} className={input} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
            <label className="block text-xs font-semibold text-white/70">Card {i + 1} title</label>
            <input
              name={`problemCardTitle_${i}`}
              defaultValue={initial?.cards?.[i]?.title}
              className={input}
            />
            <label className="block text-xs font-semibold text-white/70">Card {i + 1} text</label>
            <textarea
              name={`problemCardBody_${i}`}
              defaultValue={initial?.cards?.[i]?.body}
              rows={2}
              className={input}
            />
          </div>
        ))}
      </div>
      <div>
        <label className={label}>Button text (scrolls to the enquiry form)</label>
        <input
          name="problemCta"
          defaultValue={initial?.ctaLabel}
          placeholder="Get a free survey"
          className={input}
        />
      </div>
    </div>
  );
}

export function PricingSectionFields({
  initial,
  overrideName,
  help,
}: {
  initial?: ServicePricing | null;
  overrideName?: string;
  help: ReactNode;
}) {
  return (
    <div className="border-t border-white/10 pt-4 space-y-4">
      <SectionHeader
        title="What It Costs Section"
        help={help}
        overrideName={overrideName}
        overrideLabel="Give this page its own “What it costs” section"
        overriding={Boolean(initial)}
      />
      <div>
        <label className={label}>Heading</label>
        <input name="pricingHeading" defaultValue={initial?.heading} className={input} />
      </div>
      <div>
        <label className={label}>Intro</label>
        <textarea name="pricingIntro" defaultValue={initial?.intro} rows={3} className={input} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
            <label className="block text-xs font-semibold text-white/70">
              What moves the price {i + 1} — title
            </label>
            <input
              name={`pricingFactorTitle_${i}`}
              defaultValue={initial?.factors?.[i]?.title}
              className={input}
            />
            <label className="block text-xs font-semibold text-white/70">Text</label>
            <textarea
              name={`pricingFactorBody_${i}`}
              defaultValue={initial?.factors?.[i]?.body}
              rows={2}
              className={input}
            />
          </div>
        ))}
      </div>
      <div>
        <label className={label}>Every quote includes (one per line)</label>
        <textarea
          name="pricingIncluded"
          defaultValue={initial?.included?.join("\n")}
          rows={4}
          className={input}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Closing note (finance, no-obligation survey…)</label>
          <textarea name="pricingNote" defaultValue={initial?.note} rows={2} className={input} />
        </div>
        <div>
          <label className={label}>Button text</label>
          <input
            name="pricingCta"
            defaultValue={initial?.ctaLabel}
            placeholder="Get a fixed-price quote"
            className={input}
          />
        </div>
      </div>
    </div>
  );
}
