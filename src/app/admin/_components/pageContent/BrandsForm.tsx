"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { BrandsContent } from "@/data/pageContent";

export default function BrandsForm({ content }: { content: BrandsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="brands" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
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
