import { getDb } from "./mongodb";

const COLLECTION = "siteSettings";
const DOC_ID = "metaPixel";

export interface MetaPixelSettings {
  /** Public pixel id. Blank disables both the browser pixel and the Conversions API. */
  pixelId: string;
  /** From Events Manager → Test events. Routes server events to the test view while set. */
  testEventCode: string;
  /**
   * "necessary" runs the pixel for every visitor; "marketing" waits until the
   * visitor accepts marketing cookies (and the server sends nothing for them
   * either). Chosen by the site owner in the panel.
   */
  consent: MetaPixelConsent;
}

export type MetaPixelConsent = "necessary" | "marketing";

export const EMPTY_META_PIXEL: MetaPixelSettings = {
  pixelId: "",
  testEventCode: "",
  consent: "necessary",
};

type MetaPixelDoc = MetaPixelSettings & { _id: typeof DOC_ID };

export async function getMetaPixelSettings(): Promise<MetaPixelSettings> {
  const db = await getDb();
  const doc = await db.collection<MetaPixelDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return EMPTY_META_PIXEL;
  return {
    pixelId: doc.pixelId ?? "",
    testEventCode: doc.testEventCode ?? "",
    consent: doc.consent === "marketing" ? "marketing" : "necessary",
  };
}

export async function saveMetaPixelSettings(settings: MetaPixelSettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<MetaPixelDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
  cache = null;
}

const TTL_MS = 60_000;
let cache: { value: MetaPixelSettings; expiresAt: number } | null = null;

/** Read on every tracked event, so briefly cached rather than hitting Mongo each time. */
export async function getMetaPixelSettingsCached(): Promise<MetaPixelSettings> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  try {
    const value = await getMetaPixelSettings();
    cache = { value, expiresAt: Date.now() + TTL_MS };
    return value;
  } catch {
    return EMPTY_META_PIXEL;
  }
}
