import { getDb } from "./mongodb";
import type { Project } from "@/data/site";

const COLLECTION = "projects";

type ProjectDoc = Omit<Project, "slug"> & { _id: string };

function fromDoc(doc: ProjectDoc): Project {
  const { _id, ...rest } = doc;
  return { slug: _id, ...rest };
}

function toDoc(project: Project): ProjectDoc {
  const { slug, ...rest } = project;
  return { _id: slug, ...rest };
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  const docs = await db
    .collection<ProjectDoc>(COLLECTION)
    .find()
    .sort({ _id: 1 })
    .toArray();
  return docs.map(fromDoc);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const db = await getDb();
  const doc = await db.collection<ProjectDoc>(COLLECTION).findOne({ _id: slug });
  return doc ? fromDoc(doc) : null;
}

export async function createProject(project: Project): Promise<void> {
  const db = await getDb();
  await db.collection<ProjectDoc>(COLLECTION).insertOne(toDoc(project));
}

export async function updateProject(
  slug: string,
  updates: Partial<Omit<Project, "slug">>,
): Promise<void> {
  const db = await getDb();
  await db.collection<ProjectDoc>(COLLECTION).updateOne({ _id: slug }, { $set: updates });
}

export async function deleteProject(slug: string): Promise<void> {
  const db = await getDb();
  await db.collection<ProjectDoc>(COLLECTION).deleteOne({ _id: slug });
}
