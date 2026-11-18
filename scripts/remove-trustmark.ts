/**
 * Removes the TrustMark accreditation from the live content (owner,
 * 2026-11-17): the logo from the `accreditations` block and every sentence
 * that says *Greentek* is TrustMark registered/certified, in page content,
 * the four ad landing pages, blog posts and location + service pages.
 *
 * General advice to readers ("check public registers such as TrustMark",
 * "PAS 2035 coordinators must be registered with a TrustMark-approved
 * scheme") is left alone on purpose: it makes no claim about us and is still
 * true. Counts that included TrustMark ("Eight industry bodies", "MCS,
 * TrustMark, Gas Safe and five other") drop by one so they stay accurate.
 *
 * Exact phrase replacements only, so hand edits that don't match are reported
 * rather than guessed at. Each changed document is snapshotted to Version
 * History first. DRY RUN unless --write. Afterwards, "Refresh live site" on
 * the dashboard.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision, type RevisionScope } from "../src/lib/db/revisions";

config({ path: ".env.local" });

const write = process.argv.includes("--write");

/** [find, replace] — applied in order to every string in the scanned docs. */
const PHRASES: [string | RegExp, string][] = [
  ["Our installers are TrustMark certified and Greentek is a SWIGA member.", "Greentek is a SWIGA member."],
  ["Greentek Energy Ltd is TrustMark registered and the workmanship carries a written warranty.", "The workmanship carries a written warranty."],
  [
    "We are TrustMark registered, which is the framework behind the PAS 2030 and PAS 2035 retrofit standards that apply where work is funded.",
    "The work follows the PAS 2030 and PAS 2035 retrofit standards that apply where work is funded.",
  ],
  [", TrustMark licence number [insert].", "."],
  [/ under our TrustMark registration/g, ""],
  ["MCS certified and TrustMark registered", "MCS certified"],
  [/MCS and TrustMark certified/g, "MCS certified"],
  ["MCS, TrustMark, Gas Safe and five other industry bodies", "MCS, Gas Safe and five other industry bodies"],
  ["Eight industry bodies check our work, including TrustMark and Gas Safe.", "Seven industry bodies check our work, including Gas Safe and HIES."],
  ["Eight industry bodies check our work, including MCS and TrustMark.", "Seven industry bodies check our work, including MCS and HIES."],
  ["Checked by 8 industry bodies", "Checked by 7 industry bodies"],
];

/** Landing-page ticks/bullets that were only the words "TrustMark registered". */
const WHOLE_VALUE: Record<string, string> = {
  "lp-kitchen-renovation": "Gas Safe registered",
  "lp-bathroom-renovation": "Gas Safe registered",
  "lp-solar-panels": "HIES accredited",
  "lp-air-source-heat-pumps": "HIES accredited",
};

const CLAIM = /trust\s*-?mark/i;

function rewrite(value: unknown, wholeValue: string | undefined): unknown {
  if (typeof value === "string") {
    if (value === "TrustMark registered" && wholeValue) return wholeValue;
    let out = value;
    for (const [find, replace] of PHRASES) {
      out = typeof find === "string" ? out.split(find).join(replace) : out.replace(find, replace);
    }
    return out;
  }
  if (Array.isArray(value)) {
    // The accreditation logo itself goes, not just its wording.
    return value
      .filter((v) => !(v && typeof v === "object" && "name" in v && CLAIM.test(String((v as { name: unknown }).name))))
      .map((v) => rewrite(v, wholeValue));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v, wholeValue)]));
  }
  return value;
}

function remaining(value: unknown, path = ""): string[] {
  if (typeof value === "string") return CLAIM.test(value) ? [`${path}: ${value.replace(/<[^>]+>/g, "").slice(0, 140)}`] : [];
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => remaining(v, path ? `${path}.${k}` : k));
  return [];
}

async function run() {
  const db = await getDb();
  const scopes: RevisionScope[] = ["pageContent", "blogPosts", "locationServiceContent", "services", "locations", "pages"];
  for (const scope of scopes) {
    const col = db.collection<Record<string, unknown> & { _id: string }>(scope);
    for await (const doc of col.find({})) {
      if (!remaining(doc).length) continue;
      const { _id, ...rest } = doc;
      const next = rewrite(rest, WHOLE_VALUE[_id]) as Record<string, unknown>;
      const set: Record<string, unknown> = {};
      for (const key of Object.keys(next)) {
        if (JSON.stringify(next[key]) !== JSON.stringify(rest[key])) set[key] = next[key];
      }
      const left = remaining(next);
      console.log(`\n[${scope}] ${_id}: ${Object.keys(set).length ? `rewrites ${Object.keys(set).join(", ")}` : "no change"}`);
      for (const line of left) console.log(`  left as is (general advice?) ${line}`);
      if (!write || !Object.keys(set).length) continue;
      const snapshot = scope === "pageContent" ? doc.draft : doc;
      await saveRevision(scope, _id, snapshot, `${_id} (before TrustMark removal)`);
      await col.updateOne({ _id }, { $set: set });
    }
  }
}

run()
  .then(() => {
    console.log(write ? "\nDone." : "\nDry run, nothing written. Re-run with --write.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
