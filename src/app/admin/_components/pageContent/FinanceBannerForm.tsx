"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { FinanceBannerContent } from "@/data/pageContent";

export default function FinanceBannerForm({ content }: { content: FinanceBannerContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="finance-banner" />

      <Field
        label="Heading"
        name="heading"
        defaultValue={content.heading}
        placeholder="Finance options available"
      />

      <Field
        label="Finance provider name"
        name="providerName"
        defaultValue={content.providerName}
        placeholder="Ideal Finance"
      />

      <ImageUploadField
        name="logo"
        label="Provider logo"
        defaultValue={content.logo}
        altName="logoAlt"
        altDefaultValue={content.logoAlt}
        altFallback={content.providerName}
      />
      <p className="text-xs text-white/40 -mt-2">
        Leave blank and the provider name is shown as text instead. A transparent PNG or
        SVG works best against the dark background.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Link text"
          name="linkLabel"
          defaultValue={content.linkLabel}
          placeholder="Explore financing options"
        />
        <Field
          label="Link goes to"
          name="linkHref"
          defaultValue={content.linkHref}
          placeholder="/finance"
        />
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
