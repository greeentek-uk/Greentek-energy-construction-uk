import { getDb } from "./mongodb";
import { saveRevision, type RevisionScope } from "./revisions";

/**
 * A page's meta title and description — one value per page, whichever screen
 * edits it.
 *
 * Pages with a record of their own (services, locations, location + service
 * pages, blog posts, admin-created pages) keep it on that record as
 * `metaTitle` / `metaDescription`. Their editor and Page SEO both read and
 * write those same two fields, so the two screens always show the live value.
 *
 * Until 2026-10-12 Page SEO saved its own copy in `seoOverrides`, which beat
 * the record's: the two screens drifted apart (all 11 services showed a title
 * in their editor that nothing used). The copies were moved onto the records
 * that day; Page SEO's other settings (canonical, social, robots, sitemap)
 * still live in `seoOverrides`.
 *
 * Fixed pages (home, about, contact, the listings, projects) have no record
 * field, so for them Page SEO's own `title` / `description` remain the value.
 */
export interface PageMeta {
  title: string;
  description: string;
}

interface Target {
  collection: string;
  id: string;
  scope: RevisionScope;
  /** Name of the editor that shows the same fields, for the Page SEO note. */
  editorLabel: string;
  editorHref: string;
  /** Extra fields a new combo document needs when Page SEO creates it. */
  insertFields?: Record<string, string>;
}

/** Where a path's own meta lives — null for pages that have no record field. */
async function targetFor(path: string): Promise<Target | null> {
  const parts = path.split("/").filter(Boolean);
  const db = await getDb();
  const exists = async (collection: string, id: string) =>
    Boolean(await db.collection(collection).findOne({ _id: id as never }, { projection: { _id: 1 } }));

  if (parts[0] === "services" && parts.length === 2 && (await exists("services", parts[1]))) {
    return {
      collection: "services",
      id: parts[1],
      scope: "services",
      editorLabel: "the service editor",
      editorHref: `/admin/services/${parts[1]}`,
    };
  }

  if (parts[0] === "locations" && parts.length === 2 && (await exists("locations", parts[1]))) {
    return {
      collection: "locations",
      id: parts[1],
      scope: "locations",
      editorLabel: "the location editor",
      editorHref: `/admin/locations/${parts[1]}`,
    };
  }

  if (
    parts[0] === "locations" &&
    parts.length === 3 &&
    (await exists("locations", parts[1])) &&
    (await exists("services", parts[2]))
  ) {
    const [, locationSlug, serviceSlug] = parts;
    return {
      collection: "locationServiceContent",
      id: `${locationSlug}__${serviceSlug}`,
      scope: "locationServiceContent",
      editorLabel: "the location + service editor",
      editorHref: `/admin/locations/${locationSlug}/services/${serviceSlug}`,
      // A combo with nothing of its own has no document yet.
      insertFields: { locationSlug, serviceSlug },
    };
  }

  if (parts[0] === "blog" && parts.length === 2 && (await exists("blogPosts", parts[1]))) {
    return {
      collection: "blogPosts",
      id: parts[1],
      scope: "blogPosts",
      editorLabel: "the blog post editor",
      editorHref: `/admin/blog/${parts[1]}`,
    };
  }

  // Admin-created pages at /[slug]. RESERVED_SLUGS keeps a page from taking a
  // fixed route's slug, so a match here is never /about and friends.
  if (parts.length === 1 && (await exists("pages", parts[0]))) {
    return {
      collection: "pages",
      id: parts[0],
      scope: "pages",
      editorLabel: "the page editor",
      editorHref: `/admin/pages/${parts[0]}`,
    };
  }

  return null;
}

/** Whether a path's meta is kept on its own record, and which editor shares it. */
export async function getOwnMetaEditor(
  path: string,
): Promise<{ label: string; href: string } | null> {
  const target = await targetFor(path);
  return target ? { label: target.editorLabel, href: target.editorHref } : null;
}

/** The page's own meta, or null when the path has no record to hold it. */
export async function getOwnMeta(path: string): Promise<PageMeta | null> {
  const target = await targetFor(path);
  if (!target) return null;
  const db = await getDb();
  const doc = await db
    .collection(target.collection)
    .findOne({ _id: target.id as never }, { projection: { metaTitle: 1, metaDescription: 1 } });
  return {
    title: String(doc?.metaTitle ?? ""),
    description: String(doc?.metaDescription ?? ""),
  };
}

/**
 * Writes the page's own meta from Page SEO. Returns false when the path has no
 * record (the caller then keeps the value in `seoOverrides`).
 *
 * Only these two fields are touched, so it can't wipe anything the page's own
 * editor holds; the previous version is snapshotted for Version History.
 */
export async function setOwnMeta(path: string, meta: PageMeta): Promise<boolean> {
  const target = await targetFor(path);
  if (!target) return false;

  const db = await getDb();
  const collection = db.collection(target.collection);
  const existing = await collection.findOne({ _id: target.id as never });

  const title = meta.title.trim();
  const description = meta.description.trim();
  if (existing?.metaTitle === title && existing?.metaDescription === description) return true;
  if (!existing && !title && !description) return true;

  if (existing) {
    const { _id, ...snapshot } = existing;
    const label =
      target.scope === "locationServiceContent"
        ? `/locations/${existing.locationSlug}/${existing.serviceSlug}`
        : String(existing.title ?? existing.name ?? target.id);
    // Same shape the editors snapshot, so a restore from either screen works.
    const restorable =
      target.scope === "blogPosts" || target.scope === "locations" || target.scope === "services"
        ? { slug: _id, ...snapshot }
        : snapshot;
    await saveRevision(target.scope, target.id, restorable, label);
  }

  const set: Record<string, string> = { ...(existing ? {} : target.insertFields) };
  const unset: Record<string, ""> = {};
  if (title) set.metaTitle = title;
  else unset.metaTitle = "";
  if (description) set.metaDescription = description;
  else unset.metaDescription = "";

  await collection.updateOne(
    { _id: target.id as never },
    {
      ...(Object.keys(set).length ? { $set: set } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    },
    { upsert: true },
  );
  return true;
}
