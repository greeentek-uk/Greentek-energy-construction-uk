"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { ProcessContent } from "@/data/pageContent";

export default function ProcessForm({ content }: { content: ProcessContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="process" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading Line 1" name="headingLine1" defaultValue={content.headingLine1} required />
        <Field label="Heading Line 2" name="headingLine2" defaultValue={content.headingLine2} required />
      </div>
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <RepeatingFieldList
        name="steps"
        defaultValue={content.steps}
        emptyItem={{ number: "", title: "", body: "" }}
        itemLabel={(i) => i.title}
        fields={[
          { key: "number", label: "Step Label (e.g. STEP 1)" },
          { key: "title", label: "Title" },
          { key: "body", label: "Body", textarea: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
