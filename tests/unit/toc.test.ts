import { describe, expect, it } from "vitest";
import { buildToc, headingAnchors } from "@/lib/toc";
import { parseContentBlocks, parseTocSettings } from "@/app/admin/_actions/contentBlocks";
import type { ContentBlock } from "@/data/content";

const h = (text: string, level: ContentBlock["level"] = 2, extra: Partial<ContentBlock> = {}): ContentBlock => ({
  type: "heading", text, level, ...extra,
});
const blocks: ContentBlock[] = [
  h("Why <b>heat pumps</b> work"),
  { type: "paragraph", text: "…" },
  h("What it costs", 3),
  h("Grants &amp; finance", 4),
  h("What it costs", 3, { tocLabel: "Costs, again" }),
  h("Hidden one", 2, { tocHidden: true }),
];

describe("heading anchors", () => {
  it("come from the heading text, de-duplicated in page order", () => {
    expect(headingAnchors(blocks)).toEqual([
      "why-heat-pumps-work", undefined, "what-it-costs", "grants-and-finance", "what-it-costs-2", "hidden-one",
    ]);
  });
});

describe("buildToc", () => {
  it("lists H2–H3 by default, with panel labels and without hidden headings", () => {
    expect(buildToc(blocks)).toEqual([
      { id: "why-heat-pumps-work", label: "Why heat pumps work", level: 2 },
      { id: "what-it-costs", label: "What it costs", level: 3 },
      { id: "what-it-costs-2", label: "Costs, again", level: 3 },
    ]);
  });

  it("goes deeper when asked, and is empty when switched off", () => {
    expect(buildToc(blocks, { maxLevel: 4 }).map((e) => e.id)).toContain("grants-and-finance");
    expect(buildToc(blocks, { maxLevel: 2 }).map((e) => e.level)).toEqual([2]);
    expect(buildToc(blocks, { enabled: false })).toEqual([]);
  });
});

describe("saving headings and contents settings", () => {
  const form = (fields: [string, string][]) => {
    const fd = new FormData();
    for (const [k, v] of fields) fd.append(k, v);
    return fd;
  };
  const heading = (level: string, label = "", hidden = "") => [
    ["block_type", "heading"], ["block_text", "A heading"], ["block_items", ""], ["block_level", level],
    ["block_ordered", ""], ["block_ctaText", ""], ["block_ctaLink", ""], ["block_src", ""], ["block_alt", ""],
    ["block_caption", ""], ["block_table", "[]"], ["block_tableHeader", "1"], ["block_tocLabel", label], ["block_tocHidden", hidden],
  ] as [string, string][];

  it("keeps H1–H6 and the per-heading contents options", () => {
    const [a, b] = parseContentBlocks(form([...heading("5", "Short"), ...heading("1", "", "1")]));
    expect(a).toMatchObject({ level: 5, tocLabel: "Short" });
    expect(b).toMatchObject({ level: 1, tocHidden: true });
    expect(parseContentBlocks(form(heading("9")))[0].level).toBe(2);
  });

  it("stores contents settings only when they differ from the defaults", () => {
    expect(parseTocSettings(form([["toc_present", "1"], ["toc_enabled", "on"], ["toc_title", "In this article"], ["toc_maxLevel", "3"]]))).toBeUndefined();
    expect(parseTocSettings(form([["toc_present", "1"], ["toc_title", "Contents"], ["toc_maxLevel", "4"]]))).toEqual({
      enabled: false, title: "Contents", maxLevel: 4,
    });
    // An editor without the panel (services etc.) posts nothing.
    expect(parseTocSettings(form([]))).toBeUndefined();
  });
});
