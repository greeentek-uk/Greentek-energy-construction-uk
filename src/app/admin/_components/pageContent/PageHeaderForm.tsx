"use client";
import Field from "../Field";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { PageHeaderContent, PageContentKey } from "@/data/pageContent";

export default function PageHeaderForm({
  blockKey,
  content,
}: {
  blockKey: PageContentKey;
  content: PageHeaderContent;
}) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value={blockKey} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading Prefix" name="headingPrefix" defaultValue={content.headingPrefix} required />
        <Field label="Heading Highlight (accent color)" name="headingHighlight" defaultValue={content.headingHighlight} required />
      </div>
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />
      <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800">
        Save Draft
      </button>
    </form>
  );
}
