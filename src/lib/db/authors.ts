import { getDb } from "./mongodb";
import type { Author } from "@/data/authors";

const COLLECTION = "authors";

type AuthorDoc = Omit<Author, "slug"> & { _id: string };

function fromDoc({ _id, ...rest }: AuthorDoc): Author {
  return { slug: _id, ...rest };
}

export async function getAuthors(): Promise<Author[]> {
  const db = await getDb();
  const docs = await db.collection<AuthorDoc>(COLLECTION).find().sort({ name: 1 }).toArray();
  return docs.map(fromDoc);
}

export async function getAuthorBySlug(slug: string | undefined): Promise<Author | null> {
  if (!slug) return null;
  const db = await getDb();
  const doc = await db.collection<AuthorDoc>(COLLECTION).findOne({ _id: slug });
  return doc ? fromDoc(doc) : null;
}

/** Replaces the whole author: the form posts every field, so a cleared one must go. */
export async function saveAuthor(author: Author): Promise<void> {
  const db = await getDb();
  const { slug, ...rest } = author;
  await db.collection<AuthorDoc>(COLLECTION).replaceOne({ _id: slug }, rest, { upsert: true });
}

export async function deleteAuthor(slug: string): Promise<void> {
  const db = await getDb();
  await db.collection<AuthorDoc>(COLLECTION).deleteOne({ _id: slug });
}
