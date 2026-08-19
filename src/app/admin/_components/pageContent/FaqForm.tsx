"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { FaqContent } from "@/data/pageContent";

export default function FaqForm({ content }: { content: FaqContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="faq" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ question: "", answer: "" }}
        itemLabel={(i) => i.question}
        fields={[
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", textarea: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
