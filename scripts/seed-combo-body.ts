/**
 * Long-form body copy for the 66 location + service pages.
 *
 * Why these pages need their own: a service page carries four or five body
 * blocks, while every location + service page rendered none — the service's
 * body is deliberately never repeated there (the same text on seven URLs),
 * so those pages were a hero, some shared sections and an FAQ. Thin, and
 * visibly shorter than the service page they compete with.
 *
 * Same approach as the combo FAQs in seed-service-seo-content.ts: not a town
 * name swapped into one template, but each service's own angle crossed with
 * what genuinely differs per area — the housing stock, England vs Wales
 * rules, home base or not, the towns around it — plus links to the related
 * services *in the same area*, which is internal linking the templated
 * default never had.
 *
 * DRY RUN BY DEFAULT — prints a sample and changes nothing.
 *   pnpm seed:combo-body            # preview
 *   pnpm seed:combo-body --write    # save
 *
 * Only fills a page whose body is empty: anything written in the panel
 * (Locations → Service content → Body copy) is never touched, and once this
 * has run every body is editable there. Claims stay as conservative as the
 * FAQ seed: no prices, grant amounts or certifications Greentek hasn't
 * published.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "../src/lib/db/mongodb";
import { getServices } from "../src/lib/db/services";
import { getLocations } from "../src/lib/db/locations";
import { getAllLocationServiceContent } from "../src/lib/db/locationServiceContent";
import { sanitizeRichText } from "../src/lib/richText";
import type { ContentBlock } from "../src/data/content";
import { listOf, toArea, type Area } from "./lib/areas";

const WRITE = process.argv.includes("--write");

interface LocalBody {
  /** Lowercase, reads after "our": "solar panel installation". */
  work: string;
  /** Why this service looks different on this area's buildings. */
  context: (a: Area) => string;
  surveyHeading?: string;
  /** What the survey for this service actually looks at. */
  survey: string;
  /** Planning / Building Regulations as they apply to this work here. */
  rules: (a: Area) => string;
  /** Related services, linked to their page in the same area. */
  pairs: [slug: string, why: string][];
}

