import type { ContentBlock } from "@/data/content";

/**
 * Heading anchors and the table of contents built from them.
 *
 * One function gives every heading its id, and both the renderer
 * (ContentBlocks) and the contents list call it — so a link in the contents
 * can't point at an id the page didn't render. Ids come from the heading's
 * text and are de-duplicated in page order ("costs", "costs-2").
 */

export interface TocSettings {
  /** Off hides the contents on this post. Defaults to on. */
  enabled?: boolean;
  /** Defaults to "In this article". */
  title?: string;
  /** Deepest heading level listed: 2 = H2 only … 6 = everything. Defaults to 3. */
  maxLevel?: number;
}

export interface TocEntry {
  id: string;
  label: string;
  level: number;
}

export const DEFAULT_TOC_TITLE = "In this article";
export const DEFAULT_TOC_MAX_LEVEL = 3;

/** Visible text of a heading's inline HTML. */
export function headingText(html: string | undefined): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** The id for each block — undefined for anything that isn't a heading. */
export function headingAnchors(blocks: ContentBlock[] | undefined): (string | undefined)[] {
  const used = new Map<string, number>();
  return (blocks ?? []).map((block) => {
    if (block.type !== "heading") return undefined;
    const base = slugify(headingText(block.text)) || "section";
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

export function headingLevel(block: ContentBlock): number {
  const level = Number(block.level ?? 2);
  return level >= 1 && level <= 6 ? level : 2;
}

/**
 * The contents for a post: its headings down to `maxLevel`, minus any hidden
 * in the panel, each under its panel label if it has one. Empty when the
 * contents are switched off.
 */
export function buildToc(blocks: ContentBlock[] | undefined, settings?: TocSettings): TocEntry[] {
  if (settings?.enabled === false) return [];
  const maxLevel = settings?.maxLevel ?? DEFAULT_TOC_MAX_LEVEL;
  const ids = headingAnchors(blocks);
  return (blocks ?? []).flatMap((block, i) => {
    if (block.type !== "heading" || block.tocHidden) return [];
    const level = headingLevel(block);
    if (level > maxLevel) return [];
    const label = block.tocLabel?.trim() || headingText(block.text);
    return label ? [{ id: ids[i]!, label, level }] : [];
  });
}
