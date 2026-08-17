import { getDb } from "./mongodb";
import type { BlogPost } from "@/data/blogs";

const COLLECTION = "blogPosts";

type BlogPostDoc = Omit<BlogPost, "slug"> & { _id: string };

function fromDoc(doc: BlogPostDoc): BlogPost {
  const { _id, ...rest } = doc;
  return { slug: _id, ...rest };
}

function toDoc(post: BlogPost): BlogPostDoc {
  const { slug, ...rest } = post;
  return { _id: slug, ...rest };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const db = await getDb();
  const docs = await db
    .collection<BlogPostDoc>(COLLECTION)
    .find()
    .sort({ date: -1 })
    .toArray();
  return docs.map(fromDoc);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await getDb();
  const doc = await db.collection<BlogPostDoc>(COLLECTION).findOne({ _id: slug });
  return doc ? fromDoc(doc) : null;
}

export async function createBlogPost(post: BlogPost): Promise<void> {
  const db = await getDb();
  await db.collection<BlogPostDoc>(COLLECTION).insertOne(toDoc(post));
}

/** Mongo's `_id` is immutable, so a slug rename (slug !== originalSlug) is a delete+insert instead of an update. */
export async function updateBlogPost(originalSlug: string, post: BlogPost): Promise<void> {
  const db = await getDb();
  const collection = db.collection<BlogPostDoc>(COLLECTION);

  if (post.slug !== originalSlug) {
    await collection.deleteOne({ _id: originalSlug });
    await collection.insertOne(toDoc(post));
  } else {
    const { slug, ...updates } = post;
    await collection.updateOne({ _id: originalSlug }, { $set: updates });
  }
}

export async function deleteBlogPost(slug: string): Promise<void> {
  const db = await getDb();
  await db.collection<BlogPostDoc>(COLLECTION).deleteOne({ _id: slug });
}
