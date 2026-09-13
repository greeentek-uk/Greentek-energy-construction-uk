import type { ContentBlock } from "@/data/content";
import { sanitizeRichText, isRichTextEmpty } from "@/lib/richText";

/**
 * Reads a `<ContentBlocksEditor>` submission (parallel `block_*` fields, one
 * entry per block, in order) back into a ContentBlock[].
 *
 * Every rich-text value is sanitized here rather than at render time: the panel
 * is the only way this content is written, so cleaning on the way in means the
 * database never holds markup we wouldn't be willing to output.
 */
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

  return types
    .map((type, i) => {
      const block: ContentBlock = { type: type as ContentBlock["type"] };
      const text = sanitizeRichText(texts[i] ?? "");
      if (text) block.text = text;

      if (type === "heading") {
        block.level = levels[i] === "3" ? 3 : 2;
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

      return block;
    })
    // An empty block renders as a gap on the live page, so drop it rather than
    // making the editor remember to tidy up after itself.
    .filter((block) => {
      if (block.type === "image") return Boolean(block.src);
      if (block.type === "list") return Boolean(block.items?.length);
      if (block.type === "cta") return true;
      return Boolean(block.text);
    });
}
