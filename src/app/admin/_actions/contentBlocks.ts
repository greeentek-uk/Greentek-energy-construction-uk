import type { ContentBlock } from "@/data/content";
import { sanitizeRichText, isRichTextEmpty } from "@/lib/richText";
import { DEFAULT_TOC_MAX_LEVEL, DEFAULT_TOC_TITLE, type TocSettings } from "@/lib/toc";

/**
 * Reads a `<ContentBlocksEditor>` submission (parallel `block_*` fields, one
 * entry per block, in order) back into a ContentBlock[].
 *
 * Every rich-text value is sanitized here rather than at render time: the panel
 * is the only way this content is written, so cleaning on the way in means the
 * database never holds markup we wouldn't be willing to output.
 */
/** Big enough for any comparison or price-factor table; small enough to stay readable on a phone. */
export const TABLE_LIMITS = { rows: 40, cols: 8 };

/**
 * A table's cells from the editor's JSON, sanitized and tidied: rows padded to
 * one width, then fully empty rows and trailing empty columns dropped, so a
 * half-used grid doesn't render as blank cells. Null when nothing is left.
 * Malformed JSON is treated as empty rather than failing the whole save.
 */
export function parseTableRows(json: string): string[][] | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json || "[]");
  } catch {
    return null;
  }
  if (!Array.isArray(raw)) return null;

  let rows = raw
    .slice(0, TABLE_LIMITS.rows)
    .map((row) =>
      (Array.isArray(row) ? row : [])
        .slice(0, TABLE_LIMITS.cols)
        .map((cell) => {
          const html = sanitizeRichText(typeof cell === "string" ? cell : "");
          return isRichTextEmpty(html) ? "" : html;
        }),
    )
    .filter((row) => row.some(Boolean));
  if (!rows.length) return null;

  let width = Math.max(...rows.map((r) => r.length));
  while (width > 1 && rows.every((r) => !r[width - 1])) width--;
  rows = rows.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ""));
  return rows;
}

/**
 * A post's table-of-contents settings, or undefined when they're all default —
 * so an untouched post stores nothing and follows the defaults if they change.
 */
export function parseTocSettings(formData: FormData): TocSettings | undefined {
  if (!formData.has("toc_present")) return undefined;
  const enabled = formData.get("toc_enabled") === "on";
  const title = String(formData.get("toc_title") || "").trim();
  const maxLevel = Number(formData.get("toc_maxLevel") || DEFAULT_TOC_MAX_LEVEL);
  const settings: TocSettings = {
    ...(enabled ? {} : { enabled: false }),
    ...(title && title !== DEFAULT_TOC_TITLE ? { title } : {}),
    ...(maxLevel >= 1 && maxLevel <= 6 && maxLevel !== DEFAULT_TOC_MAX_LEVEL ? { maxLevel } : {}),
  };
  return Object.keys(settings).length ? settings : undefined;
}

export function parseContentBlocks(formData: FormData): ContentBlock[] {
  const field = (name: string) => formData.getAll(name) as string[];

  const types = field("block_type");
  const texts = field("block_text");
  const itemsRaw = field("block_items");
  const levels = field("block_level");
  const ordered = field("block_ordered");
  const ctaTexts = field("block_ctaText");
  const ctaLinks = field("block_ctaLink");
  const srcs = field("block_src");
  const alts = field("block_alt");
  const captions = field("block_caption");
  const tables = field("block_table");
  const tableHeaders = field("block_tableHeader");
  const tocLabels = field("block_tocLabel");
  const tocHidden = field("block_tocHidden");

  return types
    .map((type, i) => {
      const block: ContentBlock = { type: type as ContentBlock["type"] };
      const text = sanitizeRichText(texts[i] ?? "");
      if (text) block.text = text;

      if (type === "heading") {
        const level = Number(levels[i]);
        block.level = (level >= 1 && level <= 6 ? level : 2) as ContentBlock["level"];
        // Table-of-contents options; only posted by editors that show them.
        const tocLabel = tocLabels[i]?.trim();
        if (tocLabel) block.tocLabel = tocLabel;
        if (tocHidden[i] === "1") block.tocHidden = true;
      }

      if (type === "list") {
        const items = (itemsRaw[i] ?? "")
          .split("\n")
          .map((item) => sanitizeRichText(item))
          .filter((item) => !isRichTextEmpty(item));
        if (items.length) block.items = items;
        if (ordered[i]) block.ordered = true;
      }

      if (type === "cta") {
        if (ctaTexts[i]?.trim()) block.ctaText = ctaTexts[i].trim();
        if (ctaLinks[i]?.trim()) block.ctaLink = ctaLinks[i].trim();
      }

      if (type === "image") {
        if (srcs[i]?.trim()) block.src = srcs[i].trim();
        if (alts[i]?.trim()) block.alt = alts[i].trim();
        if (captions[i]?.trim()) block.caption = captions[i].trim();
      }

      if (type === "table") {
        const rows = parseTableRows(tables[i] ?? "");
        if (rows) block.rows = rows;
        block.headerRow = tableHeaders[i] === "1";
        if (captions[i]?.trim()) block.caption = captions[i].trim();
      }

      return block;
    })
    // An empty block renders as a gap on the live page, so drop it rather than
    // making the editor remember to tidy up after itself.
    .filter((block) => {
      if (block.type === "image") return Boolean(block.src);
      if (block.type === "table") return Boolean(block.rows?.length);
      if (block.type === "list") return Boolean(block.items?.length);
      if (block.type === "cta") return true;
      return Boolean(block.text);
    });
}
