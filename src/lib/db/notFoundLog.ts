import { getDb } from "./mongodb";

const COLLECTION = "notFoundLog";

export interface NotFoundEntry {
  path: string;
  hits: number;
  firstSeenAt: string;
  lastSeenAt: string;
  /** Most recent referrer, which usually says where the dead link lives. */
  referrer: string | null;
  /** Set once a redirect has been created for this path. */
  resolved: boolean;
}

type NotFoundDoc = NotFoundEntry & { _id: string };

/** Upserts by path so one broken link is a single row with a counter. */
export async function recordNotFound(path: string, referrer: string | null): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection<NotFoundDoc>(COLLECTION).updateOne(
    { _id: path },
    {
      $inc: { hits: 1 },
      $set: { lastSeenAt: now, referrer, path },
      $setOnInsert: { firstSeenAt: now, resolved: false },
    },
    { upsert: true },
  );
}

export async function getNotFoundEntries(limit = 200): Promise<NotFoundEntry[]> {
  const db = await getDb();
  const docs = await db
    .collection<NotFoundDoc>(COLLECTION)
    .find()
    .sort({ lastSeenAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(({ _id, ...entry }) => entry as NotFoundEntry);
}

export async function markNotFoundResolved(path: string): Promise<void> {
  const db = await getDb();
  await db
    .collection<NotFoundDoc>(COLLECTION)
    .updateOne({ _id: path }, { $set: { resolved: true } });
}

export async function deleteNotFoundEntry(path: string): Promise<void> {
  const db = await getDb();
  await db.collection<NotFoundDoc>(COLLECTION).deleteOne({ _id: path });
}

export async function clearResolvedNotFound(): Promise<number> {
  const db = await getDb();
  const result = await db.collection<NotFoundDoc>(COLLECTION).deleteMany({ resolved: true });
  return result.deletedCount ?? 0;
}
