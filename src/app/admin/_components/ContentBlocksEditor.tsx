"use client";

import { useState } from "react";
import type { ContentBlock } from "@/data/content";

type BlockType = ContentBlock["type"];

interface BlockState extends ContentBlock {
  id: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Shared "content blocks" (heading/paragraph/list/cta) editor. Submits parallel `block_*` fields read back by `parseContentBlocks()` (src/app/admin/_actions/contentBlocks.ts). One of these per `<form>` — field names aren't namespaced. */
export default function ContentBlocksEditor({ initial }: { initial?: ContentBlock[] }) {
  const [blocks, setBlocks] = useState<BlockState[]>(
    () =>
      initial?.map((b) => ({ ...b, id: newId() })) || [
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-900 text-sm">Content</h3>
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
                placeholder={block.type === "cta" ? "CTA body text (optional)" : "Text"}
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
        <p className="text-sm text-zinc-400">No content blocks yet — add one above.</p>
      )}
    </div>
  );
}
