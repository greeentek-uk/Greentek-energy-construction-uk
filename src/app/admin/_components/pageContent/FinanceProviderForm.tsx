"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { FinanceProviderContent, PageContentKey } from "@/data/pageContent";

/**
 * One finance provider: its page at /finance/<provider> and its card on
 * /finance. Both providers use this same form, so they stay equivalent.
 */
export default function FinanceProviderForm({
  blockKey,
  content,
}: {
  blockKey: PageContentKey;
  content: FinanceProviderContent;
}) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value={blockKey} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Provider name" name="name" defaultValue={content.name} />
        <Field label="Page heading (H1)" name="heading" defaultValue={content.heading} />
      </div>
      <ImageUploadField
        name="logo"
        label="Provider logo (transparent PNG or SVG works best on the dark background)"
        defaultValue={content.logo}
        altName="logoAlt"
        altDefaultValue={content.logoAlt}
        altFallback={content.name}
      />
      <Field label="Introduction (also used on this provider's card on /finance)" name="intro" defaultValue={content.intro} textarea rows={3} />
      <Field label="Key points (one per line)" name="features" defaultValue={content.features.join("\n")} textarea rows={5} />
      <Field label="How it works" name="howItWorks" defaultValue={content.howItWorks} textarea rows={4} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Main button text" name="applyLabel" defaultValue={content.applyLabel} />
        <Field label="Main button link" name="applyUrl" defaultValue={content.applyUrl} placeholder="https://… or /contact" />
        <Field label="Second button text (optional)" name="secondaryLabel" defaultValue={content.secondaryLabel} />
        <Field label="Second button link" name="secondaryUrl" defaultValue={content.secondaryUrl} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Support line (optional)" name="supportText" defaultValue={content.supportText} />
        <Field label="Support phone (optional)" name="phone" defaultValue={content.phone} />
      </div>

      <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="text-sm font-bold text-amber-300">Regulatory wording — copy it exactly as the provider supplies it</p>
        <Field
          label="Risk warning (leave a blank line between paragraphs)"
          name="riskWarning"
          defaultValue={content.riskWarning}
          textarea
          rows={4}
        />
        <Field
          label="Mandatory disclosure statement (leave a blank line between paragraphs)"
          name="disclosure"
          defaultValue={content.disclosure}
          textarea
          rows={5}
        />
        <p className="text-xs text-white/50">
          Shown on this provider&apos;s page and on its card on /finance, as plain text exactly as
          entered.
        </p>
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
