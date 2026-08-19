"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { ProjectsPreviewContent } from "@/data/pageContent";

export default function ProjectsPreviewForm({ content }: { content: ProjectsPreviewContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="projects-preview" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={'"Before" Badge Label'} name="beforeBadgeLabel" defaultValue={content.beforeBadgeLabel} required />
        <Field label="CTA Button Label" name="ctaLabel" defaultValue={content.ctaLabel} required />
      </div>
      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
