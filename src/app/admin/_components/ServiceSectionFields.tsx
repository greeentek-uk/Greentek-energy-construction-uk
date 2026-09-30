import type { ReactNode } from "react";
import type { ProblemSection, ServicePricing } from "@/data/site";

/**
 * The problem and "What it costs" editors, shared by the service form and the
 * location + service form so the two can't drift apart. Field names match the
 * readers in _actions/serviceSections.ts.
 *
 * With `inheritedFrom` (the location + service form) the section follows the
 * service's until this page is given its own. `inherited` pre-fills the
 * fields, and editing them is all it takes: the save keeps whatever differs
 * from the inherited copy as the page's own (_actions/inheritance.ts). There
 * used to be an "its own" tick box instead, and edits made without ticking it
 * were silently discarded. Once a page has its own, `resetName` offers the way
 * back.
 */

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

/**
 * Says whether this page has its own section or follows another, and offers
 * the way back. No title of its own: the editor section around it names it.
 * Shared with the process/stats fields so every inheritable section reads alike.
 */
export function InheritanceNote({
  own,
  inheritedFrom,
  resetName,
  help,
}: {
  own: boolean;
  /** "the Loft Insulation service" — where the copy comes from otherwise. */
  inheritedFrom?: string;
  resetName?: string;
  help?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      {inheritedFrom && (
        <p
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
            own ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/60"
          }`}
        >
          {own
            ? "This page has its own version of this section."
            : `Showing ${inheritedFrom}'s version. Edit anything below and Save — this page then keeps its own.`}
        </p>
      )}
      {own && inheritedFrom && resetName && (
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input type="checkbox" name={resetName} className="accent-[#c5eb02]" />
          Go back to {inheritedFrom}&apos;s version (discards this page&apos;s own on Save)
        </label>
      )}
      {help && <p className="text-xs text-white/50">{help}</p>}
    </div>
  );
}

export function ProblemSectionFields({
  initial: own,
  inherited,
  inheritedFrom,
  help,
}: {
  initial?: ProblemSection | null;
  /** Pre-fills the fields while this page has no section of its own. */
  inherited?: ProblemSection | null;
  /** Set when the section can follow another page's — see InheritanceNote. */
  inheritedFrom?: string;
  help?: ReactNode;
}) {
  const initial = own ?? inherited;
  return (
    <div className="space-y-4">
      <InheritanceNote
        own={Boolean(own)}
        inheritedFrom={inheritedFrom}
        resetName="resetProblem"
        help={help}
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
  initial: own,
  inherited,
  inheritedFrom,
  help,
}: {
  initial?: ServicePricing | null;
  /** Pre-fills the fields while this page has no section of its own. */
  inherited?: ServicePricing | null;
  /** Set when the section can follow another page's — see InheritanceNote. */
  inheritedFrom?: string;
  help?: ReactNode;
}) {
  const initial = own ?? inherited;
  return (
    <div className="space-y-4">
      <InheritanceNote
        own={Boolean(own)}
        inheritedFrom={inheritedFrom}
        resetName="resetPricing"
        help={help}
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