const BODY: Record<string, LocalBody> = {
  "solar-pv-installations": {
    work: "solar panel installation",
    context: (a) =>
      `${a.housing}. For solar, the age of the house matters far less than the roof: its direction, pitch and any shading from neighbouring buildings or trees decide how many panels are worth fitting${a.wales ? ", and on exposed sites how the fixings are specified" : ""}.`,
    survey:
      "We look at the roof's orientation, pitch and shading, check the structure and tiles, and go through a year of your electricity bills, so the system is sized to what you actually use, with or without a battery.",
    rules: (a) =>
      `Roof-mounted panels on most ${a.name} homes fall under permitted development. Listed buildings, conservation areas and flat-roof installations have tighter rules${a.wales ? ", and the Welsh rules aren't identical to England's" : ""}, so we check your address before quoting.`,
    pairs: [
      ["air-source-heat-pump-installations", "solar generation can cover part of a heat pump's daytime running"],
      ["loft-insulation", "cutting heat loss first makes every other upgrade go further"],
    ],
  },
  "air-source-heat-pump-installations": {
    work: "air source heat pump installation",
    context: (a) =>
      `${a.housing}. Older solid-wall and early cavity-wall homes can run a heat pump well, but they usually need more attention to radiator sizes and insulation than a newer build, which is why the design for a ${a.name} home starts from a room-by-room heat loss calculation, not its floor area.`,
    survey:
      "We calculate heat loss room by room, check every radiator against the lower flow temperatures a heat pump runs at, and find a place for the outdoor unit and the hot water cylinder.",
    rules: (a) =>
      a.wales
        ? `Many air source heat pumps in Wales are permitted development, but the conditions aren't identical to England's, so we check what applies to your ${a.name} address, including where the outdoor unit can sit, before quoting.`
        : `Most air source heat pumps in ${a.name} are permitted development, subject to conditions on the unit's size, siting and noise. Listed buildings and conservation areas need more care, and we check your address before quoting.`,
    pairs: [
      ["loft-insulation", "a lower heat loss means a smaller unit that costs less to run"],
      ["external-wall-insulation-rendering", "the biggest single cut in heat loss for a solid-wall home"],
      ["solar-pv-installations", "daytime generation offsets part of the heat pump's electricity"],
    ],
  },
  "heating-system-upgrades": {
    work: "heating system upgrade",
    context: (a) =>
      `${a.housing}. In homes like these the boiler is rarely the only problem: pipework extended over decades, radiators sized before an extension was built, and controls that heat every room the same. An upgrade looks at the whole system so a new boiler isn't let down by the rest of it.`,
    survey:
      "Our Gas Safe engineers check the boiler, flue position, pipework and every radiator, and work out whether a combi, system or conventional boiler suits how much hot water the household uses.",
    rules: (a) =>
      `A like-for-like boiler replacement in ${a.name} doesn't need planning permission, but it must be notified under Building Regulations${a.wales ? " in Wales" : ""}, which a registered Gas Safe engineer does for you. Moving the boiler or its flue can bring in extra rules, and we flag that at survey.`,
    pairs: [
      ["loft-insulation", "a better-insulated home can run on a smaller boiler"],
      ["air-source-heat-pump-installations", "if you're weighing up a heat pump instead of a new boiler"],
    ],
  },
  "loft-insulation": {
    work: "loft insulation",
    context: (a) =>
      `${a.housing}. Many of those lofts still have the thin layer fitted decades ago, or insulation that's been flattened under storage boards, and topping it up is one of the quickest ways to cut the heat lost through the roof.`,
    survey:
      "We check the depth and condition of what's there, ventilation at the eaves, any sign of damp or condensation, and whether storage boarding needs raising so it doesn't squash the new insulation.",
    rules: (a) =>
      `Loft insulation doesn't need planning permission in ${a.name}. What matters is keeping the loft ventilated so the roof timbers stay dry${a.wales ? ", which counts for more on exposed Welsh sites" : ""}, and we check that before anything is laid.`,
    pairs: [
      ["heating-system-upgrades", "less heat lost means the heating works less hard"],
      ["loft-conversions", "if you plan to use the space, the insulation goes in the roof slope instead"],
    ],
  },
  "external-wall-insulation-rendering": {
    work: "external wall insulation",
    context: (a) =>
      `${a.housing}. Solid walls lose far more heat than filled cavity walls, and cavity fill isn't an option for them. External wall insulation wraps the outside of the house and finishes it in render, which renews the look of the property${a.wales ? " and adds a weatherproof layer against wind-driven rain" : " at the same time"}.`,
    survey:
      "We confirm the wall construction, check for damp, and plan the details around windows, sills, downpipes, meters and the roof line, which are where external insulation succeeds or fails.",
    rules: (a) =>
      `External wall insulation changes the outside of the building, so it can need planning permission, particularly in a conservation area or on the front of the property. ${a.wales ? "Welsh planning rules differ from England's in places, so we" : "We"} check what applies to your ${a.name} address, and the work is notified under Building Regulations.`,
    pairs: [
      ["air-source-heat-pump-installations", "a well-insulated solid-wall home is what lets a heat pump run efficiently"],
      ["loft-insulation", "the roof is the other big source of heat loss"],
    ],
  },
  "loft-conversions": {
    work: "loft conversion",
    context: (a) =>
      `${a.housing}. Whether a loft suits a Velux, dormer or hip-to-gable conversion comes down to head height, roof pitch and the shape of the roof, and that varies street by street across ${a.name} with the age and style of the house.`,
    survey:
      "We measure head height at the ridge, check the roof structure and joists, and work out where the staircase can go without taking too much from the floor below.",
    rules: (a) =>
      `Many loft conversions in ${a.name} fall under permitted development, within limits on added volume and where the dormer sits. Every conversion needs Building Regulations approval for structure, fire escape and insulation. ${a.wales ? "Wales sets its own permitted development limits, so" : "Conservation areas and some roof alterations need full planning, so"} we confirm the route for your house before quoting.`,
    pairs: [
      ["solar-pv-installations", "a new roof slope is the best time to plan panels"],
      ["heating-system-upgrades", "a new room needs the heating to reach it"],
    ],
  },
  "kitchen-renovations": {
    work: "kitchen renovation",
    context: (a) =>
      `${a.housing}. In many of those homes the kitchen was never designed for how it's used now: a narrow galley, a wall between kitchen and dining room, or services in the wrong place. A renovation is often the time to change the layout, not just the units.`,
    survey:
      "We measure up, trace where water, waste, gas and electrics run, and check whether any wall you want removed is load-bearing before anything is designed.",
    rules: (a) =>
      `Replacing a kitchen in ${a.name} doesn't need planning permission, but new electrical circuits, moved drainage and removing a load-bearing wall fall under Building Regulations${a.wales ? " in Wales" : ""}, and we build that into the plan.`,
    pairs: [
      ["single-storey-extension", "to add space rather than rearrange it"],
      ["heating-system-upgrades", "when the boiler lives in the kitchen being replaced"],
    ],
  },
  "single-storey-extension": {
    work: "single storey extension",
    context: (a) =>
      `${a.housing}. Plenty of them have room at the back or side for a single storey extension, and the right design depends on the plot, the neighbours and how the new room joins the existing house.`,
    survey:
      "We look at the plot, drainage runs, access for materials and how the new room connects to the house, then plan the structure and the finish together.",
    rules: (a) =>
      a.wales
        ? `Wales has its own permitted development limits for rear and side extensions. Larger schemes need planning permission, and every extension needs Building Regulations approval, so we confirm the route for your ${a.name} home before quoting.`
        : `Many single storey rear extensions in ${a.name} are permitted development, within limits on depth and height, and larger ones can go through prior approval or full planning. Every extension needs Building Regulations approval, and we confirm the route before quoting.`,
    pairs: [
      ["kitchen-renovations", "most extensions are built to make room for a bigger kitchen"],
      ["heating-system-upgrades", "the existing system has to heat the extra space"],
    ],
  },
  "living-room-improvements": {
    work: "living room improvement",
    context: (a) =>
      `${a.housing}. In older houses the living room often has a blocked-up fireplace, too few sockets, cold external walls or a layout split by a wall that no longer earns its place, so the work is planned around how you actually use the room.`,
    survey:
      "We look at the walls, floor, electrics and heating in the room, and any wall you'd like opened up, then plan the work in the order the trades need it.",
    rules: (a) =>
      `Most living room work in ${a.name} needs no planning permission. Opening up a structural wall and adding electrical circuits come under Building Regulations${a.wales ? " in Wales" : ""}, and we build that into the plan.`,
    pairs: [
      ["full-home-renovation", "when the living room is one of several rooms due for work"],
      ["heating-system-upgrades", "cold rooms are often a radiator problem, not an insulation one"],
    ],
  },
  "full-home-renovation": {
    work: "full home renovation",
    context: (a) =>
      `${a.housing}. Many come up for a full renovation after years of piecemeal work: a rewire, a new heating system, damp to treat and every room to finish. Doing it as one programme in ${a.name} puts each trade in the right order, so nothing finished has to be pulled apart again.`,
    survey:
      "We go through the whole property, from structure, damp and roof to wiring, plumbing and heating, and set out a phased plan with a fixed price for the agreed scope.",
    rules: (a) =>
      `Depending on the scope, a renovation in ${a.name} can involve Building Regulations for structural, electrical and drainage work, and planning or listed building consent for external changes. We work out what applies${a.wales ? " under the Welsh rules" : ""} before quoting.`,
    pairs: [
      ["external-wall-insulation-rendering", "the one time scaffolding is already up and the walls are open"],
      ["heating-system-upgrades", "a renovation is when pipework can be rerouted properly"],
      ["kitchen-renovations", "usually the biggest single room in the programme"],
    ],
  },
  "commercial-planned-maintenance": {
    work: "commercial planned maintenance",
    context: (a) =>
      `Commercial sites in and around ${a.name} range from offices and shops to warehouses and multi-unit premises, each with its own mix of heating, electrical and building fabric to keep on top of. A planned schedule catches the small faults before they turn into a closure.`,
    surveyHeading: "What the site visit covers",
    survey:
      "We walk the site, list the assets and systems that need servicing, and agree a schedule of visits that fits your opening hours rather than interrupting trade.",
    rules: (a) =>
      `A planned schedule keeps statutory checks for your ${a.name} site, such as gas safety and electrical inspection, on a predictable timetable, with a record of every visit ready for your landlord, insurer or auditor.`,
    pairs: [
      ["heating-system-upgrades", "when servicing shows a system is due for replacement"],
      ["solar-pv-installations", "daytime-heavy businesses often suit solar well"],
    ],
  },
};

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildBody(
  area: Area,
  serviceSlug: string,
  serviceTitle: string,
  spec: LocalBody,
  shortNameBySlug: Map<string, string>,
): ContentBlock[] {
  const pairs = spec.pairs.filter(([slug]) => shortNameBySlug.has(slug));
  const towns = listOf(area.nearby);

  const blocks: ContentBlock[] = [
    { type: "heading", text: `${capitalise(spec.work)} in ${area.name}` },
    { type: "paragraph", text: spec.context(area) },
    { type: "heading", level: 3, text: spec.surveyHeading ?? "What the survey checks" },
    { type: "paragraph", text: `${spec.survey} ${area.response}` },
    { type: "heading", level: 3, text: `Planning and building rules in ${area.name}` },
    { type: "paragraph", text: spec.rules(area) },
  ];

  if (pairs.length) {
    blocks.push(
      { type: "heading", level: 3, text: `Often done alongside ${spec.work} in ${area.name}` },
      {
        type: "list",
        items: pairs.map(
          ([slug, why]) =>
            `<a href="/locations/${area.slug}/${slug}">${shortNameBySlug.get(slug)} in ${area.name}</a> — ${why}`,
        ),
      },
    );
  }

  blocks.push({
    type: "paragraph",
    text: `Beyond ${area.name}, the same in-house team carries out ${spec.work} in ${towns}. For how we approach the work anywhere, see our <a href="/services/${serviceSlug}">${serviceTitle}</a> page.`,
  });

  // As a panel save would: every rich-text field is sanitized on write.
  return blocks.map((b) => ({
    ...b,
    ...(b.text ? { text: sanitizeRichText(b.text) } : {}),
    ...(b.items ? { items: b.items.map(sanitizeRichText) } : {}),
  }));
}

