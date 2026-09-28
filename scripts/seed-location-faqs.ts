/**
 * FAQs for the six location pages, which had none — the one section every
 * service and location + service page carries and the area hubs didn't.
 *
 * Built the same way as the combo FAQs in seed-service-seo-content.ts: from
 * what genuinely differs per area (the towns around it, England or Wales,
 * home base or not, the housing stock), and linking to that area's own
 * location + service pages rather than the generic service pages.
 *
 * DRY RUN BY DEFAULT — prints a sample and changes nothing.
 *   pnpm seed:location-faqs            # preview
 *   pnpm seed:location-faqs --write    # save
 *
 * Only fills a location with no FAQs: anything written in the panel
 * (Locations → Edit details → FAQs) is never touched.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getServices } from "../src/lib/db/services";
import { getLocations, updateLocation } from "../src/lib/db/locations";
import { sanitizeRichText } from "../src/lib/richText";
import type { FaqItem } from "../src/data/pages";
import { listOf, planningNote, toArea, type Area } from "./lib/areas";

const WRITE = process.argv.includes("--write");

function faqsFor(area: Area, link: (serviceSlug: string, text: string) => string): FaqItem[] {
  return [
    {
      question: `Which areas around ${area.name} do you cover?`,
      answer: `As well as ${area.name} itself, our in-house team covers ${listOf(area.nearby)}, and the wider ${area.region} area. Every job gets the same free survey, fixed-price quote and written workmanship warranty, wherever it is.`,
    },
    {
      question: `How quickly can you survey a property in ${area.name}?`,
      answer: `We reply to every enquiry within one business day to arrange a survey. ${area.response}`,
    },
    {
      question: `What work do you do in ${area.name}?`,
      answer: `Energy upgrades such as ${link("solar-pv-installations", "solar panels")}, ${link("air-source-heat-pump-installations", "air source heat pumps")}, ${link("heating-system-upgrades", "heating upgrades")} and ${link("external-wall-insulation-rendering", "external wall insulation")}, and building work including ${link("loft-conversions", "loft conversions")}, ${link("single-storey-extension", "extensions")}, ${link("kitchen-renovations", "kitchens")} and ${link("full-home-renovation", "full renovations")}.`,
    },
    {
      question: `Do you use local subcontractors in ${area.name}?`,
      answer: `No. The same in-house team surveys, quotes and carries out the work in ${area.name}, so there's no chain of subcontractors passing the job between them, and one team is responsible for the result.`,
    },
    {
      question: `What kind of homes do you work on in ${area.name}?`,
      answer: `All kinds. ${area.housing}, and the age and construction of a house changes what an upgrade involves, from the insulation it needs to how a heat pump is sized. That's why every quote follows a survey of the property itself.`,
    },
    {
      question: `Do I need planning permission for work in ${area.name}?`,
      answer: `It depends on the work. Most energy upgrades and many extensions and loft conversions are permitted development, while structural, electrical and drainage work comes under Building Regulations. ${planningNote(area)}`,
    },
    {
      question: `Can I spread the cost of work in ${area.name}?`,
      answer: `Yes. We offer <a href="/finance">finance options</a> through Ideal4Finance, subject to status, including interest-free options over shorter terms.`,
    },
  ];
}

async function run() {
  const [services, locations] = await Promise.all([getServices(), getLocations()]);
  const serviceSlugs = new Set(services.map((s) => s.slug));

  let written = 0;
  const skipped: string[] = [];
  let sample: { slug: string; faqs: FaqItem[] } | null = null;

  for (const location of locations) {
    if (location.faqs?.length) {
      skipped.push(`${location.slug}: FAQs already set`);
      continue;
    }
    const area = toArea(location);
    // A service that's been removed or renamed gets plain text, not a 404 link.
    const link = (slug: string, text: string) =>
      serviceSlugs.has(slug) ? `<a href="/locations/${area.slug}/${slug}">${text}</a>` : text;
    const faqs = faqsFor(area, link).map((f) => ({
      question: f.question.trim(),
      answer: sanitizeRichText(f.answer),
    }));
    sample ??= { slug: location.slug, faqs };
    written++;
    if (WRITE) await updateLocation(location.slug, { faqs });
  }

  console.log(WRITE ? "WROTE:" : "DRY RUN — nothing written. Would write:");
  console.log(`  location FAQ sets  ${written}`);
  if (skipped.length) console.log(`  left alone:\n    ${skipped.join("\n    ")}`);

  if (!WRITE && sample) {
    console.log(`\nSample — /locations/${sample.slug}:`);
    for (const f of sample.faqs) console.log(`  Q: ${f.question}\n  A: ${f.answer}\n`);
    console.log("Run again with --write to save.");
  } else if (WRITE) {
    console.log("\nUse 'Refresh live site' on the dashboard, or redeploy, so the pages rebuild.");
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
