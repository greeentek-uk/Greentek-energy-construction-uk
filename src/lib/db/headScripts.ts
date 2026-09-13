import { getDb } from "./mongodb";
import { EMPTY_HEAD_SCRIPTS, type HeadScriptsConfig } from "@/lib/headScripts";

const COLLECTION = "siteSettings";
const DOC_ID = "headScripts";

type HeadScriptsDoc = HeadScriptsConfig & { _id: typeof DOC_ID };

export async function getHeadScripts(): Promise<HeadScriptsConfig> {
  const db = await getDb();
  const doc = await db.collection<HeadScriptsDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (!doc) return EMPTY_HEAD_SCRIPTS;
  return { entries: doc.entries ?? [], allowedDomains: doc.allowedDomains ?? [] };
}

export async function saveHeadScripts(config: HeadScriptsConfig): Promise<void> {
  const db = await getDb();
  await db
    .collection<HeadScriptsDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: config }, { upsert: true });
  invalidateAllowedDomainsCache();
}

const CACHE_TTL_MS = 60_000;
let domainsCache: { value: string[]; expiresAt: number } | null = null;

export function invalidateAllowedDomainsCache(): void {
  domainsCache = null;
}

/**
 * Read used by proxy.ts, which runs on every request — so it's cached in memory
 * for a minute rather than hitting Mongo each time. A saved change clears the
 * cache in this process immediately; other instances pick it up within the TTL.
 * On any read failure we fall back to an empty allowlist, which yields the
 * baseline policy rather than an unprotected one.
 */
export async function getAllowedScriptDomainsCached(): Promise<string[]> {
  if (domainsCache && domainsCache.expiresAt > Date.now()) {
    return domainsCache.value;
  }
  try {
    const { allowedDomains } = await getHeadScripts();
    domainsCache = { value: allowedDomains, expiresAt: Date.now() + CACHE_TTL_MS };
    return allowedDomains;
  } catch {
    domainsCache = { value: [], expiresAt: Date.now() + CACHE_TTL_MS };
    return [];
  }
}
