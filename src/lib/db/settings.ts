import { getDb } from "./mongodb";
import type { SiteConfig } from "@/data/site";

const COLLECTION = "settings";
const SETTINGS_ID = "settings";

export type Settings = Omit<SiteConfig, "services" | "projects" | "locations">;

type SettingsDoc = Settings & { _id: typeof SETTINGS_ID };

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const doc = await db.collection<SettingsDoc>(COLLECTION).findOne({ _id: SETTINGS_ID });
  if (!doc) {
    throw new Error("Settings document not found — run `npm run migrate` first.");
  }
  const { _id, ...settings } = doc;
  return settings;
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  const db = await getDb();
  await db
    .collection<SettingsDoc>(COLLECTION)
    .updateOne({ _id: SETTINGS_ID }, { $set: updates }, { upsert: true });
}
