"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { WhyChooseUsContent } from "@/data/pageContent";

export default function HomeWhyChooseUsForm({ content }: { content: WhyChooseUsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="home-why-choose-us" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ id: "", title: "", description: "", image: "" }}
        itemLabel={(i) => i.title}
        fields={[
          { key: "id", label: "ID (slug, unique)" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", textarea: true },
          { key: "image", label: "Image", image: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
