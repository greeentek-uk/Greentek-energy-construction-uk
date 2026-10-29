/**
 * Moves the heat pump landing page (`lp-air-source-heat-pumps`) onto the
 * grant copy of 2026-10-29: a grant-led hero ("Check if you can get £7,500
 * off a heat pump", "Check my grant" buttons), and the offer strip, meta
 * description, steps, FAQs and closing section name the Boiler Upgrade Scheme
 * grant (£7,500, or £9,000 for oil/LPG homes off mains gas) and answer "who
 * applies / do I pay extra / who can fit it".
 *
 * The new grant section needs nothing — the stored doc has no grant fields,
 * so `withLandingDefaults` shows the defaults. These fields are different:
 * the doc was seeded with the earlier copy, so it overrides the new defaults.
 *
 * Field by field, and only where the stored value is still exactly the earlier
 * drafted copy (fingerprints below): anything edited in the panel is left
 * alone and reported. Draft and published are checked separately. The draft is
 * snapshotted to Version History first. DRY RUN unless --write. Afterwards,
 * "Refresh live site" on the dashboard (or any save) clears the cached page.
 */
import { createHash } from "node:crypto";
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision } from "../src/lib/db/revisions";
import { LANDING_PAGE_DEFAULTS } from "../src/data/landingDefaults";

config({ path: ".env.local" });

const write = process.argv.includes("--write");
const KEY = "lp-air-source-heat-pumps";

/** sha256 (first 16 hex) of each field's JSON in the copy before 2026-10-29. */
const EARLIER_COPY: Record<string, string> = {
  metaDescription: "3acdc594e749b839",
  offerBar: "5573793b68536d05",
  heroBody: "62cfd601f21c0f25",
  heroTicks: "8efbd5d09cf6d852",
  steps: "468dde6bce650e0d",
  faqs: "2d84779ca946dfc9",
  finalHeading: "4652a3e01b102b95",
  finalBody: "325a92ffaade65e8",
  heroHeading: "3e0b5b792ebf937a",
  heroHighlight: "4fdbc622aeb63d9e",
  quoteButtonLabel: "634bb4b8ddcbfccf",
  stickyQuoteLabel: "865fb72cb04cfd45",
  formHeading: "894db3854f8a331f",
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
      } else if (fingerprint(stored) === earlier) {
        console.log(`  ${side}.${field}: earlier copy → latest${write ? "" : " (dry run)"}`);
        set[`${side}.${field}`] = latest[field];
      } else {
        console.log(`  ${side}.${field}: edited in the panel — left alone`);
      }
    }
  }
  if (!write || !Object.keys(set).length) return;
  await saveRevision("pageContent", KEY, doc.draft, `${KEY} (before grant copy update)`);
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
