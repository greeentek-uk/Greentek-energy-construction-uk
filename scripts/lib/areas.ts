/**
 * What genuinely differs between the areas Greentek covers, for the seed
 * scripts that write location + service copy. Shared so the FAQs and the body
 * copy on one page describe the same place the same way.
 */
import type { Location } from "../../src/data/site";

// ---------------------------------------------------------------------------
// Location facts — what genuinely differs between areas
// ---------------------------------------------------------------------------

export interface Area {
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

export function toArea(location: Location): Area {
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
export function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function planningNote(area: Area): string {
  return area.wales
    ? `Wales has its own planning rules, which differ from England's in places, so we check what applies to your ${area.name} address before quoting.`
    : `Listed buildings, conservation areas and some property types in ${area.name} have tighter rules, so we check what applies to your address before quoting.`;
}

export function coverageAnswer(area: Area, work: string): string {
  const towns = area.nearby.slice(0, 4);
  return `Yes. The same in-house team that handles ${work} in ${area.name} also covers ${listOf(towns)}, with the same survey, fixed-price quote and workmanship warranty. See <a href="/locations/${area.slug}">everything we do in ${area.name}</a>.`;
}

