import { getDb } from "./mongodb";
import type { Service } from "@/data/site";

const COLLECTION = "services";

type ServiceDoc = Omit<Service, "slug"> & { _id: string };

function fromDoc(doc: ServiceDoc): Service {
  const { _id, ...rest } = doc;
  return { slug: _id, ...rest };
}

function toDoc(service: Service): ServiceDoc {
  const { slug, ...rest } = service;
  return { _id: slug, ...rest };
}

export async function getServices(): Promise<Service[]> {
  const db = await getDb();
  const docs = await db
    .collection<ServiceDoc>(COLLECTION)
    .find()
    .sort({ _id: 1 })
    .toArray();
  return docs.map(fromDoc);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const db = await getDb();
  const doc = await db.collection<ServiceDoc>(COLLECTION).findOne({ _id: slug });
  return doc ? fromDoc(doc) : null;
}

export async function createService(service: Service): Promise<void> {
  const db = await getDb();
  await db.collection<ServiceDoc>(COLLECTION).insertOne(toDoc(service));
}

export async function updateService(
  slug: string,
  updates: Partial<Omit<Service, "slug">>,
): Promise<void> {
  const db = await getDb();
  await db.collection<ServiceDoc>(COLLECTION).updateOne({ _id: slug }, { $set: updates });
}

export async function deleteService(slug: string): Promise<void> {
  const db = await getDb();
  await db.collection<ServiceDoc>(COLLECTION).deleteOne({ _id: slug });
}
