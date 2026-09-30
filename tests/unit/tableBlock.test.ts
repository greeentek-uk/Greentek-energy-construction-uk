import { describe, expect, it } from "vitest";
import { parseContentBlocks, parseTableRows, TABLE_LIMITS } from "@/app/admin/_actions/contentBlocks";
import { escapeCell, parsePastedTable, unescapeCell } from "@/app/admin/_components/TableBlockEditor";

describe("parseTableRows", () => {
  it("drops empty rows and trailing empty columns, and pads rows to one width", () => {
    expect(
      parseTableRows(JSON.stringify([
        ["Option", "Best for", ""],
        ["", "", ""],
        ["Heat pump", "", ""],
      ])),
    ).toEqual([
      ["Option", "Best for"],
      ["Heat pump", ""],
    ]);
  });

  it("sanitizes cells like the rest of the body copy", () => {
    const [[cell]] = parseTableRows(JSON.stringify([['<b>Low</b><script>alert(1)</script>']]))!;
    expect(cell).toBe("<b>Low</b>");
  });

  it("is null for an empty or malformed table, so the block is dropped", () => {
    expect(parseTableRows(JSON.stringify([["", ""], [" "]]))).toBeNull();
    expect(parseTableRows("{not json")).toBeNull();
    expect(parseTableRows('"a string"')).toBeNull();
  });

  it("caps the size", () => {
    const big = Array.from({ length: 60 }, () => Array.from({ length: 12 }, () => "x"));
    const rows = parseTableRows(JSON.stringify(big))!;
    expect(rows).toHaveLength(TABLE_LIMITS.rows);
    expect(rows[0]).toHaveLength(TABLE_LIMITS.cols);
  });
});

describe("table blocks in a saved body", () => {
  const post = (fields: Record<string, string>) => {
    const fd = new FormData();
    const all = { block_text: "", block_items: "", block_level: "2", block_ordered: "", block_ctaText: "",
      block_ctaLink: "", block_src: "", block_alt: "", block_caption: "", block_table: "[]", block_tableHeader: "1", ...fields };
    for (const [k, v] of Object.entries(all)) fd.append(k, v);
    return fd;
  };

  it("keeps rows, the heading-row setting and the caption", () => {
    const [block] = parseContentBlocks(post({
      block_type: "table",
      block_table: JSON.stringify([["System", "Cost"], ["Solar", "Quoted after survey"]]),
      block_tableHeader: "",
      block_caption: "Compared, 2026",
    }));
    expect(block).toEqual({
      type: "table",
      rows: [["System", "Cost"], ["Solar", "Quoted after survey"]],
      headerRow: false,
      caption: "Compared, 2026",
    });
  });

  it("drops a table with nothing in it", () => {
    expect(parseContentBlocks(post({ block_type: "table", block_table: '[["",""]]' }))).toEqual([]);
  });
});

describe("table editor helpers", () => {
  it("pastes Excel / Google Sheets rows (tabs), trimming the trailing newline", () => {
    expect(parsePastedTable("Option\tBest for\r\nHeat pump\tInsulated homes\r\n")).toEqual([
      ["Option", "Best for"],
      ["Heat pump", "Insulated homes"],
    ]);
  });

  it("falls back to commas when there are no tabs", () => {
    expect(parsePastedTable("a, b\nc, d")).toEqual([["a", "b"], ["c", "d"]]);
  });

  it("round-trips typed text through the stored HTML", () => {
    const typed = `Loft < 100mm & "old" insulation`;
    expect(escapeCell(typed)).toBe("Loft &lt; 100mm &amp; &quot;old&quot; insulation");
    expect(unescapeCell(escapeCell(typed))).toBe(typed);
  });
});
