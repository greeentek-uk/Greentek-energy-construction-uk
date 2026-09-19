import { getDb } from "./mongodb";
import {
  normalizeFooterCtaSettings,
  type FooterCtaSettings,
} from "@/lib/footerCta";

const COLLECTION = "siteSettings";
const DOC_ID = "footerCta";

type FooterCtaDoc = FooterCtaSettings & { _id: typeof DOC_ID };

/** Falls back to today's footer copy when nothing has been saved yet. */
export async function getFooterCtaSettings(): Promise<FooterCtaSettings> {
  const db = await getDb();
  const doc = await db.collection<FooterCtaDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return normalizeFooterCtaSettings(null);
  const { _id, ...settings } = doc;
  return normalizeFooterCtaSettings(settings);
}

export async function saveFooterCtaSettings(settings: FooterCtaSettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<FooterCtaDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
}
