import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision } from "../src/lib/db/revisions";
import { LANDING_PAGE_DEFAULTS } from "../src/data/landingDefaults";

config({ path: ".env.local" });

const write = process.argv.includes("--write");

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
    if (!isV1) {
      console.log(`  ${key}: already v2 — left alone`);
      continue;
    }
    console.log(`  ${key}: v1 → v2${write ? "" : " (dry run)"}`);
    if (!write) continue;
    await saveRevision("pageContent", key, doc.draft, `${key} (before v2 rebuild)`);
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
