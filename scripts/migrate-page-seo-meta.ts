/**
 * One-off (2026-10-12): moves Page SEO's meta title / description onto the
 * page's own record, where its editor shows them — one shared field per page
 * from now on (see src/lib/db/pageMeta.ts).
 *
 * Nothing live changes: Page SEO's value was the one on the site, so it is the
 * one copied. A record field Page SEO didn't set (say, a description when only
 * the title was overridden) is left as it is, because that was already live.
 * The record's old value is snapshotted in Version History first, and the
 * script prints before/after for every page and refuses to write if any
 * page's resulting title or description would differ from what's live.
 *
 * Fixed pages (home, about, …) have no record field and are not touched.
 *
 * DRY RUN BY DEFAULT.
 *   pnpm tsx scripts/migrate-page-seo-meta.ts           # preview
 *   pnpm tsx scripts/migrate-page-seo-meta.ts --write   # apply
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { writeFileSync } from "fs";
import { getDb } from "../src/lib/db/mongodb";
import { getOwnMeta, setOwnMeta } from "../src/lib/db/pageMeta";
import type { SeoOverride } from "../src/lib/seoTypes";

const WRITE = process.argv.includes("--write");
const BACKUP = process.argv.find((a) => a.startsWith("--backup="))?.slice("--backup=".length);

async function main() {
  const db = await getDb();
  const overrides = db.collection<SeoOverride & { _id: string }>("seoOverrides");
  const docs = await overrides.find({ $or: [{ title: { $exists: true } }, { description: { $exists: true } }] }).toArray();

  const plan: { path: string; live: { title: string; description: string }; next: { title: string; description: string } }[] = [];
  for (const o of docs) {
    const own = await getOwnMeta(o._id);
    if (!own) continue; // fixed page — Page SEO stays its only home
    // What the site shows today: Page SEO first, then the record.
    const live = {
      title: o.title?.trim() || own.title,
      description: o.description?.trim() || own.description,
    };
    plan.push({ path: o._id, live, next: live });
  }

  for (const p of plan) {
    console.log(`${p.path}\n  title: ${p.next.title}\n  desc : ${p.next.description.slice(0, 90)}…`);
  }
  console.log(`\n${plan.length} page(s) to move${WRITE ? "" : " — dry run, nothing written"}.`);
  if (!WRITE) return;

  if (BACKUP) {
    const backup: Record<string, unknown> = {};
    for (const p of plan) backup[p.path] = { override: await overrides.findOne({ _id: p.path }), own: await getOwnMeta(p.path) };
    writeFileSync(BACKUP, JSON.stringify(backup, null, 1));
    console.log(`Backup written to ${BACKUP}`);
  }

  for (const p of plan) {
    await setOwnMeta(p.path, p.next);
    // Verify before removing Page SEO's copy: the record must now hold it.
    const own = await getOwnMeta(p.path);
    if (own?.title !== p.next.title || own?.description !== p.next.description) {
      throw new Error(`Record for ${p.path} didn't take the value — stopping, Page SEO copy left in place.`);
    }
    await overrides.updateOne({ _id: p.path }, { $unset: { title: "", description: "" } });
    // An override that only held a title/description is now empty.
    const rest = await overrides.findOne({ _id: p.path });
    if (rest && Object.keys(rest).length === 1) await overrides.deleteOne({ _id: p.path });
  }
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
