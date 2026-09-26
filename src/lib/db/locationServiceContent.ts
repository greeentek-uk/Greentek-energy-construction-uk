import { getDb } from "./mongodb";
import type { LocationServiceContent } from "@/data/site";
import { saveRevision } from "./revisions";

const COLLECTION = "locationServiceContent";

type LocationServiceContentDoc = Omit<
  LocationServiceContent,
  "locationSlug" | "serviceSlug"
> & { _id: string; locationSlug: string; serviceSlug: string };

function key(locationSlug: string, serviceSlug: string): string {
  return `${locationSlug}__${serviceSlug}`;
}

function revisionLabel(entry: LocationServiceContent): string {
  return `/locations/${entry.locationSlug}/${entry.serviceSlug}`;
}

function fromDoc(doc: LocationServiceContentDoc): LocationServiceContent {
  const { _id, ...rest } = doc;
  return rest;
}

export async function getAllLocationServiceContent(): Promise<LocationServiceContent[]> {
  const db = await getDb();
  const docs = await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .find()
    .toArray();
  return docs.map(fromDoc);
}

export async function getLocationServiceContentByKeys(
  locationSlug: string,
  serviceSlug: string,
): Promise<LocationServiceContent | null> {
  const db = await getDb();
  const doc = await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .findOne({ _id: key(locationSlug, serviceSlug) });
  return doc ? fromDoc(doc) : null;
}

export async function getLocationServiceContentForLocation(
  locationSlug: string,
): Promise<LocationServiceContent[]> {
  const db = await getDb();
  const docs = await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .find({ locationSlug })
    .toArray();
  return docs.map(fromDoc);
}

export async function upsertLocationServiceContent(
  entry: LocationServiceContent,
): Promise<void> {
  const db = await getDb();
  const { locationSlug, serviceSlug, ...rest } = entry;
  await db.collection<LocationServiceContentDoc>(COLLECTION).updateOne(
    { _id: key(locationSlug, serviceSlug) },
    { $set: { locationSlug, serviceSlug, ...rest } },
    { upsert: true },
  );
}

/**
 * Replaces the whole document, for the admin form, which always posts every
 * field. upsertLocationServiceContent's $set can't do this: a field cleared in
 * the panel is simply absent from the entry, so $set would leave the old value
 * live on the page. (The seed scripts keep using the $set version on purpose —
 * they write one field and must not wipe the rest.)
 */
export async function replaceLocationServiceContent(
  entry: LocationServiceContent,
): Promise<void> {
  const db = await getDb();
  const _id = key(entry.locationSlug, entry.serviceSlug);
  const existing = await getLocationServiceContentByKeys(entry.locationSlug, entry.serviceSlug);
  if (existing) await saveRevision("locationServiceContent", _id, existing, revisionLabel(existing));
  await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .replaceOne({ _id }, entry, { upsert: true });
}

export async function deleteLocationServiceContent(
  locationSlug: string,
  serviceSlug: string,
): Promise<void> {
  const db = await getDb();
  const existing = await getLocationServiceContentByKeys(locationSlug, serviceSlug);
  if (existing) {
    await saveRevision(
      "locationServiceContent",
      key(locationSlug, serviceSlug),
      existing,
      `${revisionLabel(existing)} (cleared)`,
    );
  }
  await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .deleteOne({ _id: key(locationSlug, serviceSlug) });
}
