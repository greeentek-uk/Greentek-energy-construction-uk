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

      <div className="space-y-4 border-t border-white/10 pt-5">
        <p className="text-sm font-bold text-white">Second finance provider (optional)</p>
        <Field
          label="Second provider name"
          name="provider2Name"
          defaultValue={content.provider2Name}
          placeholder="Phoenix"
        />
        <ImageUploadField
          name="logo2"
          label="Second provider logo"
          defaultValue={content.logo2}
          altName="logo2Alt"
          altDefaultValue={content.logo2Alt}
          altFallback={content.provider2Name}
        />
        <p className="text-xs text-white/40 -mt-2">
          Shown beside the first provider. Leave both blank to show one provider only.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="First logo links to"
          name="logoHref"
          defaultValue={content.logoHref}
          placeholder="/finance/ideal4finance"
        />
        <Field
          label="Second logo links to"
          name="logo2Href"
          defaultValue={content.logo2Href}
          placeholder="/finance/phoenix"
        />
      </div>
      <p className="text-xs text-white/40 -mt-2">
        Leave blank and each logo opens its provider&apos;s own finance page.
      </p>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
