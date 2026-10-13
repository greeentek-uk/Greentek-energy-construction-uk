import { createHash } from "node:crypto";
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision } from "../src/lib/db/revisions";
import { LANDING_PAGE_DEFAULTS } from "../src/data/landingDefaults";

config({ path: ".env.local" });

const write = process.argv.includes("--write");

const UNEDITED_EARLIER_COPY: Record<string, string[]> = {
  // 7c5ec4… = the kitchen v2 copy before its price bands were added (2026-10-13).
  "lp-kitchen-renovation": ["d630d774afc2b92b", "7c5ec4d030fbc17a", "fbd07ca2d16d2c9b"],
  // 90ae0b… = the bathroom v2 copy before its second before/after was added (2026-10-13).
  "lp-bathroom-renovation": ["698097e9aa55a124", "90ae0b485f05a32c", "2ec81c768197a71b"],
};

const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

async function run() {
  const db = await getDb();
  const col = db.collection<{ _id: string; draft: Record<string, unknown>; published: Record<string, unknown> }>(
    "pageContent",
  );
  for (const [key, v2] of Object.entries(LANDING_PAGE_DEFAULTS)) {
    const doc = await col.findOne({ _id: key });
    if (!doc) {
      console.log(`  ${key}: missing — run pnpm seed:page-content instead`);
      continue;
    }
    const isV1 = !("results" in (doc.draft ?? {})) || !("results" in (doc.published ?? {}));
    const known = UNEDITED_EARLIER_COPY[key] ?? [];
    const isUneditedEarlierCopy =
      known.includes(fingerprint(doc.draft)) && known.includes(fingerprint(doc.published));
    if (fingerprint(doc.published) === fingerprint(v2) && fingerprint(doc.draft) === fingerprint(v2)) {
      console.log(`  ${key}: already the latest copy — left alone`);
      continue;
    }
    if (!isV1 && !isUneditedEarlierCopy) {
      console.log(`  ${key}: edited in the panel — left alone`);
      continue;
    }
    console.log(`  ${key}: ${isV1 ? "v1" : "earlier drafted copy"} → latest${write ? "" : " (dry run)"}`);
    if (!write) continue;
    await saveRevision("pageContent", key, doc.draft, `${key} (before landing copy update)`);
    const now = new Date().toISOString();
    await col.updateOne(
      { _id: key },
      { $set: { draft: v2 as unknown as Record<string, unknown>, published: v2 as unknown as Record<string, unknown>, draftUpdatedAt: now, publishedAt: now } },
    );
  }
}

run()
  .then(() => {
    console.log(write ? "Done." : "Dry run — nothing written. Re-run with --write.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
