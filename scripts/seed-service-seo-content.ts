/**
 * SEO content for the service and location + service pages:
 *
 *   - a problem section for each service (shown on its page and every
 *     location + service page for it)
 *   - an FAQ set for each service page
 *   - an FAQ set for each of the location + service pages, where the service
 *     keyword and the place name appear together in each question
 *   - a rewritten homepage FAQ, saved as a DRAFT so it can be read in
 *     Page Content and published from there
 *
 * DRY RUN BY DEFAULT — prints what it would write and changes nothing.
 *   pnpm seed:service-seo-content            # preview
 *   pnpm seed:service-seo-content --write    # save
 *
 * Only fills what's empty: a problem section or FAQ set already written in the
 * panel is never overwritten. Every answer passes through sanitizeRichText, as
 * a panel save would.
 *
 * On the location + service FAQs: 66 hand-written sets would drift and be
 * impossible to maintain, and swapping a town name into one template is thin
 * content search engines discount. These are built instead from each service's
 * own question angles crossed with facts that genuinely differ per area —
 * home base or not, England or Wales (planning rules differ), the local
 * housing stock, and the nearby towns covered — so each set says something
 * specific about that service in that place. Any of them can be rewritten by
 * hand in the panel, and this script will then leave it alone.
 *
 * Claims are deliberately conservative: no prices, no grant amounts, no
 * certifications Greentek hasn't published. Where a scheme depends on
 * certification (the Smart Export Guarantee, the Boiler Upgrade Scheme) the
 * answer states the requirement rather than asserting Greentek meets it.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "../src/lib/db/mongodb";
import { getServices, updateService } from "../src/lib/db/services";
import { getLocations } from "../src/lib/db/locations";
import { getAllLocationServiceContent } from "../src/lib/db/locationServiceContent";
import { getBlockDraft, saveBlockDraft } from "../src/lib/db/pageContent";
import { sanitizeRichText } from "../src/lib/richText";
import type { Location, ProblemSection } from "../src/data/site";
import type { FaqItem } from "../src/data/pages";

const WRITE = process.argv.includes("--write");

// ---------------------------------------------------------------------------
// Location facts — what genuinely differs between areas
// ---------------------------------------------------------------------------

interface Area {
  slug: string;
  /** "Solihull and Birmingham" — the DB's "&" reads badly inside a question. */
  name: string;
  region: string;
  wales: boolean;
  homeBase: boolean;
  nearby: string[];
  /** One sentence on the local housing stock. */
  housing: string;
  /** One sentence on how quickly a survey can be booked there. */
  response: string;
}

const HOUSING: Record<string, string> = {
  "solihull-birmingham":
    "Solihull and Birmingham have a broad mix of homes, from Victorian and Edwardian terraces to 1930s semis and post-war estates",
  wolverhampton:
    "Wolverhampton and the Black Country have a lot of Victorian and Edwardian terraces and inter-war semis, many with solid or early cavity walls",
  coventry:
    "Coventry combines post-war housing, built as the city was rebuilt after 1940, with older Victorian and Edwardian terraces",
  dudley:
    "Dudley and the surrounding Black Country towns have many older brick-built terraces and semis alongside newer estates",
  cardiff:
    "Cardiff has whole streets of Victorian terraces, alongside inter-war semis and more modern estates",
  swansea:
    "Many homes in and around Swansea are older solid-wall properties, and coastal exposure makes wind-driven rain and damp a real consideration",
};

const WALES = new Set(["cardiff", "swansea"]);

function toArea(location: Location): Area {
  const name = location.name.replace(/\s*&\s*/g, " and ");
  const homeBase = Boolean(location.isHomeBase);
  const wales = WALES.has(location.slug);
  return {
    slug: location.slug,
    name,
    region: location.region,
    wales,
    homeBase,
    nearby: location.nearbyAreas,
    housing:
      HOUSING[location.slug] ??
      `${name} has a wide mix of property ages and construction types`,
    response: homeBase
      ? `As our home base, ${name} gets same-week surveys for most enquiries.`
      : wales
        ? `${name} is covered by the same in-house team that works across the West Midlands, with surveys arranged around our regular South Wales work.`
        : `Our in-house team works in ${name} regularly, so a survey is booked around nearby jobs rather than as a one-off trip.`,
  };
}

/** "Neath, Port Talbot and Bridgend" */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function planningNote(area: Area): string {
  return area.wales
    ? `Wales has its own planning rules, which differ from England's in places, so we check what applies to your ${area.name} address before quoting.`
    : `Listed buildings, conservation areas and some property types in ${area.name} have tighter rules, so we check what applies to your address before quoting.`;
}

function coverageAnswer(area: Area, work: string): string {
  const towns = area.nearby.slice(0, 4);
  return `Yes. The same in-house team that handles ${work} in ${area.name} also covers ${listOf(towns)}, with the same survey, fixed-price quote and workmanship warranty. See <a href="/locations/${area.slug}">everything we do in ${area.name}</a>.`;
}

// ---------------------------------------------------------------------------
// Per-service content
// ---------------------------------------------------------------------------

interface ServiceSeo {
  problem: ProblemSection;
  faqs: FaqItem[];
  /** Five local questions for one location + service page. */
  local: (area: Area) => FaqItem[];
}

const FINANCE_LINK = `<a href="/finance">finance options</a>`;

