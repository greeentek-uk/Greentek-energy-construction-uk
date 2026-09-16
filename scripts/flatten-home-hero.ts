/**
 * One-time: collapses the home-hero block from a three-slide carousel to the
 * single hero shape. Keeps the first slide's copy and image, and fills in the
 * form headings and rating badge defaults. Safe to re-run — a block that has
 * already been flattened is left alone.
 *
 * Still here because a database that hasn't been through this yet would
 * otherwise render a hero with no content at all.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "@/lib/db/mongodb";

interface LegacySlide {
  image: string;
  imageAlt?: string;
  headingLine1: string;
  headingLine2: string;
  body: string;
  ctaLabel: string;
}

function flatten(block: Record<string, unknown> | undefined) {
  if (!block) return null;
  if (!Array.isArray(block.slides)) return null;

  const first = (block.slides as LegacySlide[])[0];
  if (!first) return null;

  return {
    ratingLabel: String(block.ratingLabel ?? "Excellent"),
    ratingScore: String(block.ratingScore ?? "4.4"),
    ratingUrl: String(
      block.ratingUrl ?? "https://www.trustpilot.com/review/greentekenergy.co.uk",
    ),
    image: first.image,
    ...(first.imageAlt ? { imageAlt: first.imageAlt } : {}),
    headingLine1: first.headingLine1,
    headingLine2: first.headingLine2,
    body: first.body,
    ctaLabel: first.ctaLabel,
    formHeading: String(block.formHeading ?? "Get a free quote"),
    formSubheading: String(
      block.formSubheading ?? "Two quick steps. We reply within one business day.",
    ),
  };
}

(async () => {
  const db = await getDb();
  const collection = db.collection("pageContent");
  const doc = (await collection.findOne({ _id: "home-hero" as never })) as
    | { draft?: Record<string, unknown>; published?: Record<string, unknown> }
    | null;

  if (!doc) {
    console.log("No home-hero block found — run `npm run seed:page-content` first.");
    process.exit(0);
  }

  const draft = flatten(doc.draft);
  const published = flatten(doc.published);

  if (!draft && !published) {
    console.log("home-hero is already flattened. Nothing to do.");
    process.exit(0);
  }

  await collection.updateOne(
    { _id: "home-hero" as never },
    {
      $set: {
        ...(draft ? { draft } : {}),
        ...(published ? { published } : {}),
      },
    },
  );

  const kept = draft ?? published;
  console.log(`Flattened home-hero. Kept: "${kept?.headingLine1} ${kept?.headingLine2}"`);
  process.exit(0);
})();
