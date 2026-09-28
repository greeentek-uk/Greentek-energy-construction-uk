import { getDb } from "./mongodb";

/**
 * The keyword the SEO person is optimising each page for — a note to self,
 * shown in the panel only.
 *
 * Its own collection, keyed by the page's public path, rather than a field on
 * the service/location/SEO documents: nothing the public site loads ever reads
 * this collection, so a working note can't leak into a page, its metadata or
 * its schema. Keyed by path so the same keyword shows wherever that page is
 * edited — its own editor and Page SEO.
 */
const COLLECTION = "focusKeywords";

interface FocusKeywordDoc {
  _id: string;
  keyword: string;
  updatedAt: Date;
}

export async function getFocusKeyword(path: string): Promise<string> {
  const db = await getDb();
  const doc = await db.collection<FocusKeywordDoc>(COLLECTION).findOne({ _id: path });
  return doc?.keyword ?? "";
}

/** Every page's keyword, by path — for the Page SEO list. */
export async function getAllFocusKeywords(): Promise<Record<string, string>> {
  const db = await getDb();
  const docs = await db.collection<FocusKeywordDoc>(COLLECTION).find().toArray();
  return Object.fromEntries(docs.map((d) => [d._id, d.keyword]));
}

/** Blank removes it, so an emptied box doesn't leave a stale keyword behind. */
export async function setFocusKeyword(path: string, keyword: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<FocusKeywordDoc>(COLLECTION);
  if (!keyword) {
    await collection.deleteOne({ _id: path });
    return;
  }
  await collection.replaceOne(
    { _id: path },
    { keyword, updatedAt: new Date() },
    { upsert: true },
  );
}
