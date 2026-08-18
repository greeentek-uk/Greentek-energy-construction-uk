"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { AboutUsSlideContent } from "@/data/pageContent";

export default function AboutUsSlideForm({ content }: { content: AboutUsSlideContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="about-us-slide" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Body" name="body" textarea defaultValue={content.body} required />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
