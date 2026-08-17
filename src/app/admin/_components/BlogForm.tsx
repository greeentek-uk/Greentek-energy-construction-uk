"use client";

import { useState } from "react";
import type { BlogPost } from "@/data/blogs";
import { saveBlogPostAction } from "../_actions/blog";
import ImageUploadField from "./ImageUploadField";

type BlockType = BlogPost["content"][number]["type"];

interface BlockState {
  id: string;
  type: BlockType;
  text?: string;
  items?: string[];
  ctaText?: string;
  ctaLink?: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

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
      <label className="block text-xs font-semibold text-zinc-600 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      )}
    </div>
  );
}

export default function BlogForm({ post }: { post?: BlogPost }) {
  const [blocks, setBlocks] = useState<BlockState[]>(
    () =>
      post?.content.map((b) => ({ ...b, id: newId() })) || [
        { id: newId(), type: "paragraph", text: "" },
      ],
  );

  function updateType(id: string, type: BlockType) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, type } : b)));
  }

  function addBlock() {
    setBlocks((prev) => [...prev, { id: newId(), type: "paragraph", text: "" }]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <form action={saveBlogPostAction} className="space-y-6">
      <input type="hidden" name="originalSlug" value={post?.slug || ""} />

      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-zinc-900">Post Details</h2>
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

      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-zinc-900">SEO</h2>
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

      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">Content</h2>
          <button
            type="button"
            onClick={addBlock}
            className="text-sm font-semibold text-zinc-900 hover:underline"
          >
            + Add Block
          </button>
        </div>

        {blocks.map((block) => (
          <div key={block.id} className="border border-zinc-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <select
                name="block_type"
                value={block.type}
                onChange={(e) => updateType(block.id, e.target.value as BlockType)}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
              >
                <option value="heading">Heading</option>
                <option value="paragraph">Paragraph</option>
                <option value="list">List</option>
                <option value="cta">CTA</option>
              </select>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>

            {block.type === "list" ? (
              <>
                <textarea
                  name="block_items"
                  defaultValue={block.items?.join("\n")}
                  rows={4}
                  placeholder="One item per line"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
                <input type="hidden" name="block_text" value="" />
              </>
            ) : (
              <>
                <textarea
                  name="block_text"
                  defaultValue={block.text}
                  rows={block.type === "heading" ? 1 : 3}
                  placeholder={
                    block.type === "cta" ? "CTA body text (optional)" : "Text"
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
                <input type="hidden" name="block_items" value="" />
              </>
            )}

            {block.type === "cta" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  name="block_ctaText"
                  defaultValue={block.ctaText}
                  placeholder="Button text"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
                <input
                  name="block_ctaLink"
                  defaultValue={block.ctaLink}
                  placeholder="Button link"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
              </div>
            ) : (
              <>
                <input type="hidden" name="block_ctaText" value="" />
                <input type="hidden" name="block_ctaLink" value="" />
              </>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <p className="text-sm text-zinc-400">
            No content blocks yet — add one above.
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800"
      >
        Save Post
      </button>
    </form>
  );
}
