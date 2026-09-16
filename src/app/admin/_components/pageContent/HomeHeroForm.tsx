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

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Rating word"
            name="ratingLabel"
            defaultValue={content.ratingLabel}
            placeholder="Excellent"
          />
          <Field
            label="Score out of 5"
            name="ratingScore"
            defaultValue={content.ratingScore}
            placeholder="4.4"
          />
        </div>
        <Field
          label="Trustpilot profile URL"
          name="ratingUrl"
          defaultValue={content.ratingUrl}
          placeholder="https://www.trustpilot.com/review/greentekenergy.co.uk"
        />
        <p className="text-xs text-white/40 -mt-2">
          Shows as <span className="text-white/70">Excellent — stars — Trustpilot</span> in
          the hero, linking to your profile. The score fills the stars, so 4.4 leaves the
          last star 40% full. These figures don&apos;t update on their own — check your
          Trustpilot page now and again and edit them here.
        </p>

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
        <p className="text-xs text-white/40 -mt-2">
          The heading always renders as exactly two lines. Keep each line to roughly 25
          characters — the text scales down to fit the space, so a longer line shrinks the
          whole heading and a much longer one wraps onto a third line.
        </p>

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
