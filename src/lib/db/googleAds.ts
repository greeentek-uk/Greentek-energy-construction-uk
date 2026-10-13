import { getDb } from "./mongodb";
import type { GoogleAdsSettings } from "@/lib/googleAds";

const COLLECTION = "siteSettings";
const DOC_ID = "googleAds";

type GoogleAdsDoc = GoogleAdsSettings & { _id: typeof DOC_ID };

export async function getGoogleAdsSettings(): Promise<GoogleAdsSettings> {
  const db = await getDb();
  const doc = await db.collection<GoogleAdsDoc>(COLLECTION).findOne({ _id: DOC_ID });
  return {
    conversionId: doc?.conversionId ?? "",
    leadLabel: doc?.leadLabel ?? "",
    callLabel: doc?.callLabel ?? "",
    whatsappLabel: doc?.whatsappLabel ?? "",
  };
}

export async function saveGoogleAdsSettings(settings: GoogleAdsSettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<GoogleAdsDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
}
