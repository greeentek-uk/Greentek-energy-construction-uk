import { getDb } from "./mongodb";
import { saveRevision } from "./revisions";
import type { SitePage } from "@/data/pages";

const COLLECTION = "pages";

type PageDoc = SitePage & { _id: string };

export async function getPages(): Promise<SitePage[]> {
  const db = await getDb();
  const docs = await db.collection<PageDoc>(COLLECTION).find().toArray();
  return docs
    .map(({ _id, ...page }) => page as SitePage)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
}

export async function getPublishedPages(): Promise<SitePage[]> {
  return (await getPages()).filter((page) => page.published);
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  const db = await getDb();
  const doc = await db.collection<PageDoc>(COLLECTION).findOne({ _id: slug });
  if (!doc) return null;
  const { _id, ...page } = doc;
  return page as SitePage;
}

export async function createPage(page: SitePage): Promise<void> {
  const db = await getDb();
  await db.collection<PageDoc>(COLLECTION).insertOne({ _id: page.slug, ...page } as PageDoc);
}

export async function updatePage(slug: string, page: SitePage): Promise<void> {
  const db = await getDb();
  const existing = await getPageBySlug(slug);
  if (existing) await saveRevision("pages", slug, existing, existing.title);

  // A slug change moves the document, since the slug is the _id.
  if (page.slug !== slug) {
    await db.collection<PageDoc>(COLLECTION).deleteOne({ _id: slug });
    await db.collection<PageDoc>(COLLECTION).insertOne({ _id: page.slug, ...page } as PageDoc);
    return;
  }

  await db
    .collection<PageDoc>(COLLECTION)
    .replaceOne({ _id: slug }, { _id: slug, ...page } as PageDoc, { upsert: true });
}

export async function deletePage(slug: string): Promise<void> {
  const db = await getDb();
  const existing = await getPageBySlug(slug);
  if (existing) await saveRevision("pages", slug, existing, `${existing.title} (deleted)`);
  await db.collection<PageDoc>(COLLECTION).deleteOne({ _id: slug });
}
