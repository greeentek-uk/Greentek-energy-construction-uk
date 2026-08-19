"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { AreasContent } from "@/data/pageContent";

export default function AreasForm({ content }: { content: AreasContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="areas" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} required />

      <div className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
        <p className="text-xs font-semibold text-white/50">Large / Home Base Area</p>
        <Field label="Name" name="largeArea_name" defaultValue={content.largeArea.name} required />
        <Field label="Stat" name="largeArea_stat" defaultValue={content.largeArea.stat} />
        <Field label="Note" name="largeArea_note" defaultValue={content.largeArea.note} />
        <Field label="Path" name="largeArea_path" defaultValue={content.largeArea.path} required />
        <ImageUploadField name="largeArea_image" label="Image" defaultValue={content.largeArea.image} required />
      </div>

      <RepeatingFieldList
        name="smallAreas"
        defaultValue={content.smallAreas}
        emptyItem={{ name: "", image: "", path: "" }}
        itemLabel={(i) => i.name}
        fields={[
          { key: "name", label: "Name" },
          { key: "path", label: "Path (e.g. /locations/dudley)" },
          { key: "image", label: "Image", image: true },
        ]}
      />

      <Field
        label="Marquee Ticker Items"
        name="tickerItems"
        textarea
        rows={6}
        defaultValue={content.tickerItems.join("\n")}
        placeholder="One city per line"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ticker Label" name="tickerLabel" defaultValue={content.tickerLabel} required />
        <Field label="CTA Button Label" name="ctaLabel" defaultValue={content.ctaLabel} required />
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
