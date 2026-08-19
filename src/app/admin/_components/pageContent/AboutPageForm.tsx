"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { AboutPageContent } from "@/data/pageContent";

export default function AboutPageForm({ content }: { content: AboutPageContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="about-page" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Hero Heading Line 1" name="heroHeadingLine1" defaultValue={content.heroHeadingLine1} required />
        <Field label="Hero Heading Highlight (accent color)" name="heroHeadingHighlight" defaultValue={content.heroHeadingHighlight} required />
      </div>
      <Field label="Hero Subheading" name="heroSubheading" textarea defaultValue={content.heroSubheading} required />
      <Field label="Journey Heading" name="journeyHeading" defaultValue={content.journeyHeading} required />
      <Field
        label="Journey Paragraphs"
        name="journeyParagraphs"
        textarea
        rows={8}
        defaultValue={content.journeyParagraphs.join("\n")}
        placeholder="One paragraph per line"
        required
      />
      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
