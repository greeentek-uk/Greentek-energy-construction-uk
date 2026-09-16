import { revalidatePath as nextRevalidatePath } from "next/cache";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/structuredData";

type PathType = "page" | "layout";

/**
 * Clears a cached page, on this server and on the live site.
 *
 * Next's own `revalidatePath` only affects the process it runs in. Editing
 * through a local admin panel therefore updates the shared database and
 * refreshes localhost, while the live site keeps serving the HTML it
 * prerendered at its last build — content looks correct to whoever made the
 * change and stale to everyone else, crawlers included.
 *
 * So the local call still happens, and when the editor isn't on the live host
 * the live site is told as well. Purely event-driven: nothing is regenerated
 * unless something actually changed, and a regenerated page then stays cached
 * until the next change.
 */
export async function revalidate(path: string, type?: PathType): Promise<void> {
  if (type) nextRevalidatePath(path, type);
  else nextRevalidatePath(path);

  await syncLiveSite([{ path, type }]);
}

interface Target {
  path: string;
  type?: PathType;
}

/** Tracks failures so the panel can tell the editor rather than failing silently. */
let lastSyncError: string | null = null;

export function getLastSyncError(): string | null {
  return lastSyncError;
}

async function currentHost(): Promise<string | null> {
  try {
    return (await headers()).get("host");
  } catch {
    // Outside a request (a script, say) — nothing to compare against.
    return null;
  }
}

export async function syncLiveSite(targets: Target[]): Promise<boolean> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return true;

  let liveHost: string;
  try {
    liveHost = new URL(SITE_URL).host;
  } catch {
    return true;
  }

  // Already running on the live site — the local call above did the work.
  const host = await currentHost();
  if (!host || host === liveHost) return true;

  try {
    const response = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ targets }),
      cache: "no-store",
    });

    if (!response.ok) {
      lastSyncError = `Live site returned ${response.status} when refreshing its cache.`;
      return false;
    }

    lastSyncError = null;
    return true;
  } catch (err) {
    lastSyncError = err instanceof Error ? err.message : "Could not reach the live site.";
    return false;
  }
}

/** Used by the panel's "Refresh live site" button — clears everything. */
export async function revalidateEverything(): Promise<void> {
  nextRevalidatePath("/", "layout");
  await syncLiveSite([{ path: "/", type: "layout" }]);
}

export interface PanelLocation {
  /** True when this panel is served from the public site. */
  isLiveHost: boolean;
  host: string | null;
  liveHost: string;
  configured: boolean;
}

/**
 * Where this panel is running relative to the public site.
 *
 * Used to warn the editor when they're working somewhere other than the live
 * host — the case where cache refreshes have to travel, and therefore the case
 * where they can fail.
 */
export async function getPanelLocation(): Promise<PanelLocation> {
  let liveHost = "";
  try {
    liveHost = new URL(SITE_URL).host;
  } catch {
    liveHost = "";
  }
  const host = await currentHost();
  return {
    isLiveHost: Boolean(host && liveHost && host === liveHost),
    host,
    liveHost,
    configured: Boolean(process.env.REVALIDATE_SECRET),
  };
}
