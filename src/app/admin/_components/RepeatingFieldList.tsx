"use client";

import { useState } from "react";
import ImageUploadField from "./ImageUploadField";

interface FieldSpec {
  key: string;
  label: string;
  textarea?: boolean;
  type?: string;
  image?: boolean;
  /** Field value is a string[], edited as one-per-line text. */
  lines?: boolean;
}

interface RepeatingFieldListProps<T extends Record<string, unknown>> {
  name: string;
  fields: FieldSpec[];
  defaultValue: T[];
  emptyItem: T;
  itemLabel?: (item: T, index: number) => string;
}

export default function RepeatingFieldList<T extends Record<string, unknown>>({
  name,
  fields,
  defaultValue,
  emptyItem,
  itemLabel,
}: RepeatingFieldListProps<T>) {
  const [items, setItems] = useState<T[]>(defaultValue.length ? defaultValue : [emptyItem]);

  function updateField(index: number, key: string, value: unknown) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
          <input type="hidden" name={name} value={JSON.stringify(item)} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50">
              {itemLabel ? itemLabel(item, index) || `Item ${index + 1}` : `Item ${index + 1}`}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="text-xs font-semibold text-white/50 hover:underline disabled:opacity-30 disabled:hover:no-underline"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="text-xs font-semibold text-white/50 hover:underline disabled:opacity-30 disabled:hover:no-underline"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>

          {fields.map((field) => {
            const value = item[field.key];
            if (field.image) {
              return (
                <ImageUploadField
                  key={field.key}
                  name={`__no_submit_${name}_${field.key}`}
                  label={field.label}
                  defaultValue={typeof value === "string" ? value : ""}
                  onChange={(url) => updateField(index, field.key, url)}
                />
              );
            }
            if (field.lines) {
              const arr = Array.isArray(value) ? (value as unknown[]) : [];
              return (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {field.label} (one per line)
                  </label>
                  <textarea
                    value={arr.join("\n")}
                    onChange={(e) =>
                      updateField(
                        index,
                        field.key,
                        e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
                  />
                </div>
              );
            }
            if (field.textarea) {
              return (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {field.label}
                  </label>
                  <textarea
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => updateField(index, field.key, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
                  />
                </div>
              );
            }
            return (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type ?? "text"}
                  value={value === undefined || value === null ? "" : String(value)}
                  onChange={(e) =>
                    updateField(
                      index,
                      field.key,
                      field.type === "number" ? Number(e.target.value) : e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
                />
              </div>
            );
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-sm font-semibold text-white hover:underline"
      >
        + Add {name}
      </button>
    </div>
  );
}
