"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ContentBlock } from "@/data/content";
import RichTextInput from "./RichTextInput";
import ImageUploadField from "./ImageUploadField";
import TableBlockEditor from "./TableBlockEditor";
import TocPanel from "./TocPanel";
import type { TocSettings } from "@/lib/toc";

const HEADING_LEVELS = [
  { value: 1, label: "H1 — page title level" },
  { value: 2, label: "H2 — section" },
  { value: 3, label: "H3 — sub-section" },
  { value: 4, label: "H4" },
  { value: 5, label: "H5" },
  { value: 6, label: "H6" },
];

/** A fresh table: a heading row and two rows under it, three columns wide. */
const EMPTY_TABLE = () => Array.from({ length: 3 }, () => ["", "", ""]);

type BlockType = ContentBlock["type"];

interface BlockState extends ContentBlock {
  id: string;
}

const BLOCK_LABELS: { value: BlockType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "list", label: "List" },
  { value: "image", label: "Image" },
  { value: "table", label: "Table" },
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
export default function ContentBlocksEditor({
  initial,
  toc,
  exclude = [],
}: {
  initial?: ContentBlock[];
  /** Block types this page doesn't render (blog posts: "cta"), so they aren't offered. */
  exclude?: BlockType[];
  /**
   * Set (even to null) to edit a table of contents alongside the headings —
   * blog posts. Other pages don't render one, so they don't offer it.
   */
  toc?: TocSettings | null;
}) {
  const withToc = toc !== undefined;
  const offered = BLOCK_LABELS.filter((o) => !exclude.includes(o.value));
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
      {
        id: newId(),
        type,
        text: "",
        ...(type === "list" ? { items: [""] } : {}),
        ...(type === "table" ? { rows: EMPTY_TABLE(), headerRow: true } : {}),
      },
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
          <input type="hidden" name="block_table" value={JSON.stringify(block.rows ?? [])} />
          <input type="hidden" name="block_tableHeader" value={block.headerRow === false ? "" : "1"} />
          <input type="hidden" name="block_tocLabel" value={block.tocLabel ?? ""} />
          <input type="hidden" name="block_tocHidden" value={block.tocHidden ? "1" : ""} />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={block.type}
                onChange={(e) => {
                  const type = e.target.value as BlockType;
                  // Switching an existing block to a table needs a grid to edit.
                  update(block.id, {
                    type,
                    ...(type === "table" && !block.rows?.length
                      ? { rows: EMPTY_TABLE(), headerRow: true }
                      : {}),
                  });
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#c5eb02]"
              >
                {BLOCK_LABELS.filter((o) => !exclude.includes(o.value) || o.value === block.type).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {block.type === "heading" && (
                <select
                  value={block.level ?? 2}
                  onChange={(e) =>
                    update(block.id, { level: Number(e.target.value) as ContentBlock["level"] })
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#c5eb02]"
                >
                  {HEADING_LEVELS.map((h) => (
                    <option key={h.value} value={h.value} className="text-black">
                      {h.label}
                    </option>
                  ))}
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
            <>
              <RichTextInput
                value={block.text ?? ""}
                onChange={(text) => update(block.id, { text })}
                placeholder="Heading text…"
                multiline={false}
              />
              {block.level === 1 && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  The page title is already this page&apos;s H1. A second H1 usually confuses
                  search engines about what the page is about — H2 is normally the right choice
                  for a section.
                </p>
              )}
            </>
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

          {block.type === "table" && (
            <TableBlockEditor
              rows={block.rows ?? EMPTY_TABLE()}
              headerRow={block.headerRow !== false}
              caption={block.caption ?? ""}
              onChange={(patch) => update(block.id, patch)}
            />
          )}

          {exclude.includes(block.type) && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Not shown on this page — kept in case it&apos;s used again. Delete it, or change the
              block type, if it isn&apos;t needed.
            </p>
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
        {offered.map((option) => (
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

      {withToc && (
        <TocPanel blocks={blocks} initial={toc} onUpdateBlock={(id, patch) => update(id, patch)} />
      )}
    </div>
  );
}
