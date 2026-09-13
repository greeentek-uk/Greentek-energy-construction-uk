import { CUSTOM_SCHEMA_TYPE, getTemplate } from "@/lib/schemaTemplates";
import type { SchemaEntry } from "@/lib/db/schemaOverrides";

/**
 * Turns saved schema entries into the JSON-LD objects to render.
 *
 * Shared by the public page renderer and the admin's live preview so what the
 * admin sees in the builder is byte-for-byte what the page emits. Anything
 * malformed is dropped rather than thrown — one bad block must not take down
 * a page render.
 */
export function renderSchemaEntries(entries: SchemaEntry[]): object[] {
  const blocks: object[] = [];

  for (const entry of entries) {
    if (!entry.enabled) continue;

    if (entry.type === CUSTOM_SCHEMA_TYPE) {
      if (!entry.raw?.trim()) continue;
      try {
        const parsed = JSON.parse(entry.raw);
        // A custom block may itself be an array of several schema objects.
        if (Array.isArray(parsed)) blocks.push(...parsed);
        else if (parsed && typeof parsed === "object") blocks.push(parsed);
      } catch {
        // Invalid JSON is rejected on save; skip it here as a backstop.
      }
      continue;
    }

    const template = getTemplate(entry.type);
    if (!template) continue;
    try {
      blocks.push(template.build(entry.data ?? {}));
    } catch {
      // A template that can't build from its stored values is skipped.
    }
  }

  return blocks;
}
