import type { Service } from "@/data/site";
import type { VerticalsContent } from "@/data/pageContent";

/** A service as a card: what the shared ServiceCard renders. */
export interface ServiceCardData {
  title: string;
  body: string;
  href: string;
}

/**
 * Which service categories belong to each group, in the same order as the
 * homepage Verticals groups — Energy first, Home second.
 *
 * Commercial sits with Home, as it does on the homepage, so /home-solutions and
 * the homepage's "Home Solutions" group list the same services.
 */
export const GROUP_CATEGORIES: string[][] = [
  ["solar_storage", "heating_boiler", "insulation"],
  ["refurb_extension", "commercial"],
];

const FALLBACK_GROUPS = [
  { name: "Energy Solutions", intro: "", href: "/energy-solutions" },
  { name: "Home Solutions", intro: "", href: "/home-solutions" },
];

function toCard(service: Service): ServiceCardData {
  return {
    title: service.title,
    body: service.description,
    href: `/services/${service.slug}`,
  };
}

export interface ServiceGroupData {
  name: string;
  intro: string;
  href: string;
  services: ServiceCardData[];
}

/**
 * Groups every service for the listing pages.
 *
 * Membership comes from each service's category, so a service added in the
 * panel shows up without anyone remembering to add it anywhere else. Order
 * follows the homepage cards, so the pages read in the same sequence; anything
 * the homepage doesn't list goes after, and a service in an unknown category
 * lands in the last group rather than silently vanishing from "all services".
 */
export function buildServiceGroups(
  services: Service[],
  verticalGroups: VerticalsContent["groups"] | undefined,
): ServiceGroupData[] {
  const assigned = new Set<string>();

  const groups = GROUP_CATEGORIES.map((categories, index) => {
    const vertical = verticalGroups?.[index];
    const homepageOrder = (vertical?.services ?? []).map((card) => card.href);

    const members = services
      .filter((service) => categories.includes(service.formCategory))
      .sort((a, b) => {
        const ia = homepageOrder.indexOf(`/services/${a.slug}`);
        const ib = homepageOrder.indexOf(`/services/${b.slug}`);
        return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
      });

    members.forEach((service) => assigned.add(service.slug));

    return {
      name: vertical?.name || FALLBACK_GROUPS[index].name,
      intro: vertical?.intro || "",
      href: vertical?.href || FALLBACK_GROUPS[index].href,
      services: members.map(toCard),
    };
  });

  const leftovers = services.filter((service) => !assigned.has(service.slug));
  if (leftovers.length) groups[groups.length - 1].services.push(...leftovers.map(toCard));

  return groups;
}
