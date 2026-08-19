"use client";

import type { Location } from "@/data/site";
import { saveLocationAction, createLocationAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";

export default function LocationForm({ initial }: { initial?: Location }) {
  const isNew = !initial;

  return (
    <form
      action={isNew ? createLocationAction : saveLocationAction}
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
              placeholder="wolverhampton"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Name
          </label>
          <input
            name="name"
            defaultValue={initial?.name}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Region
          </label>
          <input
            name="region"
            defaultValue={initial?.region}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
      </div>
      <ImageUploadField
        name="image"
        label="Image"
        defaultValue={initial?.image}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          Tagline
        </label>
        <input
          name="tagline"
          defaultValue={initial?.tagline}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          Blurb
        </label>
        <textarea
          name="blurb"
          defaultValue={initial?.blurb}
          rows={3}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          Nearby Areas (comma-separated)
        </label>
        <input
          name="nearbyAreas"
          defaultValue={initial?.nearbyAreas.join(", ")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="isHomeBase"
          defaultChecked={initial?.isHomeBase}
          className="rounded border-zinc-300"
        />
        This is the home base location
      </label>

      <div className="border-t border-zinc-200 pt-4 space-y-4">
        <h3 className="font-bold text-zinc-900 text-sm">SEO</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Meta Title (falls back to the default title if blank)
          </label>
          <input
            name="metaTitle"
            defaultValue={initial?.metaTitle}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Meta Description (falls back to the default description if blank)
          </label>
          <textarea
            name="metaDescription"
            defaultValue={initial?.metaDescription}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <ContentBlocksEditor initial={initial?.content} />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-zinc-800"
      >
        {isNew ? "Create Location" : "Save"}
      </button>
    </form>
  );
}
