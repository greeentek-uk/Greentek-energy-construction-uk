import { getDb } from "./mongodb";
import type { LocationServiceContent } from "@/data/site";

const COLLECTION = "locationServiceContent";

type LocationServiceContentDoc = Omit<
  LocationServiceContent,
  "locationSlug" | "serviceSlug"
> & { _id: string; locationSlug: string; serviceSlug: string };

function key(locationSlug: string, serviceSlug: string): string {
  return `${locationSlug}__${serviceSlug}`;
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

export async function deleteLocationServiceContent(
  locationSlug: string,
  serviceSlug: string,
): Promise<void> {
  const db = await getDb();
  await db
    .collection<LocationServiceContentDoc>(COLLECTION)
    .deleteOne({ _id: key(locationSlug, serviceSlug) });
}
