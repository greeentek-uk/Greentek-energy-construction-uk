"use client";

import { useState } from "react";
import {
  TEMPLATES,
  CUSTOM_SCHEMA_TYPE,
  getTemplate,
  type SchemaData,
  type SchemaField,
  type SchemaTemplate,
} from "@/lib/schemaTemplates";
import { renderSchemaEntries } from "@/lib/schemaRender";
import type { SchemaEntry } from "@/lib/db/schemaOverrides";
import { saveSchemaAction } from "../_actions/schema";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

function newId(): string {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/70 mb-1">
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className={inputClass}
        />
      ) : (
        <input
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : field.type === "time"
                  ? "time"
                  : "text"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
      {field.help && <p className="text-xs text-white/40 mt-1">{field.help}</p>}
    </div>
  );
}

function TemplateForm({
  template,
  data,
  onChange,
}: {
  template: SchemaTemplate;
  data: SchemaData;
  onChange: (data: SchemaData) => void;
}) {
  function setField(key: string, value: string) {
    onChange({ ...data, [key]: value });
  }

  function setRows(key: string, rows: SchemaData[]) {
    onChange({ ...data, [key]: rows });
  }

  return (
    <div className="space-y-4">
      {template.fields.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {template.fields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2" : undefined}
            >
              <FieldInput
                field={field}
                value={typeof data[field.key] === "string" ? (data[field.key] as string) : ""}
                onChange={(value) => setField(field.key, value)}
              />
            </div>
          ))}
        </div>
      )}

      {template.groups.map((group) => {
        const rows = Array.isArray(data[group.key]) ? (data[group.key] as SchemaData[]) : [];
        return (
          <div key={group.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/70">{group.label}</p>
              <button
                type="button"
                onClick={() => setRows(group.key, [...rows, {}])}
                className="text-xs font-semibold text-[#c5eb02] hover:underline"
              >
                + {group.addLabel}
              </button>
            </div>

            {rows.length === 0 && (
              <p className="text-xs text-white/40 border border-dashed border-white/10 rounded-lg px-3 py-4 text-center">
                Nothing added yet.
              </p>
            )}

            {rows.map((row, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-lg p-3 space-y-3 bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/50">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...rows];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        setRows(group.key, next);
                      }}
                      disabled={index === 0}
                      className="text-xs text-white/50 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index === rows.length - 1) return;
                        const next = [...rows];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        setRows(group.key, next);
                      }}
                      disabled={index === rows.length - 1}
                      className="text-xs text-white/50 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setRows(group.key, rows.filter((_, i) => i !== index))}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {group.fields.map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={typeof row[field.key] === "string" ? (row[field.key] as string) : ""}
                    onChange={(value) =>
                      setRows(
                        group.key,
                        rows.map((r, i) => (i === index ? { ...r, [field.key]: value } : r)),
                      )
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CustomForm({
  raw,
  onChange,
}: {
  raw: string;
  onChange: (raw: string) => void;
}) {
  let status: { ok: boolean; message: string } | null = null;
  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const types = list.map((b) => (b as Record<string, unknown>)?.["@type"] ?? "?");
      status = { ok: true, message: `Valid JSON — ${types.join(", ")}` };
    } catch (err) {
      status = { ok: false, message: err instanceof Error ? err.message : "Invalid JSON" };
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-white/70 mb-1">JSON-LD</label>
      <textarea
        value={raw}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        spellCheck={false}
        placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "..."\n}'}
        className={`${inputClass} font-mono text-xs leading-relaxed`}
      />
      {status && (
        <p className={`text-xs mt-1 ${status.ok ? "text-green-400" : "text-red-400"}`}>
          {status.ok ? "✓" : "✕"} {status.message}
        </p>
      )}
    </div>
  );
}

export default function SchemaBuilder({
  path,
  initialEntries,
  initialReplaceDefault,
  isGlobal,
}: {
  path: string;
  initialEntries: SchemaEntry[];
  initialReplaceDefault: boolean;
  isGlobal: boolean;
}) {
  const [entries, setEntries] = useState<SchemaEntry[]>(initialEntries);
  const [replaceDefault, setReplaceDefault] = useState(initialReplaceDefault);
  const [picking, setPicking] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  function addEntry(type: string) {
    const entry: SchemaEntry = {
      id: newId(),
      type,
      enabled: true,
      data: {},
      ...(type === CUSTOM_SCHEMA_TYPE ? { raw: "" } : {}),
      updatedAt: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, entry]);
    setOpenId(entry.id);
    setPicking(false);
  }

  function updateEntry(id: string, patch: Partial<SchemaEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  // The preview runs the exact renderer the live page uses, so what's shown
  // here is what gets emitted — no second implementation to drift out of sync.
  const preview = renderSchemaEntries(entries);

  return (
    <form action={saveSchemaAction} className="space-y-5">
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="entries" value={JSON.stringify(entries)} />
      <input type="hidden" name="replaceDefault" value={replaceDefault ? "on" : ""} />

      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-8 text-center">
            No schema on this page yet. The built-in schema still applies.
          </p>
        )}

        {entries.map((entry) => {
          const template = getTemplate(entry.type);
          const label =
            entry.type === CUSTOM_SCHEMA_TYPE ? "Custom JSON-LD" : (template?.label ?? entry.type);
          const isOpen = openId === entry.id;

          return (
            <div
              key={entry.id}
              className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : entry.id)}
                  className="min-w-0 text-left flex-1"
                >
                  <p className="font-semibold text-white truncate">{label}</p>
                  <p className="text-xs text-white/40 truncate">
                    {entry.type === CUSTOM_SCHEMA_TYPE
                      ? "Hand-written"
                      : (template?.description ?? "")}
                  </p>
                </button>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={entry.enabled}
                      onChange={(e) => updateEntry(entry.id, { enabled: e.target.checked })}
                      className="accent-[#c5eb02]"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : entry.id)}
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {isOpen ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                    className="text-sm font-semibold text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-white/10">
                  {entry.type === CUSTOM_SCHEMA_TYPE ? (
                    <CustomForm
                      raw={entry.raw ?? ""}
                      onChange={(raw) => updateEntry(entry.id, { raw })}
                    />
                  ) : template ? (
                    <TemplateForm
                      template={template}
                      data={entry.data ?? {}}
                      onChange={(data) => updateEntry(entry.id, { data })}
                    />
                  ) : (
                    <p className="text-sm text-red-400">
                      Unknown schema type &ldquo;{entry.type}&rdquo;.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {picking ? (
        <div className="bg-[#101314] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-white">Choose a schema type</p>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="text-sm text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.type}
                type="button"
                onClick={() => addEntry(template.type)}
                className="text-left rounded-lg border border-white/10 px-4 py-3 hover:border-[#c5eb02]/50 hover:bg-white/5 transition-colors"
              >
                <p className="text-sm font-semibold text-white">{template.label}</p>
                <p className="text-xs text-white/40">{template.description}</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => addEntry(CUSTOM_SCHEMA_TYPE)}
              className="text-left rounded-lg border border-dashed border-white/20 px-4 py-3 hover:border-[#c5eb02]/50 hover:bg-white/5 transition-colors"
            >
              <p className="text-sm font-semibold text-white">Custom JSON-LD</p>
              <p className="text-xs text-white/40">
                Paste your own for anything not listed here.
              </p>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="w-full rounded-xl border border-dashed border-white/20 px-5 py-4 text-sm font-semibold text-white hover:border-[#c5eb02]/50 hover:bg-white/5 transition-colors"
        >
          + Add Schema
        </button>
      )}

      {!isGlobal && (
        <label className="flex items-start gap-2 text-sm text-white/70 bg-[#101314] border border-white/10 rounded-xl p-4">
          <input
            type="checkbox"
            checked={replaceDefault}
            onChange={(e) => setReplaceDefault(e.target.checked)}
            className="accent-[#c5eb02] mt-1"
          />
          <span>
            Replace this page&apos;s built-in schema
            <span className="block text-xs text-white/40">
              Leave off to add yours alongside it, which is usually what you want.
            </span>
          </span>
        </label>
      )}

      {preview.length > 0 && (
        <details className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-white hover:bg-white/5">
            Preview output ({preview.length} block{preview.length === 1 ? "" : "s"})
          </summary>
          <pre className="px-5 pb-5 text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(preview.length === 1 ? preview[0] : preview, null, 2)}
          </pre>
        </details>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save Schema
        </button>
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/50 hover:text-white"
        >
          Test with Google Rich Results ↗
        </a>
      </div>
    </form>
  );
}
