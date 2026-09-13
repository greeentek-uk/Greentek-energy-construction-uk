import { getDb } from "./mongodb";
import type { SeoOverride, SeoOverrides } from "@/lib/seoTypes";

const COLLECTION = "seoOverrides";

type SeoOverrideDoc = SeoOverride & { _id: string };

export async function getSeoOverrides(): Promise<SeoOverrides> {
  const db = await getDb();
  const docs = await db.collection<SeoOverrideDoc>(COLLECTION).find().toArray();
  return Object.fromEntries(
    docs.map(({ _id, ...override }) => [_id, override as SeoOverride]),
  );
}

export async function upsertSeoOverride(path: string, override: SeoOverride): Promise<void> {
  const db = await getDb();
  // Replace rather than merge: an admin clearing a field means "remove it",
  // and $set would leave the old value behind.
  await db
    .collection<SeoOverrideDoc>(COLLECTION)
    .replaceOne({ _id: path }, { _id: path, ...override } as SeoOverrideDoc, {
      upsert: true,
    });
}

export async function deleteSeoOverride(path: string): Promise<void> {
  const db = await getDb();
  await db.collection<SeoOverrideDoc>(COLLECTION).deleteOne({ _id: path });
}
