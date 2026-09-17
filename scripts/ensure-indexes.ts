/**
 * Creates the indexes the admin panel's queries rely on.
 *
 * Without these, every one of these reads is a full collection scan with an
 * in-memory sort. That's fine at today's volumes and steadily worse as the
 * 404 log and revision history fill up — and MongoDB aborts an in-memory sort
 * once it exceeds 32MB, so it eventually fails rather than merely slowing.
 *
 * Idempotent: creating an index that already exists is a no-op. Run after
 * deploying, and safe to re-run any time.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "@/lib/db/mongodb";

(async () => {
  const db = await getDb();

  const plan: [string, Record<string, 1 | -1>, string][] = [
    // getRevisions(scope, docId) sorted newest-first, and the trim that follows it.
    ["revisions", { scope: 1, docId: 1, savedAt: -1 }, "scope_docId_savedAt"],
    // getRecentRevisions() — the Version History screen.
    ["revisions", { savedAt: -1 }, "savedAt_desc"],
    // getNotFoundEntries() — the 404 list, newest first.
    ["notFoundLog", { lastSeenAt: -1 }, "lastSeenAt_desc"],
    // getRedirects() filters to enabled rules on every request through the proxy.
    ["redirects", { enabled: 1 }, "enabled"],
    // getPages() / getPublishedPages() ordering.
    ["pages", { published: 1, order: 1 }, "published_order"],
    // claimStaleEnquiry() — finding unsent forms whose photos need deleting.
    ["enquirySessions", { submittedAt: 1, cleanedAt: 1, createdAt: 1 }, "unsent_by_age"],
  ];

  for (const [collection, keys, name] of plan) {
    const created = await db.collection(collection).createIndex(keys, { name });
    console.log(`  ${collection.padEnd(12)} ${created}`);
  }

  console.log("\nIndexes ensured.");
  process.exit(0);
})();
