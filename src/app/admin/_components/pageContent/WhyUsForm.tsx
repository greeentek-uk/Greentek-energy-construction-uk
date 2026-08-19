"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { WhyUsContent } from "@/data/pageContent";

export default function WhyUsForm({ content }: { content: WhyUsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="why-us" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading Line 1" name="headingLine1" defaultValue={content.headingLine1} required />
        <Field label="Heading Line 2" name="headingLine2" defaultValue={content.headingLine2} required />
      </div>
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ heading: "", body: "" }}
        itemLabel={(i) => i.heading}
        fields={[
          { key: "heading", label: "Heading" },
          { key: "body", label: "Body", textarea: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
