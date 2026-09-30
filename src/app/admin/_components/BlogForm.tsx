"use client";

import Link from "next/link";
import type { BlogPost } from "@/data/blogs";
import { saveBlogPostAction } from "../_actions/blog";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  textarea,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/70 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        />
      )}
    </div>
  );
}

export default function BlogForm({
  post,
  authors = [],
}: {
  post?: BlogPost;
  /** Everyone from Admin → Blog authors, for the Author picker. */
  authors?: { slug: string; name: string; role: string }[];
}) {
  return (
    <form action={saveBlogPostAction} className="space-y-6">
      <input type="hidden" name="originalSlug" value={post?.slug || ""} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-white">Post Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" name="title" defaultValue={post?.title} required />
          <Field label="Slug" name="slug" defaultValue={post?.slug} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Date"
            name="date"
            type="date"
            defaultValue={post?.date}
            required
          />
          <Field
            label="Category"
            name="category"
            defaultValue={post?.category}
            required
          />
        </div>
        <Field
          label="Excerpt (shown on blog cards, not on the post itself)"
          name="excerpt"
          textarea
          defaultValue={post?.excerpt}
          required
        />
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Author (shows the &quot;About the author&quot; box at the end of the post)
          </label>
          <select
            name="authorSlug"
            defaultValue={post?.authorSlug ?? ""}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02]"
          >
            <option value="" className="text-black">No author box</option>
            {authors.map((a) => (
              <option key={a.slug} value={a.slug} className="text-black">
                {a.name}{a.role ? ` — ${a.role}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-white/40">
            Add or edit authors in <Link href="/admin/authors" className="underline hover:text-white">Blog authors</Link>.
          </p>
        </div>

        {/* Two images, because one crop can't serve both: the cards are
            portrait and the post's own image is landscape. Both are shown
            cover-cropped from the centre, so keep the subject in the middle. */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <ImageUploadField
              name="coverImage"
              label="Card image — portrait 4:5 (e.g. 1080 × 1350), used on the blog cards"
              defaultValue={post?.coverImage}
              required
            />
            <Field
              label="Card image alt text"
              name="coverImageAlt"
              defaultValue={post?.coverImageAlt}
              required
            />
          </div>
          <div className="space-y-3">
            <ImageUploadField
              name="heroImage"
              label="Post image — landscape 16:9 (e.g. 1600 × 900), top of the post (optional — uses the card image if blank)"
              defaultValue={post?.heroImage}
            />
            <Field
              label="Post image alt text"
              name="heroImageAlt"
              defaultValue={post?.heroImageAlt}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-white">SEO</h2>
        <Field
          label="Meta Title"
          name="metaTitle"
          defaultValue={post?.metaTitle}
          required
        />
        <Field
          label="Meta Description"
          name="metaDescription"
          textarea
          defaultValue={post?.metaDescription}
          required
        />
        <Field
          label="Keywords (comma-separated)"
          name="keywords"
          defaultValue={post?.keywords?.join(", ")}
        />
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <ContentBlocksEditor
          initial={post?.content}
          toc={post?.toc ?? null}
          // Posts end with Next Steps (incl. Contact Us), so no in-body CTA box.
          exclude={["cta"]}
        />
      </div>

      <FaqEditor initial={post?.faqs} />

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
      >
        Save Post
      </button>
    </form>
  );
}