const CONTENT: Record<string, ServiceSeo> = {
  // ----------------------------------------------------------------- SOLAR
  "solar-pv-installations": {
    problem: {
      heading: "Paying more for electricity every year, and using it mostly in daylight?",
      intro:
        "Most homes buy all of their electricity from the grid, including the power they use during the day when their own roof could be producing it.\n\nSolar only pays back when the system is sized to how you actually use energy, positioned for your roof, and paired with storage where it makes sense. Get any of those wrong and the savings never arrive.",
      cards: [
        { title: "Bills that keep rising", body: "Every price change lands straight on your bill, with nothing generated at home to offset it." },
        { title: "Daytime power bought in", body: "The hours your roof could cover are the hours you're still paying the grid for." },
        { title: "Export for pennies", body: "Without a battery, surplus power goes back to the grid cheaply and is bought back in the evening at full price." },
        { title: "Systems sold, not designed", body: "Panel counts picked from a brochure rather than from your roof, your usage and your shading." },
      ],
      ctaLabel: "Size a system for my home",
    },
    faqs: [
      {
        question: "How much does solar panel installation cost?",
        answer: "It depends on the number of panels, your roof, whether you add a battery, and the inverter and scaffolding needed. We survey your roof and electricity use first, then give a fixed-price quote for a system sized to your home rather than a standard package.",
      },
      {
        question: "How many solar panels do I need?",
        answer: "That's set by your annual electricity use, how much usable roof faces south, east or west, and any shading. We work it out from your bills and a roof survey, so the system matches what you actually use instead of a generic panel count.",
      },
      {
        question: "Is a solar battery worth adding?",
        answer: "A battery stores daytime generation for the evening, when most homes use the most power, so you buy less from the grid. Whether it pays back depends on your usage pattern and tariff, and we'll tell you honestly at survey if it's worth it for your home.",
      },
      {
        question: "Do I need planning permission for solar panels?",
        answer: "Most homes can install roof-mounted solar panels under permitted development, without a planning application. Listed buildings, conservation areas and some flat-roof installations have tighter rules, and we check this for your property before quoting.",
      },
      {
        question: "Can I sell surplus solar electricity back to the grid?",
        answer: "Yes. Under the Smart Export Guarantee, energy suppliers pay for electricity you export. To qualify, the installation needs MCS certification and an export-capable meter, and we'll talk you through the paperwork at survey.",
      },
      {
        question: "Is VAT charged on solar panels?",
        answer: "The installation of solar panels and batteries on homes is currently zero-rated for VAT in Great Britain. We'll confirm how it applies to your installation when we quote.",
      },
      {
        question: "Can I spread the cost of solar panels?",
        answer: `Yes. We offer ${FINANCE_LINK} through Ideal4Finance, subject to status, including interest-free options over shorter terms.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does solar panel installation cost in ${a.name}?`,
        answer: `Cost in ${a.name} depends on your roof, the number of panels, scaffolding access and whether you add a battery. We survey your roof and electricity use free, then give a fixed-price quote. ${a.response}`,
      },
      {
        question: `Is ${a.name} sunny enough for solar panels?`,
        answer: `Yes. Solar panels generate from daylight, not just direct sun, and UK homes${a.wales ? " in Wales" : " in the West Midlands"} produce useful power across the year, most of it from spring to autumn. Roof direction and shading matter far more than the local weather, which is why we assess your ${a.name} roof specifically.`,
      },
      {
        question: `Can you fit solar panels on older houses in ${a.name}?`,
        answer: `Usually, yes. ${a.housing}, and most of those roofs take panels well. We check the roof structure, tile type and condition at survey and tell you before quoting if any repairs are needed first.`,
      },
      {
        question: `Do I need planning permission for solar panels in ${a.name}?`,
        answer: `Most homes in ${a.name} can install roof-mounted solar under permitted development. ${planningNote(a)}`,
      },
      {
        question: `Do you install solar panels in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "solar panel installation"),
      },
    ],
  },

  // ---------------------------------------------------------- HEAT PUMPS
  "air-source-heat-pump-installations": {
    problem: {
      heading: "Heard heat pumps don't work in UK homes?",
      intro:
        "Most of the heat pumps that disappoint weren't failures of the technology. They were sized from a guess, fitted to radiators that were too small, or run at the wrong temperatures.\n\nA heat pump works when it's designed around your home's actual heat loss. That's the part that's usually skipped.",
      cards: [
        { title: "Cold rooms after install", body: "A unit sized by rule of thumb, not by a room-by-room heat loss calculation." },
        { title: "Higher bills than promised", body: "Flow temperatures set high to compensate for undersized radiators, killing the efficiency." },
        { title: "Old boiler, rising costs", body: "An ageing gas boiler that's due for replacement anyway, with fuel prices you can't control." },
        { title: "Unsure where to start", body: "Grants, radiators, cylinders, controls: too many moving parts to judge alone." },
      ],
      ctaLabel: "Check if my home suits a heat pump",
    },
    faqs: [
      {
        question: "How much does an air source heat pump cost to install?",
        answer: "The cost depends on your home's heat loss, the unit size, whether radiators or the hot water cylinder need upgrading, and the pipework involved. We calculate heat loss room by room, then give a fixed-price quote for the whole system.",
      },
      {
        question: "Is there a grant for an air source heat pump?",
        answer: "The government's Boiler Upgrade Scheme contributes towards replacing a fossil-fuel boiler with a heat pump for eligible properties in England and Wales. The installation must be carried out by an MCS-certified installer, and we'll confirm your eligibility and the current grant at survey.",
      },
      {
        question: "Will a heat pump heat my home properly?",
        answer: "Yes, when it's designed for your home. The unit is sized from a heat loss calculation, and radiators are checked room by room so they can deliver enough heat at the lower temperatures a heat pump runs at efficiently.",
      },
      {
        question: "Do I need new radiators for a heat pump?",
        answer: "Not always. Heat pumps run at lower flow temperatures than a boiler, so some rooms may need a larger radiator to stay warm. The room-by-room calculation shows exactly which, rather than replacing everything by default.",
      },
      {
        question: "How efficient is an air source heat pump?",
        answer: "A well-designed system typically delivers around three units of heat for every unit of electricity it uses, which is why sizing and flow temperature matter so much. We design for efficiency, not just for the unit to switch on.",
      },
      {
        question: "Do I need planning permission for an air source heat pump?",
        answer: "Most homes can install an air source heat pump under permitted development, subject to conditions on siting and size. Listed buildings, conservation areas and flats can differ, and we check what applies before quoting.",
      },
      {
        question: "Can I spread the cost of a heat pump?",
        answer: `Yes. ${FINANCE_LINK.replace("finance options", "Finance options")} are available through Ideal4Finance, subject to status, and can be combined with any grant you're eligible for.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does an air source heat pump cost in ${a.name}?`,
        answer: `It depends on your home's heat loss, radiators and hot water setup, not on the postcode. We carry out a room-by-room heat loss survey in ${a.name} and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `Is there a heat pump grant for homes in ${a.name}?`,
        answer: `The Boiler Upgrade Scheme covers eligible properties in ${a.wales ? "Wales" : "England"}, including ${a.name}, when a fossil-fuel boiler is replaced by a heat pump installed by an MCS-certified installer. We'll confirm your eligibility and the current grant value at survey.`,
      },
      {
        question: `Do heat pumps work in older ${a.name} homes?`,
        answer: `They can. ${a.housing}. In older homes the design matters most: we calculate heat loss, check which radiators need upgrading, and advise on insulation first where it would make the system smaller and cheaper to run.`,
      },
      {
        question: `Do I need planning permission for a heat pump in ${a.name}?`,
        answer: `Most homes in ${a.name} can install an air source heat pump under permitted development, subject to conditions on siting and size. ${planningNote(a)}`,
      },
      {
        question: `Do you install heat pumps in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "air source heat pump installation"),
      },
    ],
  },

  // --------------------------------------------------------- HEATING/BOILER
  "heating-system-upgrades": {
    problem: {
      heading: "A boiler that keeps breaking down, and rooms that never get warm?",
      intro:
        "An ageing heating system rarely fails all at once. It gets louder, slower and more expensive to run, and every repair buys a little more time on a system that's already past its best.\n\nReplacing the boiler alone often isn't enough either. If the radiators, pipework and controls aren't right, a new boiler inherits the old problems.",
      cards: [
        { title: "Repeat call-outs", body: "Paying for one repair after another on a boiler that's reaching the end of its life." },
        { title: "Cold spots", body: "Rooms that never get warm because radiators are undersized or the system is full of sludge." },
        { title: "Slow hot water", body: "Waiting for water to heat up, or running out halfway through the morning." },
        { title: "No real control", body: "One thermostat for the whole house, heating rooms nobody is using." },
      ],
      ctaLabel: "Get my heating assessed",
    },
    faqs: [
      {
        question: "How much does a boiler replacement cost?",
        answer: "It depends on the boiler type, whether it's a like-for-like swap or a system change, and any work needed on flues, pipework or radiators. We survey the whole system first, then give a fixed-price quote.",
      },
      {
        question: "Should I replace just the boiler or the whole heating system?",
        answer: "Often just the boiler, but not always. If radiators are undersized, pipework is sludged or controls are basic, a new boiler inherits those problems. We check the full system and tell you what's genuinely worth doing.",
      },
      {
        question: "Which boiler brands do you install?",
        answer: "We fit boilers from established manufacturers including Worcester Bosch and Ideal, chosen for your home's hot water demand and the space available. Manufacturer warranty terms vary by model, and we'll explain them with your quote.",
      },
      {
        question: "Are your heating engineers Gas Safe registered?",
        answer: "Yes. All gas work is carried out by Gas Safe registered engineers, and every installation is registered and certified as the regulations require.",
      },
      {
        question: "How long does a boiler replacement take?",
        answer: "A like-for-like boiler swap is usually completed in a day. Moving the boiler, changing system type or upgrading radiators takes longer, and we'll give you a timeline with the quote.",
      },
      {
        question: "Can I spread the cost of a new boiler?",
        answer: `Yes. We offer ${FINANCE_LINK} through Ideal4Finance, subject to status.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does a new boiler cost in ${a.name}?`,
        answer: `It depends on the boiler, the system type and any flue or pipework changes. We survey your ${a.name} heating system and give a fixed-price quote covering everything needed. ${a.response}`,
      },
      {
        question: `How quickly can you replace a boiler in ${a.name}?`,
        answer: `${a.response} A like-for-like swap is usually completed in a day once the survey is done. If your boiler has failed, tell us when you enquire and we'll prioritise the booking where we can.`,
      },
      {
        question: `Is it worth upgrading radiators in an older ${a.name} home?`,
        answer: `Often. ${a.housing}, and many still have original or mismatched radiators. Upgrading undersized ones, flushing the system and adding proper controls is frequently what finally makes every room warm.`,
      },
      {
        question: `Are your engineers in ${a.name} Gas Safe registered?`,
        answer: `Yes. Every gas installation in ${a.name} is carried out by Gas Safe registered engineers from our own team, and registered and certified as the regulations require.`,
      },
      {
        question: `Do you replace boilers in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "boiler and heating upgrades"),
      },
    ],
  },

  // ---------------------------------------------------------- LOFT INSULATION
  "loft-insulation": {
    problem: {
      heading: "Heating the house, and losing the heat through the roof?",
      intro:
        "Heat rises. In a home without enough loft insulation, a large share of what you pay to heat goes straight through the ceiling and out of the roof.\n\nIt's one of the cheapest and quickest upgrades to fix, and one of the most commonly done badly, with insulation compressed under boards or ventilation blocked.",
      cards: [
        { title: "Cold upstairs rooms", body: "Bedrooms that cool quickly because the heat escapes straight through the ceiling." },
        { title: "Thin old insulation", body: "A few centimetres laid decades ago, well short of today's recommended depth." },
        { title: "Squashed by storage", body: "Boards laid straight on top, crushing the insulation and most of its effect." },
        { title: "Condensation risk", body: "Insulation packed into the eaves, blocking the airflow the roof needs." },
      ],
      ctaLabel: "Check my loft",
    },
    faqs: [
      {
        question: "How much does loft insulation cost?",
        answer: "It depends on the loft's size, access, what's there already and whether you want raised boarding for storage. We inspect the loft and give a fixed-price quote.",
      },
      {
        question: "How thick should loft insulation be?",
        answer: "The recommended depth for mineral wool loft insulation in the UK is 270mm. Many older homes have far less, and topping up to the recommended depth is usually a quick job.",
      },
      {
        question: "Can I still use my loft for storage after insulating?",
        answer: "Yes. We fit raised loft boarding on legs above the insulation, so you keep storage space without crushing the insulation underneath, which would reduce how well it works.",
      },
      {
        question: "How long does loft insulation take to install?",
        answer: "Most lofts are insulated in a single day, with little disruption to the rest of the house.",
      },
      {
        question: "Does loft insulation cause condensation?",
        answer: "Not when it's installed properly. The eaves must be left clear so air can circulate, and we fit ventilation where needed so the roof space stays dry.",
      },
    ],
    local: (a) => [
      {
        question: `How much does loft insulation cost in ${a.name}?`,
        answer: `It depends on your loft's size, access and existing insulation. We inspect it and give a fixed-price quote, and most ${a.name} lofts are done in a day. ${a.response}`,
      },
      {
        question: `Do older homes in ${a.name} need extra loft insulation?`,
        answer: `Very often. ${a.housing}, and many were insulated to far lower standards than today's recommended 270mm, if at all. Topping up is one of the quickest ways to keep upstairs rooms warmer.`,
      },
      {
        question: `Can you board a loft for storage in ${a.name}?`,
        answer: `Yes. We fit raised boarding above the new insulation, so ${a.name} homeowners keep their storage space without crushing the insulation underneath.`,
      },
      {
        question: `Do I need permission for loft insulation in ${a.name}?`,
        answer: `No planning permission is needed for loft insulation. ${a.wales ? "Welsh" : "English"} building regulations still apply to how it's installed, including ventilation, and we fit it to those standards.`,
      },
      {
        question: `Do you install loft insulation in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "loft insulation"),
      },
    ],
  },

  // ------------------------------------------------------ EXTERNAL WALL INS.
  "external-wall-insulation-rendering": {
    problem: {
      heading: "Solid walls that let the heat straight out, and the damp in?",
      intro:
        "Older homes with solid walls have no cavity to fill, so they lose heat through the brickwork itself. No amount of turning up the heating fixes a wall that can't hold it.\n\nExternal wall insulation wraps the outside of the house in an insulated, rendered layer. Done badly it traps moisture. Done properly it's one of the biggest single improvements an older home can have.",
      cards: [
        { title: "Cold, heat-hungry walls", body: "Solid brick that loses heat as fast as you can put it in." },
        { title: "Damp and mould", body: "Cold internal wall surfaces where condensation settles and mould follows." },
        { title: "Tired, weathered exterior", body: "Crumbling render or brickwork that needs attention anyway." },
        { title: "No room to insulate inside", body: "Rooms too small to lose space to internal wall insulation." },
      ],
      ctaLabel: "Assess my walls",
    },
    faqs: [
      {
        question: "How much does external wall insulation cost?",
        answer: "It depends on the wall area, access and scaffolding, the insulation thickness, the render finish, and details such as windowsills and pipework. We survey the property and give a fixed-price quote.",
      },
      {
        question: "Is external wall insulation right for my house?",
        answer: "It's most effective on solid-wall homes with no cavity to fill, typically older properties. We check the wall construction, condition and any damp first, and tell you honestly if another option suits better.",
      },
      {
        question: "Do I need planning permission for external wall insulation?",
        answer: "It depends on the property and on how much the appearance changes. Front elevations, conservation areas and listed buildings often need permission, and we check what applies before work starts.",
      },
      {
        question: "Will external wall insulation cause damp?",
        answer: "Not when it's designed and installed properly. The system and render are chosen for the wall, and details at windows, eaves and ground level are finished carefully so moisture can't get trapped behind it.",
      },
      {
        question: "How long does external wall insulation take?",
        answer: "A typical house takes a few weeks, depending on size, weather and scaffolding. You stay in the home throughout, because the work is all on the outside.",
      },
      {
        question: "Can I spread the cost of external wall insulation?",
        answer: `Yes. We offer ${FINANCE_LINK} through Ideal4Finance, subject to status.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does external wall insulation cost in ${a.name}?`,
        answer: `It depends on the wall area, scaffolding access and the render finish you choose. We survey your ${a.name} property and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `Does external wall insulation suit older homes in ${a.name}?`,
        answer: `Often, yes. ${a.housing}. Solid-wall homes have no cavity to fill, which is exactly where external wall insulation makes the biggest difference.`,
      },
      {
        question: `Do I need planning permission for external wall insulation in ${a.name}?`,
        answer: `It can depend on how much the appearance of your home changes, particularly on a front elevation. ${planningNote(a)}`,
      },
      {
        question: `Can external wall insulation help with damp in ${a.name}?`,
        answer: a.slug === "swansea"
          ? `It can. Along the Swansea coast, wind-driven rain and cold solid walls are common causes of damp inside. Insulating and rendering the outside keeps the walls warmer and drier, provided the system is chosen and detailed for an exposed site.`
          : `It can. Cold internal wall surfaces are where condensation and mould form. Insulating the outside keeps those walls warmer, provided any existing damp source is fixed first, which we check at survey.`,
      },
      {
        question: `Do you install external wall insulation in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "external wall insulation"),
      },
    ],
  },

  // -------------------------------------------------------- LOFT CONVERSIONS
  "loft-conversions": {
    problem: {
      heading: "Running out of space, but don't want to move?",
      intro:
        "Moving means stamp duty, agents' fees and leaving an area you like. Meanwhile the biggest unused room in most houses is directly overhead.\n\nThe difference between a loft conversion that adds real value and one that disappoints comes down to planning it properly: headroom, stairs, structure and fire safety.",
      cards: [
        { title: "Outgrown the house", body: "A growing family, a home office, or a guest room you simply don't have." },
        { title: "The cost of moving", body: "Tens of thousands in fees and taxes to get one extra bedroom." },
        { title: "Unsure it's possible", body: "Not knowing if your roof has the headroom, or which type of conversion would work." },
        { title: "Worried about regulations", body: "Planning, building control, fire safety and party walls, all at once." },
      ],
      ctaLabel: "See what my loft could be",
    },
    faqs: [
      {
        question: "How much does a loft conversion cost?",
        answer: "It depends on the conversion type (Velux, dormer, hip-to-gable or mansard), the size, structural work and finish. We survey the loft, confirm what's achievable, then give a fixed-price quote.",
      },
      {
        question: "Do I need planning permission for a loft conversion?",
        answer: "Many loft conversions on houses can go ahead under permitted development, within volume limits and other conditions. Larger or front-facing dormers, flats, and homes in conservation areas usually need planning permission, and we confirm which applies to yours.",
      },
      {
        question: "Does a loft conversion need building regulations approval?",
        answer: "Yes, always. Building regulations cover the structure, fire safety and escape routes, stairs, insulation and ventilation, and we handle the building control process as part of the project.",
      },
      {
        question: "Is my loft suitable for conversion?",
        answer: "The key factors are headroom, roof pitch and structure, and where a staircase can go. We measure and assess the loft at survey and tell you honestly what's possible.",
      },
      {
        question: "How long does a loft conversion take?",
        answer: "Typically several weeks, depending on the type and size of conversion. Much of the early work is done from the outside and through the roof, which keeps disruption in the rest of the house down.",
      },
      {
        question: "Do I need a party wall agreement for a loft conversion?",
        answer: "If your home shares a wall with a neighbour and the work affects it, the Party Wall Act usually applies. We'll explain what's needed early so it doesn't hold the project up.",
      },
    ],
    local: (a) => [
      {
        question: `How much does a loft conversion cost in ${a.name}?`,
        answer: `It depends on the conversion type, the size and the structural work involved. We survey your ${a.name} loft, confirm what's achievable and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `What type of loft conversion suits homes in ${a.name}?`,
        answer: `${a.housing}. Terraces often suit a rear dormer, semis a hip-to-gable conversion, and roofs with good headroom a simpler rooflight conversion. We recommend the type after measuring your loft.`,
      },
      {
        question: `Do I need planning permission for a loft conversion in ${a.name}?`,
        answer: `Many loft conversions in ${a.name} fall under permitted development within volume limits, but not all. ${planningNote(a)} Building regulations approval is always required, and we handle it.`,
      },
      {
        question: `How long does a loft conversion take in ${a.name}?`,
        answer: `Typically several weeks, depending on the type. ${a.response} We'll give you a timeline with your quote.`,
      },
      {
        question: `Do you do loft conversions in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "loft conversions"),
      },
    ],
  },

  // ----------------------------------------------------------------- KITCHEN
  "kitchen-renovations": {
    problem: {
      heading: "A kitchen that no longer works for the way you live?",
      intro:
        "Kitchens take the hardest wear of any room, and a layout that suited the house decades ago rarely suits it now.\n\nThe new units are the easy part. What makes or breaks a kitchen renovation is everything behind them: the plumbing, the electrics, the walls and the order it's all done in.",
      cards: [
        { title: "A layout that fights you", body: "Too little worktop, poor storage, and appliances in the wrong places." },
        { title: "Worn and dated", body: "Doors, worktops and flooring that no cleaning can bring back." },
        { title: "Not enough sockets", body: "Extension leads everywhere and electrics that were never meant for modern appliances." },
        { title: "Too many trades", body: "A fitter, a plumber, an electrician and a plasterer, each blaming the next." },
      ],
      ctaLabel: "Plan my new kitchen",
    },
    faqs: [
      {
        question: "How much does a kitchen renovation cost?",
        answer: "It depends on the size, the units and worktops, appliances, and how much plumbing, electrical and building work the new layout needs. We survey the room, agree the scope, then give a fixed-price quote.",
      },
      {
        question: "How long does a kitchen renovation take?",
        answer: "A straightforward refit is often completed in a couple of weeks. Moving plumbing, removing walls or extending takes longer, and we'll give you a timeline with the quote.",
      },
      {
        question: "Do you handle the plumbing and electrics too?",
        answer: "Yes. Our team covers the plumbing, electrics, plastering, tiling and finishing as well as fitting, so one team is responsible for the whole kitchen and it's done in the right order.",
      },
      {
        question: "Can you knock through to make an open-plan kitchen?",
        answer: "Often, yes. Removing a load-bearing wall needs structural calculations, a steel beam and building regulations approval, all of which we arrange as part of the project.",
      },
      {
        question: "Can I use my own kitchen units?",
        answer: "We can discuss it at survey. Most customers prefer us to supply and fit, so one team is responsible for the finished result.",
      },
      {
        question: "Can I spread the cost of a new kitchen?",
        answer: `Yes. We offer ${FINANCE_LINK} through Ideal4Finance, subject to status.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does a kitchen renovation cost in ${a.name}?`,
        answer: `It depends on the size, the units and appliances, and how much plumbing and building work the layout needs. We survey your ${a.name} kitchen and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `How long does a kitchen renovation take in ${a.name}?`,
        answer: `A straightforward refit is often done in a couple of weeks. Moving plumbing or knocking through takes longer. ${a.response}`,
      },
      {
        question: `Can you create an open-plan kitchen in an older ${a.name} home?`,
        answer: `Often, yes. ${a.housing}, and many have a separate kitchen and dining room that can be opened up. Removing a load-bearing wall needs a structural engineer's calculations, a steel and building regulations approval, which we arrange.`,
      },
      {
        question: `Do you handle the plumbing and electrics for kitchens in ${a.name}?`,
        answer: `Yes. In ${a.name}, as everywhere we work, one in-house team covers the plumbing, electrics, plastering, tiling and fitting, so the work happens in the right order and one team answers for the result.`,
      },
      {
        question: `Do you renovate kitchens in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "kitchen renovations"),
      },
    ],
  },

  // ---------------------------------------------------------------- EXTENSION
  "single-storey-extension": {
    problem: {
      heading: "Need more space downstairs, without the upheaval of moving?",
      intro:
        "A single-storey extension can transform how a house works: a kitchen-diner, a family room, a utility or a ground-floor bedroom.\n\nIt's also where projects most often go wrong. Unclear planning, a builder who disappears between stages, and costs that grow once the ground is open.",
      cards: [
        { title: "Cramped ground floor", body: "A kitchen and living space that don't fit the family any more." },
        { title: "Planning uncertainty", body: "Not knowing if you need permission, or what you're allowed to build." },
        { title: "Costs that creep", body: "An estimate that becomes a very different final bill." },
        { title: "Builders who vanish", body: "Long gaps between trades, and nobody managing the whole job." },
      ],
      ctaLabel: "Plan my extension",
    },
    faqs: [
      {
        question: "How much does a single-storey extension cost?",
        answer: "It depends on the size, the foundations and ground conditions, the roof type, glazing, and the finish inside. We survey the site, agree the design and scope, then give a fixed-price quote.",
      },
      {
        question: "Do I need planning permission for a single-storey extension?",
        answer: "Many single-storey rear extensions fall under permitted development, within limits on depth, height and position. Larger designs, side extensions and homes in conservation areas often need planning permission, and we confirm which applies before designing.",
      },
      {
        question: "Does an extension need building regulations approval?",
        answer: "Yes. Building regulations cover the foundations, structure, insulation, drainage, ventilation and fire safety, and we manage the building control process through to sign-off.",
      },
      {
        question: "How long does a single-storey extension take to build?",
        answer: "Typically a few months from breaking ground to completion, depending on size and complexity. We'll give you a staged timeline with your quote.",
      },
      {
        question: "Do I need a party wall agreement?",
        answer: "If the extension is on or near a shared boundary, the Party Wall Act usually applies. We'll explain what's needed early so notices are served in good time.",
      },
      {
        question: "Can I spread the cost of an extension?",
        answer: `Yes. We offer ${FINANCE_LINK} through Ideal4Finance, subject to status.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does a single-storey extension cost in ${a.name}?`,
        answer: `It depends on the size, foundations, roof type and finish. We survey your ${a.name} property, agree the design and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `Do I need planning permission for an extension in ${a.name}?`,
        answer: `Many single-storey rear extensions in ${a.name} fall under permitted development within size limits. ${planningNote(a)}`,
      },
      {
        question: `What kind of extension suits homes in ${a.name}?`,
        answer: `${a.housing}. Terraces often suit a rear or side-return extension to widen the kitchen, and semis a full-width rear extension. We design around your plot and how you want to use the space.`,
      },
      {
        question: `How long does an extension take to build in ${a.name}?`,
        answer: `Typically a few months from breaking ground, depending on size. ${a.response} You'll get a staged timeline with your quote.`,
      },
      {
        question: `Do you build extensions in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "single-storey extensions"),
      },
    ],
  },

  // ------------------------------------------------------------- LIVING ROOM
  "living-room-improvements": {
    problem: {
      heading: "A living room that doesn't feel like the heart of the home?",
      intro:
        "It's the room you spend your evenings in, and often the one that's been left the longest.\n\nMaking it genuinely better usually means more than decorating: better lighting, better use of the space, and fixing the things you've stopped noticing.",
      cards: [
        { title: "Dark and closed in", body: "Poor lighting and a layout that makes the room feel smaller than it is." },
        { title: "Cold in winter", body: "Draughts, an old fireplace, or a radiator that can't keep up." },
        { title: "Dated finishes", body: "Walls, flooring and features that no longer suit the home." },
        { title: "Cables everywhere", body: "A TV wall with trailing leads and nowhere to put anything." },
      ],
      ctaLabel: "Plan my living room",
    },
    faqs: [
      {
        question: "What does a living room renovation include?",
        answer: "Anything from new flooring, plastering and decoration to lighting, media walls, fireplace work, and opening up to the kitchen or dining room. We agree the scope with you at survey.",
      },
      {
        question: "Can you build a media wall?",
        answer: "Yes. We build media walls with hidden cabling, recessed TV mounting, shelving and lighting, finished to match the rest of the room.",
      },
      {
        question: "Can you knock through to make an open-plan living space?",
        answer: "Often, yes. Removing a load-bearing wall needs structural calculations, a steel beam and building regulations approval, which we arrange as part of the project.",
      },
      {
        question: "How long does a living room renovation take?",
        answer: "Decorating-led projects can take days. Structural changes, new electrics or flooring throughout take longer, and we'll give you a timeline with the quote.",
      },
      {
        question: "How much does a living room renovation cost?",
        answer: "It depends entirely on the scope, from a refresh to structural changes. We survey the room, agree what you want, then give a fixed-price quote.",
      },
    ],
    local: (a) => [
      {
        question: `How much does a living room renovation cost in ${a.name}?`,
        answer: `It depends on the scope, from flooring and decoration to lighting, media walls or knocking through. We survey your ${a.name} home and give a fixed-price quote. ${a.response}`,
      },
      {
        question: `Can you open up the living room in an older ${a.name} home?`,
        answer: `Often. ${a.housing}, and many have separate front and back rooms that can be joined. Removing a load-bearing wall needs structural calculations, a steel and building regulations approval, which we arrange.`,
      },
      {
        question: `Do you build media walls in ${a.name}?`,
        answer: `Yes. We build media walls for ${a.name} homes with hidden cabling, recessed TV mounting, shelving and lighting, finished to match the room.`,
      },
      {
        question: `How long does a living room renovation take in ${a.name}?`,
        answer: `Anything from a few days for a refresh to longer for structural or electrical work. ${a.response}`,
      },
      {
        question: `Do you renovate living rooms in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "living room renovations"),
      },
    ],
  },

  // ------------------------------------------------------ FULL HOME RENOVATION
  "full-home-renovation": {
    problem: {
      heading: "The costliest renovation mistake? The right work in the wrong order.",
      intro:
        "New floors laid before the old pipework is replaced. Fresh plaster before the rewire. A finished kitchen before anyone decided where the heating goes.\n\nNone of those jobs is wrong on its own. Done out of sequence, they mean opening up finished walls, floors and ceilings twice, and paying for the finish twice. We plan the structure, plumbing, electrics, heating and finishes together, so each stage is done once.",
      cards: [
        { title: "Heating before flooring", body: "So new floors never need lifting to reach the pipes." },
        { title: "Electrics before plastering", body: "So finished walls aren't chased out again for a cable." },
        { title: "Plumbing before the kitchen", body: "So units and worktops stay untouched once they're fitted." },
        { title: "Structure before decorating", body: "So you only pay for the final finish once." },
      ],
      ctaLabel: "Plan my renovation in the right order",
    },
    faqs: [
      {
        question: "How much does a full home renovation cost?",
        answer: "It depends on the property's condition, the rooms involved, any structural work, the materials and the standard of finish. We survey the whole property, agree the scope, then give a clear quotation for it.",
      },
      {
        question: "Can Greentek manage the whole renovation?",
        answer: "Yes. We deliver full-property renovations and coordinate the building, heating, plumbing, electrical and finishing work, so one team is responsible from the first survey to handover.",
      },
      {
        question: "Can energy upgrades be done as part of a renovation?",
        answer: "Yes, and a renovation is the best time. With floors up and walls open, insulation, heating upgrades and solar can be planned in at far lower cost and disruption than adding them later.",
      },
      {
        question: "Can we stay in the property during a full renovation?",
        answer: "That depends on the scale and location of the work. We discuss access, safety and expected disruption at the survey and planning stage, and phase the work where staying in is practical.",
      },
      {
        question: "How long does a full home renovation take?",
        answer: "It depends on the size of the property and the scope. We give you a staged programme with the quote, so you know what happens when.",
      },
      {
        question: "Can I spread the cost of a renovation?",
        answer: `Finance may be available through Ideal4Finance, subject to status and approval. See our ${FINANCE_LINK}.`,
      },
    ],
    local: (a) => [
      {
        question: `How much does a full home renovation cost in ${a.name}?`,
        answer: `It depends on the property's condition, the scope and the finish. We survey your ${a.name} home, agree the scope and give a clear quotation for it. ${a.response}`,
      },
      {
        question: `Do you renovate older properties in ${a.name}?`,
        answer: `Yes. ${a.housing}, and renovating older homes well is mostly about sequencing: structure, plumbing, electrics and heating before any finishes, so nothing is opened up twice.`,
      },
      {
        question: `Can you add energy upgrades to a renovation in ${a.name}?`,
        answer: `Yes. With floors up and walls open, insulation, a heating upgrade or solar can be built into a ${a.name} renovation far more cheaply than added later, and the same in-house team does both.`,
      },
      {
        question: `Can we stay at home during a renovation in ${a.name}?`,
        answer: `Often, with the work phased around you, but it depends on the scale. We discuss access, safety and disruption at the survey before anything is agreed.`,
      },
      {
        question: `Do you carry out renovations in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "full home renovations"),
      },
    ],
  },

  // ---------------------------------------------------- COMMERCIAL MAINTENANCE
  "commercial-planned-maintenance": {
    problem: {
      heading: "Still paying emergency rates for problems you could have seen coming?",
      intro:
        "Reactive maintenance is the most expensive kind. A heating failure in winter or an electrical fault mid-trading costs more to fix urgently, and can close a site while you wait.\n\nPlanned maintenance catches those issues on a schedule, at a time that suits the business, with one team responsible across every site.",
      cards: [
        { title: "Emergency call-out costs", body: "Paying premium rates for urgent repairs that were visible months earlier." },
        { title: "Unplanned closures", body: "A site out of action while you wait for a contractor to turn up." },
        { title: "A different contractor per site", body: "No consistent standard and no single point of contact." },
        { title: "Gaps in the records", body: "No clear history of what was inspected, when, and what was found." },
      ],
      ctaLabel: "Plan maintenance for my sites",
    },
    faqs: [
      {
        question: "What does commercial planned maintenance include?",
        answer: "Scheduled inspections and upkeep across your sites, covering heating, electrical and general building maintenance, planned in advance rather than handled as emergencies.",
      },
      {
        question: "How is planned maintenance priced?",
        answer: "It depends on the number and size of sites, what's covered and how often visits are needed. We review your sites and agree a schedule and fixed pricing before work starts.",
      },
      {
        question: "Can you work around our opening hours?",
        answer: "Yes. Visits are scheduled around your trading hours wherever possible, to keep disruption to staff and customers to a minimum.",
      },
      {
        question: "Can you look after several sites?",
        answer: "Yes. One in-house team and one point of contact cover every site, so standards and records are consistent across the portfolio.",
      },
      {
        question: "Can maintenance visits flag upgrades that would save money?",
        answer: "Yes. The same team handles heating, insulation and solar, so a maintenance visit is a natural point to flag where an upgrade would cost less over time than another repair.",
      },
    ],
    local: (a) => [
      {
        question: `Do you provide commercial planned maintenance in ${a.name}?`,
        answer: `Yes. We carry out scheduled heating, electrical and building maintenance for commercial sites across ${a.name} and ${a.region}. ${a.response}`,
      },
      {
        question: `Can you maintain several business sites across ${a.name}?`,
        answer: `Yes. One in-house team and one point of contact covers every site, whether all in ${a.name} or spread across ${a.region}, with consistent standards and records.`,
      },
      {
        question: `How is commercial maintenance priced in ${a.name}?`,
        answer: `It depends on the number of sites, what's covered and how often visits are needed. We review your ${a.name} sites and agree a schedule and fixed pricing first.`,
      },
      {
        question: `Can maintenance in ${a.name} be scheduled around trading hours?`,
        answer: `Yes. Visits to ${a.name} sites are planned around your opening hours wherever possible, so staff and customers are disrupted as little as possible.`,
      },
      {
        question: `Do you cover commercial sites in ${a.nearby[0]} and ${a.nearby[1]}?`,
        answer: coverageAnswer(a, "commercial planned maintenance"),
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Homepage FAQ — written to the DRAFT, published from Page Content
// ---------------------------------------------------------------------------

const HOMEPAGE_FAQ = [
  {
    question: "What does Greentek do?",
    answer: "We're one in-house team for construction and energy upgrades: kitchens, bathrooms, extensions, loft conversions and full renovations, alongside solar panels and batteries, air source heat pumps, boilers and heating, and loft and external wall insulation. We also provide planned maintenance for commercial sites.",
  },
  {
    question: "Which areas do you cover?",
    answer: "We work across the West Midlands and South Wales, including Solihull, Birmingham, Wolverhampton, Coventry, Dudley, Cardiff and Swansea, and the towns around them. Our home base is Solihull.",
  },
  {
    question: "How much will my project cost?",
    answer: "It depends on the property, the scope of work, any structural changes and the finish you choose. We survey the property first and then give a clear, fixed-price quotation for the agreed work, not an estimate that grows once the job starts.",
  },
  {
    question: "Can you manage the whole project?",
    answer: "Yes. We plan and coordinate the building, plumbing, heating, electrical and finishing work together, so every stage is done in the right order by one team that's responsible for the result.",
  },
  {
    question: "Do you use subcontractors?",
    answer: "No. The same in-house team surveys, quotes and carries out the work, so there's no chain of subcontractors passing the job between them.",
  },
  {
    question: "Can we stay in the property while the work is done?",
    answer: "Usually, depending on the scale and location of the work. We discuss access, safety and expected disruption at the survey, and phase larger projects so you can stay at home where it's practical.",
  },
  {
    question: "How quickly will I hear back?",
    answer: "We reply to every enquiry within one business day to arrange your survey.",
  },
  {
    question: "Do you offer finance?",
    answer: "Yes. Finance is available through Ideal4Finance, subject to status and approval, including interest-free options over shorter terms. See our finance page for details.",
  },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function clean(faqs: FaqItem[]): FaqItem[] {
  return faqs.map((f) => ({ question: f.question.trim(), answer: sanitizeRichText(f.answer) }));
}

async function run() {
  const db = await getDb();
  const [services, locations, combos] = await Promise.all([
    getServices(),
    getLocations(),
    getAllLocationServiceContent(),
  ]);
  const comboByKey = new Map(combos.map((c) => [`${c.locationSlug}__${c.serviceSlug}`, c]));
  const areas = locations.map(toArea);

  const plan = { problems: 0, serviceFaqs: 0, comboFaqs: 0, skipped: [] as string[] };

  for (const service of services) {
    const content = CONTENT[service.slug];
    if (!content) {
      plan.skipped.push(`service ${service.slug}: no content written for it`);
      continue;
    }

    const updates: { problem?: ProblemSection; faqs?: FaqItem[] } = {};
    if (!service.problem?.heading) updates.problem = content.problem;
    else plan.skipped.push(`service ${service.slug}: problem section already set`);
    if (!service.faqs?.length) updates.faqs = clean(content.faqs);
    else plan.skipped.push(`service ${service.slug}: FAQs already set`);

    if (updates.problem) plan.problems++;
    if (updates.faqs) plan.serviceFaqs++;
    if (WRITE && (updates.problem || updates.faqs)) await updateService(service.slug, updates);

    for (const area of areas) {
      const key = `${area.slug}__${service.slug}`;
      if (comboByKey.get(key)?.faqs?.length) {
        plan.skipped.push(`combo ${key}: FAQs already set`);
        continue;
      }
      plan.comboFaqs++;
      if (WRITE) {
        await db.collection("locationServiceContent").updateOne(
          { _id: key } as never,
          {
            $set: { faqs: clean(content.local(area)) },
            // A combo with no row yet gets one; the page falls back to the
            // service description when intro is blank.
            $setOnInsert: { locationSlug: area.slug, serviceSlug: service.slug, intro: "" },
          },
          { upsert: true },
        );
      }
    }
  }

  const homeDraft = await getBlockDraft("faq");
  if (WRITE && homeDraft) {
    await saveBlockDraft("faq", { ...homeDraft, items: HOMEPAGE_FAQ });
  }

  console.log(WRITE ? "WROTE:" : "DRY RUN — nothing written. Would write:");
  console.log(`  problem sections       ${plan.problems}`);
  console.log(`  service FAQ sets       ${plan.serviceFaqs}`);
  console.log(`  location+service FAQs  ${plan.comboFaqs}`);
  console.log(`  homepage FAQ (draft)   ${homeDraft ? HOMEPAGE_FAQ.length + " questions" : "skipped — block not seeded"}`);
  if (plan.skipped.length) console.log(`  left alone:\n    ${plan.skipped.join("\n    ")}`);

  if (!WRITE) {
    const sample = areas.find((a) => a.slug === "swansea") ?? areas[0];
    console.log(`\nSample — /locations/${sample.slug}/external-wall-insulation-rendering:`);
    for (const f of clean(CONTENT["external-wall-insulation-rendering"].local(sample))) {
      console.log(`  Q: ${f.question}\n  A: ${f.answer}\n`);
    }
    console.log("Run again with --write to save.");
  } else {
    console.log("\nHomepage FAQ is a draft: review and publish it in Admin → Page Content.");
    console.log("Then use 'Refresh live site' on the dashboard, or redeploy, so pages rebuild.");
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
