"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ContentBlock } from "@/data/content";
import RichTextInput from "./RichTextInput";
import ImageUploadField from "./ImageUploadField";

type BlockType = ContentBlock["type"];

interface BlockState extends ContentBlock {
  id: string;
}

const BLOCK_LABELS: { value: BlockType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "list", label: "List" },
  { value: "image", label: "Image" },
  { value: "quote", label: "Quote" },
  { value: "cta", label: "Call to action" },
];

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

/**
 * Body-copy editor shared by blog posts, services, locations and pages.
 *
 * Submits parallel `block_*` fields read back by `parseContentBlocks()`
 * (src/app/admin/_actions/contentBlocks.ts). One per `<form>` — field names
 * aren't namespaced.
 */
export default function ContentBlocksEditor({ initial }: { initial?: ContentBlock[] }) {
  const [blocks, setBlocks] = useState<BlockState[]>(
    () =>
      initial?.map((b) => ({ ...b, id: newId() })) || [
        { id: newId(), type: "paragraph", text: "" },
      ],
  );

  function update(id: string, patch: Partial<BlockState>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [
      ...prev,
      { id: newId(), type, text: "", ...(type === "list" ? { items: [""] } : {}) },
    ]);
  }

  function move(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Content</h3>
        <span className="text-xs text-white/40">
          {blocks.length} block{blocks.length === 1 ? "" : "s"}
        </span>
      </div>

      {blocks.map((block, index) => (
        <div key={block.id} className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
          {/* Hidden fields carry this block's values through the form post. */}
          <input type="hidden" name="block_type" value={block.type} />
          <input type="hidden" name="block_text" value={block.text ?? ""} />
          <input type="hidden" name="block_items" value={(block.items ?? []).join("\n")} />
          <input type="hidden" name="block_level" value={String(block.level ?? 2)} />
          <input type="hidden" name="block_ordered" value={block.ordered ? "1" : ""} />
          <input type="hidden" name="block_ctaText" value={block.ctaText ?? ""} />
          <input type="hidden" name="block_ctaLink" value={block.ctaLink ?? ""} />
          <input type="hidden" name="block_src" value={block.src ?? ""} />
          <input type="hidden" name="block_alt" value={block.alt ?? ""} />
          <input type="hidden" name="block_caption" value={block.caption ?? ""} />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={block.type}
                onChange={(e) => update(block.id, { type: e.target.value as BlockType })}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#c5eb02]"
              >
                {BLOCK_LABELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {block.type === "heading" && (
                <select
                  value={block.level ?? 2}
                  onChange={(e) =>
                    update(block.id, { level: Number(e.target.value) as 2 | 3 })
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#c5eb02]"
                >
                  <option value={2}>H2 — section</option>
                  <option value={3}>H3 — sub-section</option>
                </select>
              )}

              {block.type === "list" && (
                <label className="flex items-center gap-1.5 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={Boolean(block.ordered)}
                    onChange={(e) => update(block.id, { ordered: e.target.checked })}
                    className="accent-[#c5eb02]"
                  />
                  Numbered
                </label>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                className="h-7 w-7 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1}
                className="h-7 w-7 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                className="h-7 w-7 grid place-items-center rounded text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {(block.type === "paragraph" || block.type === "quote") && (
            <RichTextInput
              value={block.text ?? ""}
              onChange={(text) => update(block.id, { text })}
              placeholder={
                block.type === "quote" ? "Pull quote…" : "Write the paragraph…"
              }
            />
          )}

          {block.type === "heading" && (
            <RichTextInput
              value={block.text ?? ""}
              onChange={(text) => update(block.id, { text })}
              placeholder="Heading text…"
              multiline={false}
            />
          )}

          {block.type === "list" && (
            <div className="space-y-2">
              {(block.items ?? []).map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2">
                  <span className="text-xs text-white/30 pt-3 w-4 shrink-0">
                    {block.ordered ? `${itemIndex + 1}.` : "•"}
                  </span>
                  <div className="flex-1">
                    <RichTextInput
                      value={item}
                      onChange={(text) =>
                        update(block.id, {
                          items: (block.items ?? []).map((v, i) => (i === itemIndex ? text : v)),
                        })
                      }
                      placeholder="List item…"
                      multiline={false}
                    />
                  </div>
                  <button type="button"
                    onClick={() => update(block.id, { items: (block.items ?? []).filter((_, i) => i !== itemIndex) })}
                    className="h-7 w-7 grid place-items-center rounded text-red-400 hover:bg-red-500/10 mt-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={() => update(block.id, { items: [...(block.items ?? []), ""] })}
                className="text-xs font-semibold text-[#c5eb02] hover:underline">
                + Add item
              </button>
            </div>
          )}

          {block.type === "image" && (
            <div className="space-y-3">
              <ImageUploadField
                name={`__no_submit_image_${block.id}`}
                label="Image"
                defaultValue={block.src}
                onChange={(src) => update(block.id, { src })}
              />
              <input
                value={block.alt ?? ""}
                onChange={(e) => update(block.id, { alt: e.target.value })}
                placeholder="Alt text — describe what the image shows"
                className={inputClass}
              />
              <input
                value={block.caption ?? ""}
                onChange={(e) => update(block.id, { caption: e.target.value })}
                placeholder="Caption (optional)"
                className={inputClass}
              />
            </div>
          )}

          {block.type === "cta" && (
            <div className="space-y-3">
              <RichTextInput
                value={block.text ?? ""}
                onChange={(text) => update(block.id, { text })}
                placeholder="Call-to-action text…"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={block.ctaText ?? ""}
                  onChange={(e) => update(block.id, { ctaText: e.target.value })}
                  placeholder="Button label"
                  className={inputClass}
                />
                <input
                  value={block.ctaLink ?? ""}
                  onChange={(e) => update(block.id, { ctaLink: e.target.value })}
                  placeholder="/contact"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {BLOCK_LABELS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => addBlock(option.value)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:border-[#c5eb02]/50 transition-colors"
          >
            + {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