async function run() {
  const db = await getDb();
  const [services, locations, combos] = await Promise.all([
    getServices(),
    getLocations(),
    getAllLocationServiceContent(),
  ]);
  const comboByKey = new Map(combos.map((c) => [`${c.locationSlug}__${c.serviceSlug}`, c]));
  const shortNameBySlug = new Map(services.map((s) => [s.slug, s.shortName]));
  const areas = locations.map(toArea);

  let written = 0;
  const skipped: string[] = [];
  let sample: { path: string; blocks: ContentBlock[] } | null = null;

  for (const service of services) {
    const spec = BODY[service.slug];
    if (!spec) {
      skipped.push(`service ${service.slug}: no body written for it`);
      continue;
    }
    for (const area of areas) {
      const key = `${area.slug}__${service.slug}`;
      if (comboByKey.get(key)?.content?.length) {
        skipped.push(`combo ${key}: body already set`);
        continue;
      }
      const blocks = buildBody(area, service.slug, service.title, spec, shortNameBySlug);
      sample ??= { path: `/locations/${area.slug}/${service.slug}`, blocks };
      written++;
      if (WRITE) {
        await db.collection("locationServiceContent").updateOne(
          { _id: key } as never,
          {
            $set: { content: blocks },
            $setOnInsert: { locationSlug: area.slug, serviceSlug: service.slug },
          },
          { upsert: true },
        );
      }
    }
  }

  console.log(WRITE ? "WROTE:" : "DRY RUN — nothing written. Would write:");
  console.log(`  location+service bodies  ${written}`);
  if (skipped.length) console.log(`  left alone:\n    ${skipped.join("\n    ")}`);

  if (!WRITE && sample) {
    console.log(`\nSample — ${sample.path}:`);
    for (const b of sample.blocks) {
      if (b.type === "heading") console.log(`\n  ${b.level === 3 ? "###" : "##"} ${b.text}`);
      else if (b.type === "list") for (const i of b.items ?? []) console.log(`  - ${i}`);
      else console.log(`  ${b.text}`);
    }
    console.log("\nRun again with --write to save.");
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
