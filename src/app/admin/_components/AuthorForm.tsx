"use client";

import { useState } from "react";
import type { Author } from "@/data/authors";
import { saveAuthorAction } from "../_actions/authors";
import ImageUploadField from "./ImageUploadField";
import RichTextInput from "./RichTextInput";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

/** One author's profile — shown in the "About the author" box on their posts. */
export default function AuthorForm({ author }: { author?: Author }) {
  const [bio, setBio] = useState(author?.bio ?? "");

  return (
    <form action={saveAuthorAction} className="space-y-5 rounded-xl border border-white/10 bg-[#101314] p-6">
      <input type="hidden" name="originalSlug" value={author?.slug ?? ""} />
      <input type="hidden" name="bio" value={bio} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input name="name" defaultValue={author?.name} required placeholder="e.g. Andy Smith" className={input} />
        </div>
        <div>
          <label className={label}>Role</label>
          <input
            name="role"
            defaultValue={author?.role}
            placeholder="e.g. Renewable Energy Surveyor at Greentek"
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Bio (what they do, their experience — bold, italic and links allowed)</label>
        <RichTextInput
          value={bio}
          onChange={setBio}
          placeholder="Written by … Andy has surveyed and designed over 300 solar and heat pump installations…"
        />
      </div>

      <ImageUploadField
        name="photo"
        label="Photo (square works best — shown as a circle)"
        defaultValue={author?.photo}
        altName="photoAlt"
        altDefaultValue={author?.photoAlt}
        altFallback={author?.name}
      />

      <div>
        <label className={label}>Profile link (optional — e.g. LinkedIn; the name links to it)</label>
        <input
          name="profileUrl"
          type="url"
          defaultValue={author?.profileUrl}
          placeholder="https://www.linkedin.com/in/…"
          className={input}
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#c5eb02]/80"
      >
        {author ? "Save author" : "Create author"}
      </button>
    </form>
  );
}
