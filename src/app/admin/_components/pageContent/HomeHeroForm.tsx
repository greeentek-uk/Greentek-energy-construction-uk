"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { HomeHeroContent } from "@/data/pageContent";

export default function HomeHeroForm({ content }: { content: HomeHeroContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="home-hero" />
      <Field label="Trust Badge Suffix" name="trustBadgeSuffix" defaultValue={content.trustBadgeSuffix} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading Line 1" name="headingLine1" defaultValue={content.headingLine1} required />
        <Field label="Heading Line 2" name="headingLine2" defaultValue={content.headingLine2} required />
      </div>
      <Field label="Body" name="body" textarea defaultValue={content.body} required />
      <Field label="CTA Button Label" name="ctaLabel" defaultValue={content.ctaLabel} required />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
