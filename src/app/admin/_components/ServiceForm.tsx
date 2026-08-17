"use client";

import type { Service } from "@/data/site";
import { saveServiceAction, createServiceAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";

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
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Slug
            </label>
            <input
              name="slug"
              required
              placeholder="solar-pv-installations"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Title
          </label>
          <input
            name="title"
            defaultValue={initial?.title}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Short Name (used in headlines & CTAs)
          </label>
          <input
            name="shortName"
            defaultValue={initial?.shortName}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={2}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
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
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Quote Form Category
          </label>
          <select
            name="formCategory"
            defaultValue={initial?.formCategory}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          >
            {FORM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          Highlights (one per line)
        </label>
        <textarea
          name="highlights"
          defaultValue={initial?.highlights.join("\n")}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-zinc-800"
      >
        {isNew ? "Create Service" : "Save"}
      </button>
    </form>
  );
}
