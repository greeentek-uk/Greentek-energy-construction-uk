"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  saveSchemaOverride,
  deleteSchemaOverride,
  GLOBAL_SCHEMA_PATH,
  type SchemaEntry,
} from "@/lib/db/schemaOverrides";
import { CUSTOM_SCHEMA_TYPE, getTemplate } from "@/lib/schemaTemplates";

function editUrl(path: string, query: string): string {
  return `/admin/schema/edit?path=${encodeURIComponent(path)}&${query}`;
}

function revalidateFor(path: string): void {
  if (path === GLOBAL_SCHEMA_PATH) {
    revalidatePath("/", "layout");
  } else {
    revalidatePath(path);
  }
}

export async function saveSchemaAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") || "");
  const replaceDefault = formData.get("replaceDefault") === "on";

  if (!path) redirect("/admin/schema");

  let entries: SchemaEntry[];
  try {
    const parsed = JSON.parse(String(formData.get("entries") || "[]"));
    if (!Array.isArray(parsed)) throw new Error("Malformed schema payload.");
    entries = parsed as SchemaEntry[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Malformed schema payload";
    redirect(editUrl(path, `error=${encodeURIComponent(message)}`));
  }

  // Validate before storing — the builder already blocks most of this, but the
  // form payload is just a hidden field and can't be trusted on its own.
  for (const entry of entries) {
    if (entry.type === CUSTOM_SCHEMA_TYPE) {
      if (!entry.raw?.trim()) continue;
      try {
        const parsed = JSON.parse(entry.raw);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Custom JSON-LD must be an object or an array of objects.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid JSON";
        redirect(editUrl(path, `error=${encodeURIComponent(`Custom JSON-LD: ${message}`)}`));
      }
    } else if (!getTemplate(entry.type)) {
      redirect(
        editUrl(path, `error=${encodeURIComponent(`Unknown schema type "${entry.type}".`)}`),
      );
    }
  }

  try {
    await saveSchemaOverride(path, { entries, replaceDefault });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(editUrl(path, `error=${encodeURIComponent(message)}`));
  }

  revalidateFor(path);
  redirect(editUrl(path, "saved=1"));
}

export async function deleteSchemaOverrideAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") || "");

  await deleteSchemaOverride(path);

  revalidateFor(path);
  redirect("/admin/schema?deleted=1");
}
