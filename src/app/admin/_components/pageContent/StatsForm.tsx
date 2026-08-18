"use client";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { StatsContent } from "@/data/pageContent";

export default function StatsForm({ content }: { content: StatsContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="stats" />
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ value: "", label: "", description: "" }}
        itemLabel={(i) => i.label}
        fields={[
          { key: "value", label: "Value (e.g. 500+)" },
          { key: "label", label: "Label" },
          { key: "description", label: "Description", textarea: true },
        ]}
      />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
