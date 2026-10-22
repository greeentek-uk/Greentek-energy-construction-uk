import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { saveRevision } from "../src/lib/db/revisions";
import { LANDING_PAGE_DEFAULTS } from "../src/data/landingDefaults";

config({ path: ".env.local" });

/**
 * Coverage wording on the ad landing pages (owner, 2026-10-22): based in
 * Birmingham, mostly the West Midlands, Wales and London, further afield when
 * the project makes it feasible. The new place-name chips appear on their own
 * (stored docs lack `areaNames`, so the default fills in), but the heading,
 * text, FAQ, social proof line and meta description are stored — without this
 * the page showed a London chip under "We cover the West Midlands and Wales".
 *
 * Replaces only the exact old sentences, in both draft and published, so
 * anything already rewritten in the panel is left alone (and reported).
 * DRY RUN unless --write; snapshots each doc to Version History first.
 */
const write = process.argv.includes("--write");

const OLD = {
  areasHeading: "We cover the West Midlands and Wales",
  areasBody: "Not sure if we cover your area? Put your postcode in the form and we will tell you straight away.",
  socialProofLine: "Join 500+ homeowners across the West Midlands and Wales",
  metaDescription: "Free home survey across the West Midlands and Wales.",
  faqAnswer: "We work across the West Midlands and Wales. Put your postcode in the form and we will tell you straight away.",
};
const NEW_META_SENTENCE = "Free home survey across most of the UK.";
const AREA_QUESTION = "Which areas do you cover?";

type Content = Record<string, unknown> & { faqs?: { question: string; answer: string }[] };

function update(content: Content, defaults: (typeof LANDING_PAGE_DEFAULTS)[keyof typeof LANDING_PAGE_DEFAULTS]) {
  const changed: string[] = [];
  const kept: string[] = [];
  const next: Content = { ...content };

  for (const key of ["areasHeading", "areasBody", "socialProofLine"] as const) {
    if (next[key] === OLD[key]) {
      next[key] = defaults[key];
      changed.push(key);
    } else if (next[key] !== defaults[key]) kept.push(key);
  }

  if (typeof next.metaDescription === "string" && next.metaDescription.includes(OLD.metaDescription)) {
    next.metaDescription = next.metaDescription.replace(OLD.metaDescription, NEW_META_SENTENCE);
    changed.push("metaDescription");
  }

  const newAnswer = defaults.faqs.find((f) => f.question === AREA_QUESTION)?.answer;
  if (newAnswer && Array.isArray(next.faqs)) {
    next.faqs = next.faqs.map((faq) => {
      // Substring, not equality: the answer may be stored wrapped in <p>.
      if (faq.question !== AREA_QUESTION || !faq.answer.includes(OLD.faqAnswer)) return faq;
      changed.push("faq");
      return { ...faq, answer: faq.answer.replace(OLD.faqAnswer, newAnswer) };
    });
  }
  return { next, changed, kept };
}

async function run() {
  const db = await getDb();
  const col = db.collection<{ _id: string; draft: Content; published: Content }>("pageContent");
  for (const [key, defaults] of Object.entries(LANDING_PAGE_DEFAULTS)) {
    const doc = await col.findOne({ _id: key });
    if (!doc) {
      console.log(`  ${key}: missing — left alone`);
      continue;
    }
    const draft = update(doc.draft ?? {}, defaults);
    const published = update(doc.published ?? {}, defaults);
    console.log(`  ${key}:`);
    console.log(`    draft:     ${draft.changed.join(", ") || "nothing to change"}`);
    console.log(`    published: ${published.changed.join(", ") || "nothing to change"}`);
    const kept = [...new Set([...draft.kept, ...published.kept])];
    if (kept.length) console.log(`    edited in the panel, left alone: ${kept.join(", ")}`);
    if (!write || (!draft.changed.length && !published.changed.length)) continue;
    await saveRevision("pageContent", key, doc.draft, `${key} (before coverage wording update)`);
    const now = new Date().toISOString();
    await col.updateOne(
      { _id: key },
      {
        $set: {
          draft: draft.next,
          published: published.next,
          ...(draft.changed.length ? { draftUpdatedAt: now } : {}),
          ...(published.changed.length ? { publishedAt: now } : {}),
        },
      },
    );
  }
}

run()
  .then(() => {
    console.log(write ? "Done. Use “Refresh live site” on the dashboard." : "Dry run — nothing written. Re-run with --write.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
