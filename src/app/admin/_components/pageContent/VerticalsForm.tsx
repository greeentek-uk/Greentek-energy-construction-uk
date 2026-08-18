"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { VerticalsContent } from "@/data/pageContent";

export default function VerticalsForm({ content }: { content: VerticalsContent }) {
  const [group0, group1] = content.groups;

  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="verticals" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />

      {[group0, group1].map((group, gIdx) => (
        <div key={gIdx} className="border border-zinc-200 rounded-lg p-4 space-y-4 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500">Group {gIdx + 1}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" name={`group${gIdx}_name`} defaultValue={group?.name} required />
            <Field label="Href" name={`group${gIdx}_href`} defaultValue={group?.href} required />
          </div>
          <Field label="Intro" name={`group${gIdx}_intro`} textarea defaultValue={group?.intro} required />
          <RepeatingFieldList
            name={`group${gIdx}_services`}
            defaultValue={group?.services ?? []}
            emptyItem={{ title: "", body: "", href: "" }}
            itemLabel={(i) => i.title}
            fields={[
              { key: "title", label: "Title" },
              { key: "body", label: "Body", textarea: true },
              { key: "href", label: "Href" },
            ]}
          />
        </div>
      ))}

      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
