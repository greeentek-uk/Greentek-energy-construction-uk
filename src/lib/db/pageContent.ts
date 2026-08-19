import { getDb } from "./mongodb";
import type { PageContentMap, PageContentKey } from "@/data/pageContent";

const COLLECTION = "pageContent";

interface PageContentDoc<T> {
  _id: string;
  draft: T;
  published: T;
  draftUpdatedAt: string;
  publishedAt: string | null;
}

export async function getBlockDraft<K extends PageContentKey>(
  key: K,
): Promise<PageContentMap[K] | null> {
  const db = await getDb();
  const doc = await db
    .collection<PageContentDoc<PageContentMap[K]>>(COLLECTION)
    .findOne({ _id: key });
  return doc?.draft ?? null;
}

export async function getBlockPublished<K extends PageContentKey>(
  key: K,
): Promise<PageContentMap[K] | null> {
  const db = await getDb();
  const doc = await db
    .collection<PageContentDoc<PageContentMap[K]>>(COLLECTION)
    .findOne({ _id: key });
  return doc?.published ?? null;
}

export interface BlockStatus {
  key: PageContentKey;
  draftUpdatedAt: string;
  publishedAt: string | null;
  dirty: boolean;
}

/** One round trip for all blocks + a dirty flag per block, for the admin list page and sidebar badge. */
export async function listBlocksWithDirty(): Promise<BlockStatus[]> {
  const db = await getDb();
  const docs = await db.collection<PageContentDoc<unknown>>(COLLECTION).find().toArray();
  return docs.map((d) => ({
    key: d._id as PageContentKey,
    draftUpdatedAt: d.draftUpdatedAt,
    publishedAt: d.publishedAt,
    dirty: JSON.stringify(d.draft) !== JSON.stringify(d.published),
  }));
}

export async function saveBlockDraft<K extends PageContentKey>(
  key: K,
  data: PageContentMap[K],
): Promise<void> {
  const db = await getDb();
  await db.collection<PageContentDoc<PageContentMap[K]>>(COLLECTION).updateOne(
    { _id: key },
    { $set: { draft: data, draftUpdatedAt: new Date().toISOString() } },
    { upsert: true },
  );
}

/** Seed-only: never overwrites an existing doc, safe to re-run indefinitely. */
export async function seedBlockIfMissing<K extends PageContentKey>(
  key: K,
  data: PageContentMap[K],
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection<PageContentDoc<PageContentMap[K]>>(COLLECTION).updateOne(
    { _id: key },
    { $setOnInsert: { draft: data, published: data, draftUpdatedAt: now, publishedAt: now } },
    { upsert: true },
  );
}

/** Copies draft -> published for a single block, if it's dirty. Returns whether it was published. */
export async function publishBlock(key: PageContentKey): Promise<boolean> {
  const db = await getDb();
  const col = db.collection<PageContentDoc<unknown>>(COLLECTION);
  const doc = await col.findOne({ _id: key });
  if (!doc) return false;

  const dirty = JSON.stringify(doc.draft) !== JSON.stringify(doc.published);
  if (!dirty) return false;

  await col.updateOne(
    { _id: key },
    { $set: { published: doc.draft, publishedAt: new Date().toISOString() } },
  );
  return true;
}

/** Copies draft -> published for every block where they differ. Returns the keys that changed. */
export async function publishAllDirtyBlocks(): Promise<PageContentKey[]> {
  const db = await getDb();
  const col = db.collection<PageContentDoc<unknown>>(COLLECTION);
  const docs = await col.find().toArray();
  const dirty = docs.filter((d) => JSON.stringify(d.draft) !== JSON.stringify(d.published));
  if (dirty.length === 0) return [];

  const now = new Date().toISOString();
  await Promise.all(
    dirty.map((d) =>
      col.updateOne({ _id: d._id }, { $set: { published: d.draft, publishedAt: now } }),
    ),
  );
  return dirty.map((d) => d._id as PageContentKey);
}
