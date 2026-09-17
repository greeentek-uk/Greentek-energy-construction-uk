import { getDb } from "./mongodb";

const COLLECTION = "siteSettings";
const DOC_ID = "clarity";

export interface ClaritySettings {
  /** From Clarity → Settings → Overview. Blank turns Clarity off. */
  projectId: string;
}

type ClarityDoc = ClaritySettings & { _id: typeof DOC_ID };

export async function getClaritySettings(): Promise<ClaritySettings> {
  const db = await getDb();
  const doc = await db.collection<ClarityDoc>(COLLECTION).findOne({ _id: DOC_ID });
  return { projectId: doc?.projectId ?? "" };
}

export async function saveClaritySettings(settings: ClaritySettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<ClarityDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
}
