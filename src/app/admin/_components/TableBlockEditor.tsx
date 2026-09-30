"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

/**
 * The grid editor for a table block.
 *
 * Cells are plain text inputs, not the rich-text editor: that one carries its
 * own toolbar, and a 5 × 4 table would stack twenty of them. Text is escaped
 * into HTML here (cells are stored as the same sanitized inline HTML as the
 * rest of the body copy, so the renderer treats them alike) and decoded back
 * for editing.
 *
 * "Paste from a spreadsheet" takes what Excel / Google Sheets put on the
 * clipboard — rows on lines, cells separated by tabs — since most tables
 * start life in one.
 */

const MAX_ROWS = 40;
const MAX_COLS = 8;

const inputClass =
  "w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c5eb02]";

export function escapeCell(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Back to what the editor typed. Tags (from any hand-pasted markup) are dropped. */
export function unescapeCell(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Spreadsheet clipboard text → rows of cells. Commas are the fallback when there are no tabs. */
export function parsePastedTable(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const sep = lines.some((l) => l.includes("\t")) ? "\t" : ",";
  return lines.slice(0, MAX_ROWS).map((l) => l.split(sep).slice(0, MAX_COLS).map((c) => c.trim()));
}

export default function TableBlockEditor({
  rows: html,
  headerRow,
  caption,
  onChange,
}: {
  rows: string[][];
  headerRow: boolean;
  caption: string;
  onChange: (patch: { rows?: string[][]; headerRow?: boolean; caption?: string }) => void;
}) {
  // Plain text for editing; escaped on every change.
  const rows = html.map((r) => r.map(unescapeCell));
  const cols = Math.max(1, ...rows.map((r) => r.length));
  const grid = rows.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? ""));
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const commit = (next: string[][]) => onChange({ rows: next.map((r) => r.map(escapeCell)) });
  const setCell = (r: number, c: number, value: string) =>
    commit(grid.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-6" />
              {grid[0]?.map((_, c) => (
                <th key={c} className="text-center">
                  <button
                    type="button"
                    title="Remove this column"
                    disabled={cols <= 1}
                    onClick={() => commit(grid.map((row) => row.filter((_, ci) => ci !== c)))}
                    className="inline-grid h-6 w-6 place-items-center rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td className="align-middle">
                  <button
                    type="button"
                    title="Remove this row"
                    disabled={grid.length <= 1}
                    onClick={() => commit(grid.filter((_, ri) => ri !== r))}
                    className="grid h-6 w-6 place-items-center rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className="min-w-36">
                    <input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      placeholder={r === 0 && headerRow ? `Heading ${c + 1}` : ""}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                      className={`${inputClass} ${r === 0 && headerRow ? "font-bold bg-white/10" : ""}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={grid.length >= MAX_ROWS}
          onClick={() => commit([...grid, Array(cols).fill("")])}
          className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/70 hover:text-white disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" /> Row
        </button>
        <button
          type="button"
          disabled={cols >= MAX_COLS}
          onClick={() => commit(grid.map((row) => [...row, ""]))}
          className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/70 hover:text-white disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" /> Column
        </button>
        <button
          type="button"
          onClick={() => setPasteOpen((v) => !v)}
          className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/70 hover:text-white"
        >
          Paste from a spreadsheet
        </button>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-white/60">
          <input
            type="checkbox"
            checked={headerRow}
            onChange={(e) => onChange({ headerRow: e.target.checked })}
            className="accent-[#c5eb02]"
          />
          First row is the column headings
        </label>
      </div>

      {pasteOpen && (
        <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3">
          <p className="text-xs text-white/50">
            Copy the cells in Excel or Google Sheets and paste them here. This replaces the table
            above.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder={"Option\tBest for\tRunning cost\nHeat pump\tWell-insulated homes\tLow"}
          />
          <button
            type="button"
            disabled={!pasteText.trim()}
            onClick={() => {
              commit(parsePastedTable(pasteText));
              setPasteText("");
              setPasteOpen(false);
            }}
            className="rounded-lg bg-[#c5eb02] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            Use this table
          </button>
        </div>
      )}

      <input
        value={caption}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Caption (optional) — e.g. Typical running costs, 2026"
        className={inputClass}
      />
    </div>
  );
}
