"use client";

import Field from "./Field";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import { savePageAction } from "../_actions/pages";
import type { SitePage } from "@/data/pages";

export default function PageForm({ page }: { page?: SitePage }) {
  const isNew = !page;

  return (
    <form action={savePageAction} className="space-y-8">
      <input type="hidden" name="originalSlug" value={page?.slug ?? ""} />

      <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Page title" name="title" defaultValue={page?.title} required />
          <div>
            <Field
              label="URL slug"
              name="slug"
              defaultValue={page?.slug}
              placeholder={isNew ? "Leave blank to build from the title" : undefined}
            />
            <p className="text-xs text-white/40 mt-1">
              The page will live at <code className="bg-white/5 px-1 rounded">/{page?.slug || "your-slug"}</code>
            </p>
          </div>
        </div>

        <Field
          label="Heading shown on the page"
          name="heading"
          defaultValue={page?.heading}
          placeholder="Defaults to the page title"
        />
        <Field
          label="Intro line"
          name="subheading"
          textarea
          rows={2}
          defaultValue={page?.subheading}
        />

        <ImageUploadField
          name="heroImage"
          label="Hero image (optional)"
          defaultValue={page?.heroImage}
          altName="heroImageAlt"
          altDefaultValue={page?.heroImageAlt}
          altFallback={page?.title}
        />
      </section>

      <section className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <ContentBlocksEditor initial={page?.content} />
      </section>

      <section className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <FaqEditor initial={page?.faqs} />
      </section>

      <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm">Search engines</h3>
        <Field
          label="Meta title"
          name="metaTitle"
          defaultValue={page?.metaTitle}
          placeholder="Leave blank to use the site template"
        />
        <Field
          label="Meta description"
          name="metaDescription"
          textarea
          rows={2}
          defaultValue={page?.metaDescription}
        />
        <p className="text-xs text-white/40">
          Canonical URL, social cards, noindex and schema for this page are in{" "}
          <span className="text-white/70">Page SEO</span> and{" "}
          <span className="text-white/70">Schema</span> once it&apos;s saved.
        </p>
      </section>

      <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            name="published"
            defaultChecked={page?.published ?? false}
            className="accent-[#c5eb02] mt-1"
          />
          <span>
            Published
            <span className="block text-xs text-white/40">
              Unpublished pages return 404 to visitors and stay out of the sitemap, so you
              can build a page over several sessions before it goes live.
            </span>
          </span>
        </label>
        <div className="max-w-[160px]">
          <Field label="Order" name="order" type="number" defaultValue={String(page?.order ?? 0)} />
        </div>
      </section>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
      >
        {isNew ? "Create Page" : "Save Page"}
      </button>
    </form>
  );
}
