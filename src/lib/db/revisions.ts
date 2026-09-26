import { getDb } from "./mongodb";

const COLLECTION = "revisions";

/** How many snapshots are kept per document. */
export const REVISIONS_KEPT = 5;

/** Content types that get revision history. */
export type RevisionScope =
  | "pages"
  | "blogPosts"
  | "services"
  | "locations"
  | "projects"
  | "locationServiceContent"
  | "pageContent"
  | "settings";

export interface Revision {
  id: string;
  scope: RevisionScope;
  /** Slug or document id this snapshot belongs to. */
  docId: string;
  /** Human-readable name at the time of the snapshot, for the restore list. */
  label: string;
  /** The full document as it was *before* the save that created this entry. */
  snapshot: unknown;
  savedAt: string;
}

type RevisionDoc = Revision & { _id: string };

/**
 * Stores the previous version of a document, then trims to the newest
 * REVISIONS_KEPT for that document.
 *
 * Capped by count rather than age deliberately: storage stays bounded and
 * predictable no matter how often someone edits, and there's no scheduled
 * cleanup to go wrong. Five is enough to walk back a bad editing session,
 * which is what this is for.
 */
export async function saveRevision(
  scope: RevisionScope,
  docId: string,
  snapshot: unknown,
  label: string,
): Promise<void> {
  const db = await getDb();
  const collection = db.collection<RevisionDoc>(COLLECTION);
  const id = `${scope}:${docId}:${Date.now()}`;

  await collection.insertOne({
    _id: id,
    id,
    scope,
    docId,
    label,
    snapshot,
    savedAt: new Date().toISOString(),
  } as RevisionDoc);

  const existing = await collection
    .find({ scope, docId })
    .sort({ savedAt: -1 })
    .toArray();

  const surplus = existing.slice(REVISIONS_KEPT);
  if (surplus.length) {
    await collection.deleteMany({ _id: { $in: surplus.map((r) => r._id) } });
  }
}

export async function getRevisions(
  scope: RevisionScope,
  docId: string,
): Promise<Revision[]> {
  const db = await getDb();
  const docs = await db
    .collection<RevisionDoc>(COLLECTION)
    .find({ scope, docId })
    .sort({ savedAt: -1 })
    .toArray();
  return docs.map(({ _id, ...rest }) => rest as Revision);
}

export async function getRevision(id: string): Promise<Revision | null> {
  const db = await getDb();
  const doc = await db.collection<RevisionDoc>(COLLECTION).findOne({ _id: id });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as Revision;
}

/** Every document that currently has history, for the panel's recovery screen. */
export async function getRecentRevisions(limit = 60): Promise<Revision[]> {
  const db = await getDb();
  const docs = await db
    .collection<RevisionDoc>(COLLECTION)
    .find()
    .sort({ savedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(({ _id, ...rest }) => rest as Revision);
}
