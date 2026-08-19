"use client";

import type { Service } from "@/data/site";
import { saveServiceAction, createServiceAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";

const FORM_CATEGORIES = [
  "solar_storage",
  "heating_boiler",
  "insulation",
  "refurb_extension",
  "commercial",
];

export default function ServiceForm({ initial }: { initial?: Service }) {
  const isNew = !initial;

  return (
    <form
      action={isNew ? createServiceAction : saveServiceAction}
      className="space-y-4"
    >
      {!isNew && <input type="hidden" name="slug" value={initial.slug} />}
      <div className="grid sm:grid-cols-2 gap-4">
        {isNew && (
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Slug
            </label>
            <input
              name="slug"
              required
              placeholder="solar-pv-installations"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Title
          </label>
          <input
            name="title"
            defaultValue={initial?.title}
            required
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Short Name (used in headlines & CTAs)
          </label>
          <input
            name="shortName"
            defaultValue={initial?.shortName}
            required
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={2}
          required
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploadField
          name="image"
          label="Image"
          defaultValue={initial?.image}
          required
        />
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Quote Form Category
          </label>
          <select
            name="formCategory"
            defaultValue={initial?.formCategory}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          >
            {FORM_CATEGORIES.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Highlights (one per line)
        </label>
        <textarea
          name="highlights"
          defaultValue={initial?.highlights.join("\n")}
          rows={4}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>

      <div className="border-t border-white/10 pt-4 space-y-4">
        <h3 className="font-bold text-white text-sm">SEO</h3>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Meta Title (falls back to Title if blank)
          </label>
          <input
            name="metaTitle"
            defaultValue={initial?.metaTitle}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Meta Description (falls back to Description if blank)
          </label>
          <textarea
            name="metaDescription"
            defaultValue={initial?.metaDescription}
            rows={2}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <ContentBlocksEditor initial={initial?.content} />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {isNew ? "Create Service" : "Save"}
      </button>
    </form>
  );
}
