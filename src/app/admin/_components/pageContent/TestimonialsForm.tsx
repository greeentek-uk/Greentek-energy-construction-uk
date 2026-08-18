"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { TestimonialsContent } from "@/data/pageContent";

export default function TestimonialsForm({ content }: { content: TestimonialsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="testimonials" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ name: "", quote: "", role: "", rating: 5, image: "" }}
        itemLabel={(i) => i.name}
        fields={[
          { key: "name", label: "Name" },
          { key: "role", label: "Role (e.g. Home Owner)" },
          { key: "quote", label: "Quote", textarea: true },
          { key: "rating", label: "Rating (1-5)", type: "number" },
          { key: "image", label: "Photo", image: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
