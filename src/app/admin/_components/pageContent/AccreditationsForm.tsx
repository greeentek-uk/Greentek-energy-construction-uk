"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { AccreditationsContent } from "@/data/pageContent";

export default function AccreditationsForm({ content }: { content: AccreditationsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="accreditations" />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <RepeatingFieldList
        name="logos"
        defaultValue={content.logos}
        emptyItem={{ name: "", image: "" }}
        itemLabel={(i) => i.name}
        fields={[
          { key: "name", label: "Name (alt text)" },
          { key: "image", label: "Logo", image: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
