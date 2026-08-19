/**
 * One-time migration: the "home-hero" page-content block changed shape from
 * a single heading/body/cta to a `slides[]` array (hero became a slider).
 * `seedBlockIfMissing` won't touch a block that already exists, so this
 * directly rewrites both `draft` and `published` for the existing doc —
 * otherwise the live site reads the old shape and crashes on `slides.map`.
 * Only touches "home-hero"; does not affect any other block's draft/publish
 * state. Safe to re-run. Run via `npx tsx scripts/migrate-home-hero-slides.ts`.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import type { HomeHeroContent } from "../src/data/pageContent";

config({ path: ".env.local" });

const NEW_CONTENT: HomeHeroContent = {
  trustBadgeSuffix: "by 500+ Homeowners",
  slides: [
    {
      image: "/images/home-page/house-2.png",
      headingLine1: "Bridging Construction",
      headingLine2: "with Renewable Energy.",
      body: "One team for solar, heat pumps, insulation, and full property renovation, residential and commercial, across the West Midlands and Wales.",
      ctaLabel: "Consult an Expert",
    },
    {
      image: "/images/projects/Heating/after.webp",
      headingLine1: "Solar, Heat Pumps",
      headingLine2: "& Smarter Heating.",
      body: "Cut your energy bills with MCS-certified solar PV, battery storage and air source heat pump installations from one accredited in-house team.",
      ctaLabel: "Get a Free Quote",
    },
    {
      image: "/images/projects/full-home-renovation.jpg",
      headingLine1: "Full Renovations,",
      headingLine2: "Built To Last.",
      body: "From kitchens and extensions to whole-property refurbishments, we deliver construction work to the same standard as our energy installations.",
      ctaLabel: "Start Your Project",
    },
  ],
};

async function run() {
  const db = await getDb();
  const col = db.collection("pageContent");
  const existing = await col.findOne({ _id: "home-hero" as unknown as never });

  if (!existing) {
    console.log("No existing home-hero doc — nothing to migrate (seed script will create it fresh).");
    return;
  }

  const alreadyMigrated =
    Array.isArray((existing.draft as HomeHeroContent | undefined)?.slides) &&
    Array.isArray((existing.published as HomeHeroContent | undefined)?.slides);

  if (alreadyMigrated) {
    console.log("home-hero already has slides[] shape on both draft and published — nothing to do.");
    return;
  }

  const now = new Date().toISOString();
  await col.updateOne(
    { _id: "home-hero" as unknown as never },
    {
      $set: {
        draft: NEW_CONTENT,
        published: NEW_CONTENT,
        draftUpdatedAt: now,
        publishedAt: now,
      },
    },
  );
  console.log("Migrated home-hero draft + published to the new slides[] shape.");
}

run()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
