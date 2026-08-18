"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { CorePillarsContent } from "@/data/pageContent";

export default function CorePillarsForm({ content }: { content: CorePillarsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="core-pillars" />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Intro" name="intro" textarea defaultValue={content.intro} required />
      <RepeatingFieldList
        name="pillars"
        defaultValue={content.pillars}
        emptyItem={{ label: "", title: "", description: "", items: [] }}
        itemLabel={(i) => i.title}
        fields={[
          { key: "label", label: "Division Label (e.g. Division 01)" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", textarea: true },
          { key: "items", label: "Capability Labels", lines: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
