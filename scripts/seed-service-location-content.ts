/**
 * One-time content seed for the SEO/long-form content added to Service and
 * Location pages, plus the location×service combination pages. This is a
 * first-pass DRAFT — every field here is editable afterwards via /admin
 * (Services, Locations, and each location's "Service content" page), so
 * treat this script as a starting point, not a final version.
 *
 * Idempotent: only ever fills in fields that are currently empty/missing —
 * never overwrites a value an admin has already set (in this script or via
 * the CMS). Safe to re-run. Run via `npm run seed:service-location-content`.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { getServiceBySlug, updateService } from "../src/lib/db/services";
import { getLocationBySlug, updateLocation } from "../src/lib/db/locations";
import {
  getLocationServiceContentByKeys,
  upsertLocationServiceContent,
} from "../src/lib/db/locationServiceContent";
import type { ContentBlock } from "../src/data/content";

config({ path: ".env.local" });

// ---------------------------------------------------------------------------
// Services: metaTitle / metaDescription / long-form content blocks
// ---------------------------------------------------------------------------

interface ServiceSeed {
  /** Matches the live Service.shortName in the DB — used to compose combo intros the way the page's own headings phrase the service name. */
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  content: ContentBlock[];
  /** Lowercase clause describing what the service involves, used to compose unique location×service intros below. No leading capital, no trailing period. */
  angle: string;
}

