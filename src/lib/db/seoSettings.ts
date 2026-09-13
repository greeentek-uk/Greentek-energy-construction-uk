import { getDb } from "./mongodb";
import { DEFAULT_SEO_TEMPLATES, type SeoTemplates } from "@/lib/seoTemplates";

const COLLECTION = "siteSettings";
const DOC_ID = "seoTemplates";

type SeoTemplatesDoc = SeoTemplates & { _id: typeof DOC_ID };

/** Merges stored values over defaults so a newly added template field isn't undefined. */
function normalize(doc: Partial<SeoTemplates> | null): SeoTemplates {
  if (!doc) return DEFAULT_SEO_TEMPLATES;
  return {
    ...DEFAULT_SEO_TEMPLATES,
    ...doc,
    home: { ...DEFAULT_SEO_TEMPLATES.home, ...doc.home },
    service: { ...DEFAULT_SEO_TEMPLATES.service, ...doc.service },
    location: { ...DEFAULT_SEO_TEMPLATES.location, ...doc.location },
    locationService: { ...DEFAULT_SEO_TEMPLATES.locationService, ...doc.locationService },
    project: { ...DEFAULT_SEO_TEMPLATES.project, ...doc.project },
    blog: { ...DEFAULT_SEO_TEMPLATES.blog, ...doc.blog },
    verification: { ...DEFAULT_SEO_TEMPLATES.verification, ...doc.verification },
  };
}

export async function getSeoTemplates(): Promise<SeoTemplates> {
  const db = await getDb();
  const doc = await db.collection<SeoTemplatesDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return DEFAULT_SEO_TEMPLATES;
  const { _id, ...rest } = doc;
  return normalize(rest);
}

export async function saveSeoTemplates(templates: SeoTemplates): Promise<void> {
  const db = await getDb();
  await db
    .collection<SeoTemplatesDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: templates }, { upsert: true });
}
