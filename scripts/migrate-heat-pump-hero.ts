/**
 * Moves the heat pump landing page (`lp-air-source-heat-pumps`) onto the
 * cleaner hero of 2026-11-04 (owner: "clean the hero"): the four-line grant
 * paragraph becomes one line, and the ticks become short ("Free survey",
 * "Fixed price in writing", "Pay monthly…"); MCS and "no EPC" now sit in the
 * number strip after the reviews. The "Everything you need, in one job"
 * block goes (the "Everything included" card beside the quiz says the same)
 * and the MCS block loses its photo — both were the hero's photo again.
 *
 * The quiz, number strip and "what's included" need nothing — the stored doc
 * has none of those fields, so `withLandingDefaults` shows the defaults. The
 * hero's body and ticks are different: production holds the 2026-10-29 copy
 * (`migrate:heat-pump-grant`), which overrides the new defaults.
 *
 * Same rules as that script: field by field, only where the stored value is
 * still exactly the earlier copy (fingerprints below), so anything edited in
 * the panel is left alone and reported. Draft and published are checked
 * separately; the draft is snapshotted to Version History first. DRY RUN
 * unless --write. Afterwards, "Refresh live site" on the dashboard (or any
 * save) clears the cached page.
 */
import { createHash } from "node:crypto";
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision } from "../src/lib/db/revisions";
import { LANDING_PAGE_DEFAULTS } from "../src/data/landingDefaults";

config({ path: ".env.local" });

const write = process.argv.includes("--write");
const KEY = "lp-air-source-heat-pumps";

/** sha256 (first 16 hex) of each field's JSON in the 2026-10-29 copy. */
const EARLIER_COPY: Record<string, string> = {
  heroBody: "1321488862d06260",
  heroTicks: "7de814f53cc4c6c0",
  features: "6709bd64c3f54c23",
};

const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

async function run() {
  const db = await getDb();
  const col = db.collection<{ _id: string; draft: Record<string, unknown>; published: Record<string, unknown> }>(
    "pageContent",
  );
  const doc = await col.findOne({ _id: KEY });
  if (!doc) {
    console.log(`  ${KEY}: missing — run pnpm seed:page-content instead (it inserts the new copy)`);
    return;
  }
  const latest = LANDING_PAGE_DEFAULTS[KEY] as unknown as Record<string, unknown>;
  const set: Record<string, unknown> = {};
  for (const [field, earlier] of Object.entries(EARLIER_COPY)) {
    for (const side of ["draft", "published"] as const) {
      const stored = doc[side]?.[field];
      if (fingerprint(stored) === fingerprint(latest[field])) {
        console.log(`  ${side}.${field}: already the latest copy`);
      } else if (stored === undefined) {
        console.log(`  ${side}.${field}: not stored — the page already shows the new default`);
      } else if (fingerprint(stored) === earlier) {
        console.log(`  ${side}.${field}: earlier copy → latest${write ? "" : " (dry run)"}`);
        set[`${side}.${field}`] = latest[field];
      } else {
        console.log(`  ${side}.${field}: edited in the panel — left alone`);
      }
    }
  }
  if (!write || !Object.keys(set).length) return;
  await saveRevision("pageContent", KEY, doc.draft, `${KEY} (before hero clean-up)`);
  const now = new Date().toISOString();
  await col.updateOne({ _id: KEY }, { $set: { ...set, draftUpdatedAt: now, publishedAt: now } });
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
