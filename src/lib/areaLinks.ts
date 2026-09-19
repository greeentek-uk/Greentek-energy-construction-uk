import type { Location } from "@/data/site";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Where a service-area ticker name should link.
 *
 * Ticker names are free text in the panel, and most are towns without a page
 * of their own (Neath, Sutton Coldfield…). Rather than make someone type a URL
 * beside each one, a name resolves to:
 *
 *   1. the location it names, including one part of a joint name — "Birmingham"
 *      finds "Solihull & Birmingham";
 *   2. otherwise the location whose "Nearby areas" list includes it, so the
 *      link lands on a page that genuinely says that town is covered. A town
 *      listed under two locations goes to the one listing it earliest (the lists
 *      are written nearest-first), then the home base;
 *   3. otherwise the locations index.
 *
 * So the links stay right as locations and their nearby areas are edited.
 */
export function resolveAreaHref(name: string, locations: Location[]): string {
  const target = normalise(name);
  if (!target) return "/locations";

  const byName = locations.find((l) => {
    const full = normalise(l.name);
    return full === target || full.split(/\s*(?:&|,|\band\b)\s*/).includes(target);
  });
  if (byName) return `/locations/${byName.slug}`;

  const listedIn = locations
    .map((location) => ({
      location,
      rank: location.nearbyAreas.findIndex((area) => normalise(area) === target),
    }))
    .filter((entry) => entry.rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        Number(Boolean(b.location.isHomeBase)) - Number(Boolean(a.location.isHomeBase)),
    );
  if (listedIn.length) return `/locations/${listedIn[0].location.slug}`;

  return "/locations";
}
