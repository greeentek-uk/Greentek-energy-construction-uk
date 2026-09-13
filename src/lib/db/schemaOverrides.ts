import { getDb } from "./mongodb";
import type { SchemaData } from "@/lib/schemaTemplates";

const COLLECTION = "schemaOverrides";

/** `_id` is the route path the schema applies to, or GLOBAL_SCHEMA_PATH for site-wide schema. */
export const GLOBAL_SCHEMA_PATH = "__global__";

export interface SchemaEntry {
  id: string;
  /** A key from `TEMPLATES`, or CUSTOM_SCHEMA_TYPE for hand-written JSON-LD. */
  type: string;
  enabled: boolean;
  /**
   * Form values, kept structured rather than as rendered JSON so reopening the
   * builder shows the fields exactly as they were filled in.
   */
  data: SchemaData;
  /** Raw JSON-LD, used only when `type` is CUSTOM_SCHEMA_TYPE. */
  raw?: string;
  updatedAt: string;
}

export interface SchemaOverride {
  entries: SchemaEntry[];
  /** Suppresses the code-built schema for this route so the custom blocks stand alone. */
  replaceDefault: boolean;
}

type SchemaOverrideDoc = SchemaOverride & { _id: string };

const EMPTY: SchemaOverride = { entries: [], replaceDefault: false };

function normalize(doc: SchemaOverrideDoc | null): SchemaOverride {
  if (!doc) return EMPTY;
  return {
    entries: Array.isArray(doc.entries) ? doc.entries : [],
    replaceDefault: Boolean(doc.replaceDefault),
  };
}

export async function getSchemaOverrides(): Promise<Record<string, SchemaOverride>> {
  const db = await getDb();
  const docs = await db.collection<SchemaOverrideDoc>(COLLECTION).find().toArray();
  return Object.fromEntries(docs.map((doc) => [doc._id, normalize(doc)]));
}

export async function getSchemaOverride(path: string): Promise<SchemaOverride> {
  const db = await getDb();
  const doc = await db.collection<SchemaOverrideDoc>(COLLECTION).findOne({ _id: path });
  return normalize(doc);
}

export async function saveSchemaOverride(
  path: string,
  override: SchemaOverride,
): Promise<void> {
  const db = await getDb();

  // Nothing left to store means the page goes back to its built-in schema —
  // drop the row rather than leaving an empty one behind.
  if (override.entries.length === 0 && !override.replaceDefault) {
    await db.collection<SchemaOverrideDoc>(COLLECTION).deleteOne({ _id: path });
    return;
  }

  await db
    .collection<SchemaOverrideDoc>(COLLECTION)
    .updateOne({ _id: path }, { $set: override }, { upsert: true });
}

export async function deleteSchemaOverride(path: string): Promise<void> {
  const db = await getDb();
  await db.collection<SchemaOverrideDoc>(COLLECTION).deleteOne({ _id: path });
}
