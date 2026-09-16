"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import {
  PROJECT_COUNT_OPTIONS,
  DEFAULT_PROJECT_COUNT,
  type ProjectsPreviewContent,
} from "@/data/pageContent";

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
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Projects shown on the homepage
        </label>
        <select
          name="projectCount"
          defaultValue={content.projectCount || DEFAULT_PROJECT_COUNT}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        >
          {PROJECT_COUNT_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count} projects
            </option>
          ))}
        </select>
        <p className="text-xs text-white/40 mt-1">
          The grid is three across, so these keep the last row full. If you have fewer
          projects than this, all of them show.
        </p>
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
