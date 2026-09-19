"use client";

import type { Service } from "@/data/site";
import { saveServiceAction, createServiceAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";

const FORM_CATEGORIES = [
  "solar_storage",
  "heating_boiler",
  "insulation",
  "refurb_extension",
  "commercial",
];

export default function ServiceForm({
  initial,
  projects = [],
}: {
  initial?: Service;
  /** Every project, for the case study picker. */
  projects?: { slug: string; title: string; service: string }[];
}) {
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
          altName="imageAlt"
          altDefaultValue={initial?.imageAlt}
          altFallback={initial?.title}
        />
        <ImageUploadField
          name="heroImage"
          label="Hero Background (optional — falls back to Image)"
          defaultValue={initial?.heroImage}
          altName="heroImageAlt"
          altDefaultValue={initial?.heroImageAlt}
          altFallback={initial?.imageAlt || initial?.title}
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

      <div className="border-t border-white/10 pt-4">
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Case Study Project
        </label>
        <select
          name="caseStudyProject"
          defaultValue={initial?.caseStudyProject ?? ""}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        >
          <option value="" className="text-black">
            Automatic — this service&apos;s own project, if it has one
          </option>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug} className="text-black">
              {project.title}
              {initial && project.service === initial.slug ? " (this service)" : ""}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/50 mt-1">
          Shown as the before/after case study on this service&apos;s page. With Automatic and
          no project linked to this service, no case study is shown.
        </p>
      </div>

      {/* Problem section — shown on this service's page and on every
          location + service page for it. Leave the heading blank to hide it. */}
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm">Problem Section</h3>
          <p className="text-xs text-white/50 mt-1">
            Names the reader&apos;s frustration before the page describes the fix. Appears after
            the finance banner on this service&apos;s page and all of its location pages. Leave
            the heading blank to hide it.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Heading</label>
          <input
            name="problemHeading"
            defaultValue={initial?.problem?.heading}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Intro (leave a blank line between paragraphs)
          </label>
          <textarea
            name="problemIntro"
            defaultValue={initial?.problem?.intro}
            rows={5}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
              <label className="block text-xs font-semibold text-white/70">
                Card {i + 1} title
              </label>
              <input
                name={`problemCardTitle_${i}`}
                defaultValue={initial?.problem?.cards?.[i]?.title}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
              />
              <label className="block text-xs font-semibold text-white/70">Card {i + 1} text</label>
              <textarea
                name={`problemCardBody_${i}`}
                defaultValue={initial?.problem?.cards?.[i]?.body}
                rows={2}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Button text (scrolls to the enquiry form)
          </label>
          <input
            name="problemCta"
            defaultValue={initial?.problem?.ctaLabel}
            placeholder="Get a free survey"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>

      <FaqEditor initial={initial?.faqs} />

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {isNew ? "Create Service" : "Save"}
      </button>
    </form>
  );
}
