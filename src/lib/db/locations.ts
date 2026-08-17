import { getDb } from "./mongodb";
import type { Location } from "@/data/site";

const COLLECTION = "locations";

type LocationDoc = Omit<Location, "slug"> & { _id: string };

function fromDoc(doc: LocationDoc): Location {
  const { _id, ...rest } = doc;
  return { slug: _id, ...rest };
}

function toDoc(location: Location): LocationDoc {
  const { slug, ...rest } = location;
  return { _id: slug, ...rest };
}

export async function getLocations(): Promise<Location[]> {
  const db = await getDb();
  const docs = await db
    .collection<LocationDoc>(COLLECTION)
    .find()
    .sort({ _id: 1 })
    .toArray();
  return docs.map(fromDoc);
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const db = await getDb();
  const doc = await db.collection<LocationDoc>(COLLECTION).findOne({ _id: slug });
  return doc ? fromDoc(doc) : null;
}

export async function createLocation(location: Location): Promise<void> {
  const db = await getDb();
  await db.collection<LocationDoc>(COLLECTION).insertOne(toDoc(location));
}

export async function updateLocation(
  slug: string,
  updates: Partial<Omit<Location, "slug">>,
): Promise<void> {
  const db = await getDb();
  await db.collection<LocationDoc>(COLLECTION).updateOne({ _id: slug }, { $set: updates });
}

export async function deleteLocation(slug: string): Promise<void> {
  const db = await getDb();
  await db.collection<LocationDoc>(COLLECTION).deleteOne({ _id: slug });
}
