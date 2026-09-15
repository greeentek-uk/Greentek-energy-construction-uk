"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { HomeHeroContent } from "@/data/pageContent";

export default function HomeHeroForm({ content }: { content: HomeHeroContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="home-hero" />

      <div className="space-y-4">
        <p className="text-xs font-semibold text-white/50">
          The homepage hero — one panel, with the quote form beside it.
        </p>

        <Field
          label="Trust badge text"
          name="trustBadgeSuffix"
          defaultValue={content.trustBadgeSuffix}
          required
        />

        <ImageUploadField
          name="image"
          label="Background image"
          defaultValue={content.image}
          required
          altName="imageAlt"
          altDefaultValue={content.imageAlt}
          altFallback={`${content.headingLine1} ${content.headingLine2}`.trim()}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Heading line 1" name="headingLine1" defaultValue={content.headingLine1} required />
          <Field label="Heading line 2" name="headingLine2" defaultValue={content.headingLine2} required />
        </div>

        <Field label="Body" name="body" textarea rows={3} defaultValue={content.body} required />
        <Field label="Button label" name="ctaLabel" defaultValue={content.ctaLabel} required />
      </div>

      <div className="border-t border-white/10 pt-6 space-y-4">
        <p className="text-xs font-semibold text-white/50">
          Quote form beside the hero — two steps: what they need and where, then
          their contact details.
        </p>
        <Field label="Form heading" name="formHeading" defaultValue={content.formHeading} required />
        <Field
          label="Form subheading"
          name="formSubheading"
          defaultValue={content.formSubheading}
          required
        />
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