const SERVICE_SEED: Record<string, ServiceSeed> = {
  "solar-pv-installations": {
    shortName: "Solar PV",
    metaTitle: "Solar PV Installation | AIKO, JinkoSolar & Trinasolar",
    metaDescription:
      "Solar PV systems with battery storage, installed across the West Midlands and Wales. AIKO, JinkoSolar and Trinasolar panels, Growatt/SolaX inverters, free survey.",
    angle:
      "installing solar PV using panels from AIKO, JinkoSolar and Trinasolar, paired with Growatt or SolaX inverters and battery storage",
    content: [
      { type: "heading", text: "What's involved in a Greentek solar PV installation" },
      {
        type: "paragraph",
        text: "A solar PV installation starts with a free site survey to check your roof's orientation, shading and structural condition, followed by a system design sized to your household's actual electricity use rather than a generic package. We install high-efficiency panels from AIKO, JinkoSolar and Trinasolar, paired with Growatt or SolaX inverters and, where it makes sense, battery storage so the electricity you generate during the day is still available after dark.",
      },
      {
        type: "paragraph",
        text: "Because solar, heating and insulation all sit under the same in-house team, a solar quote is also a natural point to check whether an EPC rating improvement, battery storage or a heat pump pairing would bring your running costs down further, without bringing in a second contractor to coordinate.",
      },
      {
        type: "list",
        items: [
          "Free, no-obligation site survey and system design",
          "MCS-certified installers and equipment",
          "Battery storage options to use solar power after dark",
          "Can improve your property's EPC rating",
        ],
      },
    ],
  },
  "air-source-heat-pump-installations": {
    shortName: "Air Source Heat Pumps",
    metaTitle: "Air Source Heat Pump Installation | Vaillant & Ideal Heating",
    metaDescription:
      "Gas Safe accredited air source heat pump installation for homes and businesses. Vaillant and Ideal Heating systems, often paired with insulation upgrades.",
    angle:
      "fitting Vaillant and Ideal Heating air source heat pumps through our Gas Safe accredited engineers, often paired with insulation upgrades for extra efficiency",
    content: [
      { type: "heading", text: "Switching to an air source heat pump" },
      {
        type: "paragraph",
        text: "An air source heat pump draws heat from the outside air and uses it to run your heating and hot water, cutting reliance on gas or oil. Our Gas Safe accredited team installs Vaillant and Ideal Heating systems sized to your property, and will flag upfront if your radiators, pipework or insulation need attention first so the system runs at the efficiency it's designed for.",
      },
      {
        type: "paragraph",
        text: "Because we also handle insulation and general heating work, a heat pump installation can be paired with loft or external wall insulation in the same programme of work, the pairing that makes the biggest difference to how much a heat pump actually saves you.",
      },
      {
        type: "list",
        items: [
          "Low-carbon heating for residential and commercial properties",
          "Installed by our Gas Safe and in-house accredited team",
          "Vaillant and Ideal Heating equipment options",
          "Can be paired with insulation upgrades for greater efficiency",
        ],
      },
    ],
  },
  "heating-system-upgrades": {
    shortName: "Heating Upgrades",
    metaTitle: "Heating System Upgrades | Boilers, Radiators & Controls",
    metaDescription:
      "Complete heating upgrades: boiler replacement, radiators, pipework and controls. Worcester Bosch and Ideal Heating equipment, fitted by Gas Safe engineers.",
    angle:
      "replacing boilers, radiators, pipework and heating controls with Worcester Bosch and Ideal Heating equipment, fitted by Gas Safe engineers",
    content: [
      { type: "heading", text: "A heating system upgrade, not just a new boiler" },
      {
        type: "paragraph",
        text: "A heating upgrade with Greentek covers more than swapping the boiler, our Gas Safe engineers also assess radiators, pipework and controls, since an oversized or undersized radiator is one of the most common reasons a room never quite heats up even with a new boiler fitted. We fit Worcester Bosch and Ideal Heating equipment and size the system to the property, not a one-size-fits-all package.",
      },
      {
        type: "paragraph",
        text: "Every installation comes with a written warranty, and because the same team handles insulation work too, we'll flag if a fabric upgrade would let a smaller, cheaper-to-run system do the job just as well.",
      },
      {
        type: "list",
        items: [
          "Boiler installation and replacement by Gas Safe engineers",
          "Full radiator, pipework and heating control upgrades",
          "Worcester Bosch and Ideal Heating equipment options",
          "Written warranty on every completed installation",
        ],
      },
    ],
  },
  "loft-insulation": {
    shortName: "Loft Insulation",
    metaTitle: "Loft Insulation Installation | Fast, Fixed-Price",
    metaDescription:
      "Professional loft insulation to cut heat loss and lower energy bills. Fitted by our in-house team, usually completed in a single visit.",
    angle:
      "fitting loft insulation to cut heat loss through the roof, one of the fastest and cheapest measures we offer",
    content: [
      { type: "heading", text: "Why loft insulation is usually the first job worth doing" },
      {
        type: "paragraph",
        text: "Heat rises, and an under-insulated loft is one of the fastest ways a property loses the heat it's already paying for. Topping up or replacing loft insulation is typically the cheapest, quickest measure on our list, most jobs are completed by our in-house team in a single visit, with no disruption to the rest of the house.",
      },
      {
        type: "paragraph",
        text: "It's also the measure we recommend checking first before quoting a heat pump or heating system upgrade, since a well-insulated loft lets a smaller, cheaper-to-run heating system do the same job.",
      },
      {
        type: "list",
        items: [
          "Reduces heat loss through the roof",
          "Helps lower energy bills and heating demand",
          "Improves year-round comfort in the home",
          "Fitted by our in-house installation team",
        ],
      },
    ],
  },
  "external-wall-insulation-rendering": {
    shortName: "External Wall Insulation",
    metaTitle: "External Wall Insulation & Rendering | EWI Specialists",
    metaDescription:
      "External wall insulation and rendering to improve thermal performance and refresh your home's exterior. Suited to older, traditionally-built properties.",
    angle:
      "wrapping external walls in insulation and rendering to improve thermal performance and refresh the exterior, particularly suited to older, traditionally-built homes",
    content: [
      { type: "heading", text: "External wall insulation for solid-wall and older properties" },
      {
        type: "paragraph",
        text: "Properties built without a cavity wall, common in older housing stock across the West Midlands and Wales, lose a disproportionate amount of heat through solid external walls. External wall insulation wraps the outside of the property in an insulating layer, finished with a new render, which improves thermal performance and gives the property a refreshed, modern exterior at the same time.",
      },
      {
        type: "paragraph",
        text: "Because the render is also a weatherproofing layer, the work protects the walls from damp and general weathering as well as cutting heat loss, which is why it's often the highest-impact measure for solid-wall homes specifically.",
      },
      {
        type: "list",
        items: [
          "Improves thermal performance of external walls",
          "Protects the property from weather and damp",
          "Refreshes and modernises the exterior appearance",
          "Suited to older and traditionally-built properties",
        ],
      },
    ],
  },
  "loft-conversions": {
    shortName: "Loft Conversions",
    metaTitle: "Loft Conversions | Design to Completion",
    metaDescription:
      "Loft conversions that turn dead roof space into a bedroom or office, managed from design and building control through to final finishing.",
    angle:
      "converting loft space into usable rooms, managed from design through building control to final finishing, without extending the property's footprint",
    content: [
      { type: "heading", text: "Turning roof space into a room that gets used" },
      {
        type: "paragraph",
        text: "A loft conversion adds a genuinely usable room, a bedroom, office or bathroom, without extending the property's footprint, which is why it's often the most space-efficient way to add value to a home. We manage the project from initial design and building control sign-off through structural work, insulation, and final finishing.",
      },
      {
        type: "paragraph",
        text: "Because the same in-house team handles the structural, electrical and finishing trades, there's a single point of contact for the whole conversion rather than a chain of separate contractors to coordinate.",
      },
      {
        type: "list",
        items: [
          "Maximises existing space without extending the footprint",
          "Managed from design through to final finishing",
          "Can add valuable living space and property value",
          "One in-house team from start to finish",
        ],
      },
    ],
  },
  "kitchen-renovations": {
    shortName: "Kitchen Renovations",
    metaTitle: "Kitchen Renovations | Full Refit, In-House Team",
    metaDescription:
      "Complete kitchen refurbishment from design through installation and finishing, layout, cabinetry, electrics and plumbing under one team.",
    angle:
      "stripping out and rebuilding kitchens end to end, layout, cabinetry, worktops, electrics and plumbing, under one in-house team",
    content: [
      { type: "heading", text: "A kitchen refit handled by one team, not three trades" },
      {
        type: "paragraph",
        text: "A kitchen renovation touches more trades than almost any other room, layout and cabinetry, worktops, electrics for appliances and lighting, and plumbing for the sink and any relocated pipework. We run all of it in-house rather than subcontracting each trade separately, which is usually where kitchen projects run over on time or budget.",
      },
      {
        type: "paragraph",
        text: "You get a clear, fixed-price quote before work starts covering every trade involved, so there's no separate invoice from an electrician or plumber arriving after the fact.",
      },
      {
        type: "list",
        items: [
          "Full kitchen refurbishment from design to final finishing",
          "Layout, cabinetry, worktops and appliance coordination",
          "Electrical and plumbing work carried out in-house",
          "Clear, fixed-price quote before work begins",
        ],
      },
    ],
  },
  "single-storey-extension": {
    shortName: "Single Storey Extensions",
    metaTitle: "Single Storey Extensions | Design to Build",
    metaDescription:
      "Single storey extensions delivered from design and planning through construction and finishing, adding space and value to your home.",
    angle:
      "delivering single storey extensions from planning drawings through construction to final finishing",
    content: [
      { type: "heading", text: "Extending a property without the usual coordination headache" },
      {
        type: "paragraph",
        text: "A single storey extension is managed end to end, initial drawings and planning, building control, groundworks, structural build, and final finishing, by one in-house team rather than a general contractor bringing in separate subcontractors for each stage.",
      },
      {
        type: "paragraph",
        text: "Because we also handle insulation and heating work, an extension is a natural point to make sure the new space is properly insulated and that the existing heating system can actually cope with the extra floor area, rather than treating it as an afterthought once the walls are up.",
      },
      {
        type: "list",
        items: [
          "Adds valuable living space to your property",
          "Managed from design and planning through to completion",
          "One in-house team, no subcontractors passing the job around",
          "Written warranty on completion",
        ],
      },
    ],
  },
  "living-room-improvements": {
    shortName: "Living Room Improvements",
    metaTitle: "Living Room Renovations | Media Walls & Finishes",
    metaDescription:
      "Living room renovations with custom media walls, ambient lighting and high-quality finishes, delivered by our in-house renovation team.",
    angle:
      "reconfiguring living rooms with custom media walls, ambient lighting and high-quality finishes throughout",
    content: [
      { type: "heading", text: "Reworking the room the household actually spends its evenings in" },
      {
        type: "paragraph",
        text: "Living room improvements typically combine a layout reconfiguration with a custom media wall, updated lighting and a full replaster and finish, the room gets used every day, so the finish quality matters more here than almost anywhere else in the house.",
      },
      {
        type: "paragraph",
        text: "We handle the design, the electrics for lighting and any built-in AV points, and the finishing trades as one project, so the media wall, the lighting plan and the plastering are all specified to work together rather than being bolted on separately.",
      },
      {
        type: "list",
        items: [
          "Contemporary design tailored to your living space",
          "Custom media walls and ambient lighting",
          "High-quality finishes throughout",
          "Delivered by our in-house renovation team",
        ],
      },
    ],
  },
  "full-home-renovation": {
    shortName: "Full Home Renovation",
    metaTitle: "Full Home Renovation | Whole-Property Refurbishment",
    metaDescription:
      "Complete home renovation from start to finish, structural work, energy efficiency upgrades and finishing under one team and one fixed-price quote.",
    angle:
      "running whole-property renovations that combine structural work, energy efficiency upgrades and finishing under one programme and one point of contact",
    content: [
      { type: "heading", text: "A whole-property renovation under one programme" },
      {
        type: "paragraph",
        text: "A full home renovation is the project where having energy work and building work under one roof matters most, structural changes, insulation and heating upgrades, and finishing trades all need to be sequenced against each other, and a single accountable team means that sequencing is planned rather than improvised.",
      },
      {
        type: "paragraph",
        text: "You get one fixed-price quote and one honest timeline covering the whole project, from the initial survey through to handover and warranty, rather than piecing together separate quotes from an electrician, a plasterer and an energy installer and hoping the dates line up.",
      },
      {
        type: "list",
        items: [
          "Whole-property renovation from start to finish",
          "Single point of contact throughout the project",
          "Combines structural, energy efficiency and finishing work",
          "Clear, fixed-price quote and honest timeline",
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Locations: metaTitle / metaDescription / long-form content blocks
// ---------------------------------------------------------------------------

interface LocationSeed {
  metaTitle: string;
  metaDescription: string;
  content: ContentBlock[];
  /** Full sentence template used to compose unique location×service intros below. {SERVICE} and {ANGLE} are substituted. */
  introTemplate: (serviceLower: string, angle: string) => string;
}

const LOCATION_SEED: Record<string, LocationSeed> = {
  "solihull-birmingham": {
    metaTitle: "Solar, Heating & Renovation in Solihull & Birmingham",
    metaDescription:
      "Greentek's home base since 2020. Same-week surveys for solar PV, heat pumps, insulation and renovation work across Solihull and Birmingham.",
    content: [
      { type: "heading", text: "Why Solihull & Birmingham gets our fastest turnaround" },
      {
        type: "paragraph",
        text: "Solihull and the wider Birmingham metro area is where Greentek is based, which means surveys here are typically booked within the same week rather than waiting for a crew to travel in from elsewhere. It's also where our office, our warehouse stock and most of our installation teams are based day to day.",
      },
      {
        type: "paragraph",
        text: "That local presence covers the full range of what we do, solar PV and battery storage, air source heat pumps, loft and external wall insulation, and renovation work from kitchen refits through to full property refurbishments, all handled by the same in-house team you'd get anywhere else we cover.",
      },
      {
        type: "list",
        items: [
          "Home base since 2020, our office and warehouse are based here",
          "Same-week site surveys for most enquiries",
          "Full range of solar, heating, insulation and renovation services",
          "Also covering Sutton Coldfield, West Bromwich, Sandwell and Redditch",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `As Greentek's home base since 2020, Solihull and the wider Birmingham metro area get same-week surveys and the fastest turnaround anywhere we cover. For ${serviceLower}, that means our own team ${angle}, with no travel delay to book a survey.`,
  },
  wolverhampton: {
    metaTitle: "Solar, Heating & Renovation in Wolverhampton",
    metaDescription:
      "In-house solar PV, heat pump, insulation and renovation team covering Wolverhampton and the Black Country. No subcontractors, fixed-price quotes.",
    content: [
      { type: "heading", text: "Our team in Wolverhampton and the Black Country" },
      {
        type: "paragraph",
        text: "Greentek's crews are in Wolverhampton and the surrounding Black Country regularly enough that it's treated as a core part of our coverage, not a one-off trip. Every job, solar PV, an air source heat pump, insulation or a renovation, is delivered by our own in-house installers rather than being passed to a local subcontractor.",
      },
      {
        type: "paragraph",
        text: "That matters most on multi-trade jobs like a heating upgrade paired with insulation, or a renovation that touches electrics and plumbing at once, where a subcontracted chain is usually where communication breaks down.",
      },
      {
        type: "list",
        items: [
          "Regular in-house coverage of Wolverhampton and the Black Country",
          "No subcontractors, the same team surveys, quotes and installs",
          "Solar, heating, insulation and renovation all handled together",
          "Also covering Dudley, Telford, Stourbridge and Halesowen",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `Our in-house crews are in Wolverhampton and the Black Country regularly, with no subcontractors passed the job between visits. For ${serviceLower} specifically, that means ${angle}.`,
  },
  coventry: {
    metaTitle: "Solar, Heating & Renovation in Coventry",
    metaDescription:
      "Solar PV, air source heat pumps, insulation and full property renovations for homeowners across Coventry and Warwickshire, backed by a written warranty.",
    content: [
      { type: "heading", text: "Coventry and Warwickshire coverage" },
      {
        type: "paragraph",
        text: "Homeowners across Coventry and Warwickshire work with the same Greentek team that covers the rest of the West Midlands, solar PV installation, air source heat pumps, loft and external wall insulation, and renovation projects from a kitchen refit through to a full property refurbishment.",
      },
      {
        type: "paragraph",
        text: "Every job, regardless of size, is backed by a written workmanship warranty, so if something isn't right after we've left, the same team that did the work comes back to fix it.",
      },
      {
        type: "list",
        items: [
          "Solar PV, heat pumps, insulation and renovation covered",
          "Written warranty on every completed installation",
          "Free local site survey and fixed-price quote",
          "Also covering Sutton Coldfield, Redditch, Bromsgrove and Kidderminster",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `Our team handles ${serviceLower} by ${angle}. Homeowners across Coventry and Warwickshire get that work backed by the same written warranty as every other Greentek job.`,
  },
  dudley: {
    metaTitle: "Solar, Heating & Renovation in Dudley",
    metaDescription:
      "Fixed-price solar PV, heat pump, insulation and renovation work across Dudley and the Black Country, delivered by one accountable in-house team.",
    content: [
      { type: "heading", text: "Dudley and the Black Country" },
      {
        type: "paragraph",
        text: "From Dudley through the wider Black Country, Greentek delivers renewable energy installations and construction projects on a clear, fixed-price quote agreed before work starts, not an estimate that grows once the job is underway.",
      },
      {
        type: "paragraph",
        text: "One accountable team handles the survey, the quote and the installation, whether that's a solar PV system, a heat pump, an insulation upgrade or a renovation project.",
      },
      {
        type: "list",
        items: [
          "Fixed-price quotes agreed before work starts",
          "One team from survey through to completion",
          "Solar, heating, insulation and renovation services",
          "Also covering Stourbridge, Halesowen, Smethwick and Wolverhampton",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `From Dudley through the wider Black Country, ${serviceLower} work runs on a clear fixed-price quote and one accountable team, ${angle}.`,
  },
  cardiff: {
    metaTitle: "Solar, Heating & Renovation in Cardiff",
    metaDescription:
      "Solar PV, heat pump, insulation and renovation services in Cardiff and South Wales, delivered by the same in-house team covering the West Midlands.",
    content: [
      { type: "heading", text: "Bringing our West Midlands standard to Cardiff and South Wales" },
      {
        type: "paragraph",
        text: "Greentek brings the same in-house solar, heating, insulation and renovation service to Cardiff and the surrounding South Wales area that homeowners get across our West Midlands coverage, local surveys, honest fixed-price quotes, and installation by our own accredited team rather than a subcontracted local partner.",
      },
      {
        type: "paragraph",
        text: "That consistency matters most on multi-measure projects, a solar and battery storage system alongside a heat pump, for instance, where having one team sequence the work properly avoids the delays that come from coordinating separate local contractors.",
      },
      {
        type: "list",
        items: [
          "In-house team covering Cardiff and South Wales",
          "Free local survey and fixed-price quote",
          "Solar PV, heat pumps, insulation and renovation services",
          "Also covering Newport, Bridgend, Neath and Merthyr Tydfil",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `In Cardiff and the surrounding South Wales area, ${serviceLower} is handled by the same in-house team that covers our West Midlands jobs, ${angle}.`,
  },
  swansea: {
    metaTitle: "Solar, Heating & Renovation in Swansea",
    metaDescription:
      "Solar PV and heat pump installation, insulation and renovation projects for homeowners in Swansea and the surrounding coastline.",
    content: [
      { type: "heading", text: "Swansea and the surrounding coastline" },
      {
        type: "paragraph",
        text: "In Swansea and along the surrounding coastline, Greentek installs solar PV and heat pump systems and delivers insulation and renovation projects for homeowners looking to bring energy costs down, using the same fixed-price, in-house approach we run across the rest of our coverage.",
      },
      {
        type: "paragraph",
        text: "Coastal properties often carry their own considerations around exposure and older solid-wall construction, exactly the kind of detail our site survey is designed to catch before a quote is issued, not after work has started.",
      },
      {
        type: "list",
        items: [
          "Solar PV and heat pump installation for coastal properties",
          "Fixed-price quotes, no local subcontractor markup",
          "Insulation and renovation services alongside energy work",
          "Also covering Neath, Port Talbot, Bridgend and Wrexham",
        ],
      },
    ],
    introTemplate: (serviceLower, angle) =>
      `Along the Swansea coastline, the same fixed-price, in-house approach applies to ${serviceLower}: ${angle}, with no local subcontractor markup.`,
  },
};

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedServices() {
  for (const [slug, seed] of Object.entries(SERVICE_SEED)) {
    const existing = await getServiceBySlug(slug);
    if (!existing) {
      console.log(`  skip service "${slug}" — not found in DB`);
      continue;
    }
    const updates: Partial<typeof existing> = {};
    if (!existing.metaTitle) updates.metaTitle = seed.metaTitle;
    if (!existing.metaDescription) updates.metaDescription = seed.metaDescription;
    if (!existing.content || existing.content.length === 0) updates.content = seed.content;

    if (Object.keys(updates).length > 0) {
      await updateService(slug, updates);
      console.log(`  seeded service content: ${slug}`);
    } else {
      console.log(`  service "${slug}" already has content, skipped`);
    }
  }
}

async function seedLocations() {
  for (const [slug, seed] of Object.entries(LOCATION_SEED)) {
    const existing = await getLocationBySlug(slug);
    if (!existing) {
      console.log(`  skip location "${slug}" — not found in DB`);
      continue;
    }
    const updates: Partial<typeof existing> = {};
    if (!existing.metaTitle) updates.metaTitle = seed.metaTitle;
    if (!existing.metaDescription) updates.metaDescription = seed.metaDescription;
    if (!existing.content || existing.content.length === 0) updates.content = seed.content;

    if (Object.keys(updates).length > 0) {
      await updateLocation(slug, updates);
      console.log(`  seeded location content: ${slug}`);
    } else {
      console.log(`  location "${slug}" already has content, skipped`);
    }
  }
}

async function seedLocationServiceContent() {
  for (const locationSlug of Object.keys(LOCATION_SEED)) {
    for (const serviceSlug of Object.keys(SERVICE_SEED)) {
      const existing = await getLocationServiceContentByKeys(locationSlug, serviceSlug);
      if (existing) {
        console.log(`  combo "${locationSlug}/${serviceSlug}" already has an intro, skipped`);
        continue;
      }

      const service = SERVICE_SEED[serviceSlug];
      const location = LOCATION_SEED[locationSlug];
      const intro = location.introTemplate(service.shortName.toLowerCase(), service.angle);

      await upsertLocationServiceContent({ locationSlug, serviceSlug, intro });
      console.log(`  seeded combo intro: ${locationSlug}/${serviceSlug}`);
    }
  }
}

async function run() {
  await getDb();
  console.log("Seeding service content...");
  await seedServices();
  console.log("Seeding location content...");
  await seedLocations();
  console.log("Seeding location×service combo intros...");
  await seedLocationServiceContent();
}

run()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
