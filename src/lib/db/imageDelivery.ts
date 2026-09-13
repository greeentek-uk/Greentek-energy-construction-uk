import { getDb } from "./mongodb";
import {
  DEFAULT_IMAGE_DELIVERY,
  normalizeImageDeliveryConfig,
  type ImageDeliveryConfig,
} from "@/lib/imageDelivery";

const COLLECTION = "siteSettings";
const DOC_ID = "imageDelivery";

type ImageDeliveryDoc = ImageDeliveryConfig & { _id: typeof DOC_ID };

export async function getImageDelivery(): Promise<ImageDeliveryConfig> {
  const db = await getDb();
  const doc = await db.collection<ImageDeliveryDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return DEFAULT_IMAGE_DELIVERY;
  const { _id, ...config } = doc;
  return normalizeImageDeliveryConfig(config);
}

export async function saveImageDelivery(config: ImageDeliveryConfig): Promise<void> {
  const db = await getDb();
  await db
    .collection<ImageDeliveryDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: normalizeImageDeliveryConfig(config) }, { upsert: true });
}
