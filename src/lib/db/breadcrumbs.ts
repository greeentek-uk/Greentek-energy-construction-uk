import { getDb } from "./mongodb";

const COLLECTION = "siteSettings";
const DOC_ID = "breadcrumbs";

export interface BreadcrumbSettings {
  enabled: boolean;
  showHome: boolean;
  homeLabel: string;
  /** "chevron" renders an icon; anything else is used as literal text. */
  separator: string;
}

export const DEFAULT_BREADCRUMB_SETTINGS: BreadcrumbSettings = {
  enabled: true,
  showHome: true,
  homeLabel: "Home",
  separator: "chevron",
};

type BreadcrumbDoc = BreadcrumbSettings & { _id: typeof DOC_ID };

export async function getBreadcrumbSettings(): Promise<BreadcrumbSettings> {
  const db = await getDb();
  const doc = await db.collection<BreadcrumbDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return DEFAULT_BREADCRUMB_SETTINGS;
  const { _id, ...settings } = doc;
  return { ...DEFAULT_BREADCRUMB_SETTINGS, ...settings };
}

export async function saveBreadcrumbSettings(settings: BreadcrumbSettings): Promise<void> {
  const db = await getDb();
  await db
    .collection<BreadcrumbDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: settings }, { upsert: true });
}
