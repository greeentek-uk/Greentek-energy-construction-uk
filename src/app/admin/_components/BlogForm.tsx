"use client";

import type { BlogPost } from "@/data/blogs";
import { saveBlogPostAction } from "../_actions/blog";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";

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

export default function BlogForm({ post }: { post?: BlogPost }) {
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
          label="Excerpt"
          name="excerpt"
          textarea
          defaultValue={post?.excerpt}
          required
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUploadField
            name="coverImage"
            label="Cover Image"
            defaultValue={post?.coverImage}
            required
          />
          <Field
            label="Cover Image Alt Text"
            name="coverImageAlt"
            defaultValue={post?.coverImageAlt}
            required
          />
        </div>
        <Field
          label="Instagram URL (optional)"
          name="instagramUrl"
          defaultValue={post?.instagramUrl}
        />
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
        <ContentBlocksEditor initial={post?.content} />
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
