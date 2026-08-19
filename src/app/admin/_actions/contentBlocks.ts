import type { ContentBlock } from "@/data/content";

/** Reads a `<ContentBlocksEditor>` submission (parallel `block_*` fields, one entry per block, in order) back into a ContentBlock[]. */
export function parseContentBlocks(formData: FormData): ContentBlock[] {
  const types = formData.getAll("block_type") as string[];
  const texts = formData.getAll("block_text") as string[];
  const itemsRaw = formData.getAll("block_items") as string[];
  const ctaTexts = formData.getAll("block_ctaText") as string[];
  const ctaLinks = formData.getAll("block_ctaLink") as string[];

  return types.map((type, i) => {
    const block: ContentBlock = { type: type as ContentBlock["type"] };
    if (texts[i]) block.text = texts[i];
    if (type === "list" && itemsRaw[i]) {
      block.items = itemsRaw[i]
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (type === "cta") {
      if (ctaTexts[i]) block.ctaText = ctaTexts[i];
      if (ctaLinks[i]) block.ctaLink = ctaLinks[i];
    }
    return block;
  });
}
