import { getDb } from "./mongodb";
import {
  DEFAULT_SITEMAP_CONFIG,
  normalizeSitemapConfig,
  type SitemapConfig,
} from "@/lib/sitemapConfig";

const COLLECTION = "siteSettings";
const DOC_ID = "sitemap";

type SitemapDoc = SitemapConfig & { _id: typeof DOC_ID };

export async function getSitemapConfig(): Promise<SitemapConfig> {
  const db = await getDb();
  const doc = await db.collection<SitemapDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return DEFAULT_SITEMAP_CONFIG;
  const { _id, ...config } = doc;
  return normalizeSitemapConfig(config);
}

export async function saveSitemapConfig(config: SitemapConfig): Promise<void> {
  const db = await getDb();
  await db
    .collection<SitemapDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: config }, { upsert: true });
}
