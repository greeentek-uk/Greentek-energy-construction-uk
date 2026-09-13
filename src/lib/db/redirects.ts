import { getDb } from "./mongodb";

const COLLECTION = "redirects";

export type RedirectStatus = 301 | 302 | 307 | 410;

export interface RedirectRule {
  id: string;
  /** Path to match, e.g. "/old-page". Supports a trailing `*` wildcard. */
  source: string;
  /** Where to send it. Ignored for 410 (Gone). */
  destination: string;
  status: RedirectStatus;
  enabled: boolean;
  /** How many times it has fired — shows which rules still earn their keep. */
  hits: number;
  lastHitAt: string | null;
  createdAt: string;
}

type RedirectDoc = RedirectRule & { _id: string };

export async function getRedirects(): Promise<RedirectRule[]> {
  const db = await getDb();
  const docs = await db.collection<RedirectDoc>(COLLECTION).find().toArray();
  return docs
    .map(({ _id, ...rule }) => rule as RedirectRule)
    .sort((a, b) => a.source.localeCompare(b.source));
}

export async function upsertRedirect(rule: RedirectRule): Promise<void> {
  const db = await getDb();
  await db
    .collection<RedirectDoc>(COLLECTION)
    .replaceOne({ _id: rule.id }, { _id: rule.id, ...rule } as RedirectDoc, { upsert: true });
  invalidateRedirectCache();
}

export async function deleteRedirect(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<RedirectDoc>(COLLECTION).deleteOne({ _id: id });
  invalidateRedirectCache();
}

export async function recordRedirectHit(id: string): Promise<void> {
  const db = await getDb();
  await db
    .collection<RedirectDoc>(COLLECTION)
    .updateOne({ _id: id }, { $inc: { hits: 1 }, $set: { lastHitAt: new Date().toISOString() } });
}

const CACHE_TTL_MS = 30_000;
let cache: { value: RedirectRule[]; expiresAt: number } | null = null;

export function invalidateRedirectCache(): void {
  cache = null;
}

/**
 * Read used by proxy.ts on every request, so it's cached in memory briefly
 * rather than hitting Mongo each time. On a read failure it returns no rules:
 * serving the page is a better failure mode than 500-ing the whole site
 * because the redirect table was unreachable.
 */
export async function getRedirectsCached(): Promise<RedirectRule[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  try {
    const rules = (await getRedirects()).filter((r) => r.enabled);
    cache = { value: rules, expiresAt: Date.now() + CACHE_TTL_MS };
    return rules;
  } catch {
    cache = { value: [], expiresAt: Date.now() + CACHE_TTL_MS };
    return [];
  }
}

/** Returns the matching rule and the resolved destination, honouring a `*` suffix. */
export function matchRedirect(
  path: string,
  rules: RedirectRule[],
): { rule: RedirectRule; destination: string } | null {
  for (const rule of rules) {
    const source = rule.source.trim();
    if (!source) continue;

    if (source.endsWith("*")) {
      const prefix = source.slice(0, -1);
      if (path.startsWith(prefix)) {
        // Carry the matched remainder onto the destination so
        // /old/* -> /new/ keeps the rest of the path intact.
        const remainder = path.slice(prefix.length);
        const destination = rule.destination.endsWith("*")
          ? rule.destination.slice(0, -1) + remainder
          : rule.destination;
        return { rule, destination };
      }
      continue;
    }

    if (path === source) return { rule, destination: rule.destination };
  }
  return null;
}
