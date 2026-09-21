"use client";

import type { Project, Service } from "@/data/site";
import { saveProjectAction, createProjectAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import MultiImageUploadField from "./MultiImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";

export default function ProjectForm({
  initial,
  services,
}: {
  initial?: Project;
  services: Service[];
}) {
  const isNew = !initial;

  return (
    <form
      action={isNew ? createProjectAction : saveProjectAction}
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
              placeholder="solar-install-wolverhampton"
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
            Category
          </label>
          <input
            name="category"
            defaultValue={initial?.category}
            required
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Related Service
        </label>
        <select
          name="service"
          defaultValue={initial?.service}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        >
          <option value="" className="text-black">— None —</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug} className="text-black">
              {s.title}
            </option>
          ))}
        </select>
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
          name="before"
          label="Before Image"
          defaultValue={initial?.before}
          required
          altName="beforeAlt"
          altDefaultValue={initial?.beforeAlt}
          altFallback={initial?.title ? `${initial.title} — before` : undefined}
        />
        <ImageUploadField
          name="after"
          label="After Image"
          defaultValue={initial?.after}
          required
          altName="afterAlt"
          altDefaultValue={initial?.afterAlt}
          altFallback={initial?.title ? `${initial.title} — after` : undefined}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Overview Paragraphs (one per line)
        </label>
        <textarea
          name="overview"
          defaultValue={initial?.overview?.join("\n")}
          rows={3}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      </div>
      <MultiImageUploadField
        name="gallery"
        label="Extra Gallery Images"
        defaultValue={initial?.gallery}
        altName="galleryAlt"
        altDefaultValue={initial?.galleryAlt}
      />
      {/* Owner review — the customer whose property is in the photos above. */}
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm">Owner Review</h3>
          <p className="text-xs text-white/50 mt-1">
            What the property owner said about this job. Shown under the photos. Leave the
            quote blank to hide the section.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Quote</label>
          <textarea name="reviewQuote" defaultValue={initial?.review?.quote} rows={3} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Name</label>
            <input name="reviewName" defaultValue={initial?.review?.name} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Role or place (optional)
            </label>
            <input
              name="reviewRole"
              defaultValue={initial?.review?.role}
              placeholder="Homeowner, Solihull"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Rating</label>
            <select name="reviewRating" defaultValue={String(initial?.review?.rating ?? 5)} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all">
              {[5, 4, 3, 2, 1, 0].map((n) => (
                <option key={n} value={n} className="text-black">
                  {n === 0 ? "No stars" : `${n} star${n === 1 ? "" : "s"}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Long-form body and FAQs, the same editors the service pages use. */}
      <div className="border-t border-white/10 pt-4">
        <ContentBlocksEditor initial={initial?.content} />
      </div>

      <FaqEditor initial={initial?.faqs} />

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {isNew ? "Create Project" : "Save"}
      </button>
    </form>
  );
}
