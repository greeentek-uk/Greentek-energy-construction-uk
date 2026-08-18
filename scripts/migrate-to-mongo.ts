/**
 * One-off seed: reads the existing src/data/*.json files and upserts them
 * into MongoDB. Safe to re-run (upserts, not inserts) if content changes
 * before the admin CMS fully takes over. Run via `npm run migrate`.
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Collection, Db } from "mongodb";
import { getDb } from "../src/lib/db/mongodb";
import type { SiteConfig } from "../src/data/site";
import type { BlogPost } from "../src/data/blogs";
import type { SeoOverrides } from "../src/lib/seo";

config({ path: ".env.local" });

type StringIdDoc = Record<string, unknown> & { _id: string };

const dataDir = path.join(process.cwd(), "src", "data");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(dataDir, file), "utf-8")) as T;
}

async function upsertBySlug<T extends { slug: string }>(
  collection: Collection<StringIdDoc>,
  items: T[],
): Promise<void> {
  for (const item of items) {
    const { slug, ...rest } = item;
    await collection.updateOne({ _id: slug }, { $set: rest }, { upsert: true });
  }
  console.log(`  ${collection.collectionName}: ${items.length} documents upserted`);
}

async function migrate(db: Db): Promise<void> {
  const site = readJson<SiteConfig>("site.json");
  const blogs = readJson<BlogPost[]>("blogs.json");
  const seo = readJson<SeoOverrides>("seo.json");

  const { services, projects, locations, ...settings } = site;

  await db
    .collection<StringIdDoc>("settings")
    .updateOne({ _id: "settings" }, { $set: settings }, { upsert: true });
  console.log("  settings: 1 document upserted");

  await upsertBySlug(db.collection<StringIdDoc>("services"), services);
  await upsertBySlug(db.collection<StringIdDoc>("projects"), projects);
  await upsertBySlug(db.collection<StringIdDoc>("locations"), locations);
  await upsertBySlug(db.collection<StringIdDoc>("blogPosts"), blogs);

  const seoEntries = Object.entries(seo);
  for (const [pathKey, override] of seoEntries) {
    await db
      .collection<StringIdDoc>("seoOverrides")
      .updateOne({ _id: pathKey }, { $set: override }, { upsert: true });
  }
  console.log(`  seoOverrides: ${seoEntries.length} documents upserted`);
}

getDb()
  .then(async (db) => {
    console.log("Connected. Migrating…");
    await migrate(db);
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
