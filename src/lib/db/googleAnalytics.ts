import { getDb } from "./mongodb";

const COLLECTION = "siteSettings";
const DOC_ID = "googleAnalytics";

export interface GoogleAnalyticsSettings {
  /** GA4 measurement id, e.g. G-WMBE8DEKZ7. Blank turns Google Analytics off. */
  measurementId: string;
}

type GoogleAnalyticsDoc = GoogleAnalyticsSettings & { _id: typeof DOC_ID };

export async function getGoogleAnalyticsSettings(): Promise<GoogleAnalyticsSettings> {
  const db = await getDb();
  const doc = await db.collection<GoogleAnalyticsDoc>(COLLECTION).findOne({ _id: DOC_ID });
  return { measurementId: doc?.measurementId ?? "" };
}

export async function saveGoogleAnalyticsSettings(settings: GoogleAnalyticsSettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<GoogleAnalyticsDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
}
