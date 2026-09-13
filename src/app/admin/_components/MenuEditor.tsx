"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { MenuItem, Menus } from "@/lib/db/menus";
import { saveMenusAction } from "../_actions/menus";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

function newId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function MenuList({
  title,
  help,
  items,
  onChange,
  suggestions,
}: {
  title: string;
  help: string;
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  suggestions: { label: string; href: string }[];
}) {
  function update(index: number, patch: Partial<MenuItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const used = new Set(items.map((item) => item.href));
  const unused = suggestions.filter((s) => !used.has(s.href));

  return (
    <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-3">
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="text-white/50 text-sm">{help}</p>
      </div>

      {items.map((item, index) => (
        <div key={item.id} className="border border-white/10 rounded-lg p-3 bg-white/5 space-y-2">
          <div className="grid sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-center">
            <input
              value={item.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Label"
              className={inputClass}
            />
            <input
              value={item.href}
              onChange={(e) => update(index, { href: e.target.value })}
              placeholder="/cost-guides"
              className={`${inputClass} font-mono text-xs`}
            />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                className="h-8 w-8 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}
                className="h-8 w-8 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="h-8 w-8 grid place-items-center rounded text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={Boolean(item.newTab)}
              onChange={(e) => update(index, { newTab: e.target.checked })}
              className="accent-[#c5eb02]"
            />
            Open in a new tab
          </label>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChange([...items, { id: newId(), label: "", href: "" }])}
          className="text-sm font-semibold text-[#c5eb02] hover:underline"
        >
          + Add link
        </button>
        {unused.length > 0 && (
          <>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">Add existing page:</span>
            {unused.slice(0, 6).map((s) => (
              <button
                key={s.href}
                type="button"
                onClick={() => onChange([...items, { id: newId(), label: s.label, href: s.href }])}
                className="rounded border border-white/15 px-2 py-1 text-xs text-white/70 hover:text-white hover:border-[#c5eb02]/50"
              >
                {s.label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function MenuEditor({
  initial,
  suggestions,
}: {
  initial: Menus;
  /** Every real page on the site, so links can be added without typing URLs. */
  suggestions: { label: string; href: string }[];
}) {
  const [menus, setMenus] = useState<Menus>(initial);

  return (
    <form action={saveMenusAction} className="space-y-6">
      <input type="hidden" name="header" value={JSON.stringify(menus.header)} />
      <input type="hidden" name="footer" value={JSON.stringify(menus.footer)} />

      <MenuList
        title="Header menu"
        help="The main navigation, shown on every page on desktop and mobile."
        items={menus.header}
        onChange={(header) => setMenus((prev) => ({ ...prev, header }))}
        suggestions={suggestions}
      />

      <MenuList
        title="Footer links"
        help="The small print row at the bottom — privacy, terms and similar."
        items={menus.footer}
        onChange={(footer) => setMenus((prev) => ({ ...prev, footer }))}
        suggestions={suggestions}
      />

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
      >
        Save Menus
      </button>
    </form>
  );
}
