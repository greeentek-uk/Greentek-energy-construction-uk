/**
 * The "Other services in <area>" cards on a location + service page.
 *
 * The default is the first four other services in the site's service order —
 * the same four on every page for a service. A page can pick its own (e.g.
 * the services genuinely done alongside this one); one shared rule so the
 * page, the editor's pre-ticks and the save agree on what "default" is.
 */
export const OTHER_SERVICES_COUNT = 4;

export function defaultOtherServices(allSlugs: string[], current: string): string[] {
  return allSlugs.filter((s) => s !== current).slice(0, OTHER_SERVICES_COUNT);
}

/** The page's pick, cleaned of deleted services; the default when it has none left. */
export function otherServicesFor(
  allSlugs: string[],
  current: string,
  picked: string[] | undefined,
): string[] {
  const valid = (picked ?? []).filter((s) => s !== current && allSlugs.includes(s));
  return valid.length ? valid : defaultOtherServices(allSlugs, current);
}
