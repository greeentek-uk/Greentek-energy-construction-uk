"use client";

import { useState } from "react";
import type { ContentBlock } from "@/data/content";
import {
  DEFAULT_TOC_MAX_LEVEL,
  DEFAULT_TOC_TITLE,
  headingLevel,
  headingText,
  type TocSettings,
} from "@/lib/toc";

type Block = ContentBlock & { id: string };

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

/**
 * A blog post's table of contents: built from its headings as they're typed,
 * and adjustable here — on/off, title, how deep it goes, and per heading a
 * shorter label or leaving it out. The per-heading choices are stored on the
 * heading blocks themselves (tocLabel / tocHidden), so moving or deleting a
 * heading takes its contents entry with it.
 */
export default function TocPanel({
  blocks,
  initial,
  onUpdateBlock,
}: {
  blocks: Block[];
  initial?: TocSettings | null;
  onUpdateBlock: (id: string, patch: Partial<ContentBlock>) => void;
}) {
  const [enabled, setEnabled] = useState(initial?.enabled !== false);
  const [maxLevel, setMaxLevel] = useState(initial?.maxLevel ?? DEFAULT_TOC_MAX_LEVEL);

  const headings = blocks.filter((b) => b.type === "heading" && headingText(b.text));

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-white/10 bg-black/30 p-4">
      {/* Tells the save this post's editor posted contents settings at all. */}
      <input type="hidden" name="toc_present" value="1" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-white text-sm">Table of contents</h3>
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            name="toc_enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-[#c5eb02]"
          />
          Show on this post
        </label>
      </div>
      <p className="text-xs text-white/50">
        Built automatically from the headings above, beside the cover image on the post. Rename an
        entry or leave it out here; the heading on the page doesn&apos;t change.
      </p>

      <div className={`grid gap-3 sm:grid-cols-2 ${enabled ? "" : "opacity-40"}`}>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Title</label>
          <input
            name="toc_title"
            defaultValue={initial?.title ?? ""}
            placeholder={DEFAULT_TOC_TITLE}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Headings to include</label>
          <select
            name="toc_maxLevel"
            value={maxLevel}
            onChange={(e) => setMaxLevel(Number(e.target.value))}
            className={inputClass}
          >
            <option value={2} className="text-black">H2 only</option>
            <option value={3} className="text-black">H2 and H3 (recommended)</option>
            <option value={4} className="text-black">Down to H4</option>
            <option value={5} className="text-black">Down to H5</option>
            <option value={6} className="text-black">Every heading (to H6)</option>
          </select>
        </div>
      </div>

      {enabled && (
        <div className="space-y-2">
          {headings.length === 0 && (
            <p className="text-xs text-white/40">Add a heading above and it appears here.</p>
          )}
          {headings.map((block) => {
            const level = headingLevel(block);
            const tooDeep = level > maxLevel;
            const off = tooDeep || block.tocHidden;
            return (
              <div
                key={block.id}
                className={`flex items-center gap-2 ${off ? "opacity-40" : ""}`}
                style={{ paddingLeft: `${Math.max(0, level - 2) * 1.25}rem` }}
              >
                <span className="w-7 shrink-0 text-[10px] font-bold text-white/40">H{level}</span>
                <input
                  value={block.tocLabel ?? ""}
                  onChange={(e) => onUpdateBlock(block.id, { tocLabel: e.target.value })}
                  placeholder={headingText(block.text)}
                  disabled={tooDeep}
                  aria-label={`Contents label for "${headingText(block.text)}"`}
                  className={`${inputClass} py-1.5`}
                />
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-white/60" title={tooDeep ? "Deeper than the level chosen above" : undefined}>
                  <input
                    type="checkbox"
                    checked={!block.tocHidden && !tooDeep}
                    disabled={tooDeep}
                    onChange={(e) => onUpdateBlock(block.id, { tocHidden: !e.target.checked })}
                    className="accent-[#c5eb02]"
                  />
                  Show
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
