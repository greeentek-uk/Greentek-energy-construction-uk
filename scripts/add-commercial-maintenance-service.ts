/**
 * One-time fix: the homepage's "Verticals" section (Home Solutions group)
 * has always linked to /services/commercial-planned-maintenance, but that
 * Service record was never actually created — a pre-existing content gap,
 * not a code bug. Creates it now with the same metaTitle/metaDescription/
 * content treatment the other 10 services already have, plus a unique
 * intro for each of the 6 locations so /locations/[slug]/commercial-
 * planned-maintenance isn't thin/templated either.
 * Safe to re-run — skips anything that already exists.
 * Run via `npx tsx scripts/add-commercial-maintenance-service.ts`.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { getServiceBySlug, createService } from "../src/lib/db/services";
import { getLocations } from "../src/lib/db/locations";
import {
  getLocationServiceContentByKeys,
  upsertLocationServiceContent,
} from "../src/lib/db/locationServiceContent";
import type { Service, LocationServiceContent } from "../src/data/site";

config({ path: ".env.local" });

const SLUG = "commercial-planned-maintenance";

const SERVICE: Service = {
  slug: SLUG,
  title: "Commercial Planned Maintenance",
  shortName: "Commercial Maintenance",
  description:
    "Scheduled commercial maintenance across your sites, so repairs are planned in advance instead of arriving as emergencies.",
  image: "/images/services-glimpse/supermarket.jpg",
  formCategory: "commercial",
  highlights: [
    "Scheduled inspections across all your commercial sites",
    "Planned work instead of reactive, emergency call-outs",
    "Covers heating, electrical and general building maintenance",
    "One in-house team, one point of contact across every site",
  ],
  metaTitle: "Commercial Planned Maintenance | Scheduled Upkeep",
  metaDescription:
    "Scheduled commercial maintenance across your sites from Greentek's in-house team, so repairs are planned in advance instead of arriving as emergencies.",
  content: [
    { type: "heading", text: "Planned maintenance instead of emergency call-outs" },
    {
      type: "paragraph",
      text: "Reactive maintenance is expensive maintenance — a boiler that fails in December costs more to fix urgently than the same repair scheduled in September. Our commercial planned maintenance service covers heating, electrical and general building upkeep across your sites on a set schedule, catching issues before they become closures.",
    },
    {
      type: "paragraph",
      text: "Because the same in-house team also handles solar, heat pump and renovation work, a planned maintenance contract is a natural point to flag where a site's heating or insulation is due an upgrade rather than another repair.",
    },
    {
      type: "list",
      items: [
        "Scheduled inspections across all your commercial sites",
        "Planned work instead of reactive, emergency call-outs",
        "Covers heating, electrical and general building maintenance",
        "One in-house team, one point of contact across every site",
      ],
    },
  ],
};

const COMBO_INTROS: Record<string, string> = {
  "solihull-birmingham":
    "As Greentek's home base since 2020, Solihull and the wider Birmingham metro area get same-week surveys and the fastest turnaround anywhere we cover. For commercial maintenance, that means our own team carrying out scheduled inspections and upkeep across your sites, with no travel delay to book a visit.",
  wolverhampton:
    "Our in-house crews are in Wolverhampton and the Black Country regularly, with no subcontractors passed the job between visits. For commercial maintenance specifically, that means one team handling scheduled heating, electrical and general building upkeep across all your sites.",
  coventry:
    "Our team handles commercial maintenance by carrying out scheduled inspections and upkeep across your sites, catching issues before they cause a closure. Businesses across Coventry and Warwickshire get that work backed by the same written warranty as every other Greentek job.",
  dudley:
    "From Dudley through the wider Black Country, commercial maintenance work runs on a clear fixed-price quote and one accountable team, carrying out scheduled inspections and upkeep across your sites before small issues become closures.",
  cardiff:
    "In Cardiff and the surrounding South Wales area, commercial maintenance is handled by the same in-house team that covers our West Midlands jobs — scheduled heating, electrical and building upkeep across your sites, not reactive call-outs.",
  swansea:
    "Along the Swansea coastline, the same fixed-price, in-house approach applies to commercial maintenance: scheduled inspections and upkeep across your sites, catching issues early, with no local subcontractor markup.",
};

async function run() {
  await getDb();

  const existing = await getServiceBySlug(SLUG);
  if (existing) {
    console.log(`Service "${SLUG}" already exists — skipping creation.`);
  } else {
    await createService(SERVICE);
    console.log(`Created service: ${SLUG}`);
  }

  const locations = await getLocations();
  for (const location of locations) {
    const intro = COMBO_INTROS[location.slug];
    if (!intro) {
      console.log(`  no intro drafted for location "${location.slug}", skipping combo`);
      continue;
    }
    const existingCombo = await getLocationServiceContentByKeys(location.slug, SLUG);
    if (existingCombo) {
      console.log(`  combo "${location.slug}/${SLUG}" already has an intro, skipped`);
      continue;
    }
    const entry: LocationServiceContent = { locationSlug: location.slug, serviceSlug: SLUG, intro };
    await upsertLocationServiceContent(entry);
    console.log(`  seeded combo intro: ${location.slug}/${SLUG}`);
  }
}

run()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
