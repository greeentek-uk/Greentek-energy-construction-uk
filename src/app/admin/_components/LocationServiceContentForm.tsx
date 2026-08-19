"use client";

import type { LocationServiceContent } from "@/data/site";
import { saveLocationServiceContentAction } from "../_actions/locationServiceContent";

export default function LocationServiceContentForm({
  locationSlug,
  serviceSlug,
  initial,
}: {
  locationSlug: string;
  serviceSlug: string;
  initial?: LocationServiceContent;
}) {
  return (
    <form action={saveLocationServiceContentAction} className="space-y-4">
      <input type="hidden" name="locationSlug" value={locationSlug} />
      <input type="hidden" name="serviceSlug" value={serviceSlug} />

      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Intro paragraph (replaces the generic service description on this page)
        </label>
        <textarea
          name="intro"
          defaultValue={initial?.intro}
          rows={3}
          required
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Local note (optional, replaces the generic &quot;covers this area&quot; sentence)
        </label>
        <textarea
          name="localNote"
          defaultValue={initial?.localNote}
          rows={2}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Highlights override (one per line, optional — falls back to the service&apos;s default highlights)
        </label>
        <textarea
          name="highlights"
          defaultValue={initial?.highlights?.join("\n")}
          rows={4}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Meta Title (optional)
          </label>
          <input
            name="metaTitle"
            defaultValue={initial?.metaTitle}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Meta Description (optional)
          </label>
          <input
            name="metaDescription"
            defaultValue={initial?.metaDescription}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        Save
      </button>
    </form>
  );
}
