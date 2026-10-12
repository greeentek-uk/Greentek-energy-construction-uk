"use client";

import Link from "next/link";
import type { BlogPost } from "@/data/blogs";
import { saveBlogPostAction } from "../_actions/blog";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import { RELATED_POST_COUNT } from "@/lib/relatedPosts";

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
  allPosts = [],
}: {
  post?: BlogPost;
  /** Everyone from Admin → Blog authors, for the Author picker. */
  authors?: { slug: string; name: string; role: string }[];
  /** Every post, for the "Related articles" pickers. */
  allPosts?: { slug: string; title: string; category: string }[];
}) {
  const otherPosts = allPosts.filter((p) => p.slug !== post?.slug);
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
          label="Meta Title (used exactly as written — the site name isn't added, so include it if you want it)"
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

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-bold text-white">Related articles</h2>
          <p className="mt-1 text-xs text-white/50">
            The {RELATED_POST_COUNT} cards at the end of this post. Leave a slot on Automatic to use
            the newest posts in the same category (then the newest from any category).
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: RELATED_POST_COUNT }, (_, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-white/70 mb-1">Card {i + 1}</label>
              <select
                name={`relatedPost${i}`}
                defaultValue={post?.relatedPosts?.[i] ?? ""}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02]"
              >
                <option value="" className="text-black">Automatic</option>
                {otherPosts.map((p) => (
                  <option key={p.slug} value={p.slug} className="text-black">
                    {p.title}{p.category ? ` (${p.category})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
      >
        Save Post
      </button>
    </form>
  );
}
