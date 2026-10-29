/**
 * Whether a landing page's limited-time offer is still on. `ends` is the last
 * day it shows (YYYY-MM-DD); blank = shown until removed. Kept out of
 * `PromoBadge` (a client component) so the server page can call it too.
 */
export function promoActive(ends: string, now = Date.now()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ends)) return true;
  // The whole of the last day, UK time (GMT in winter; close enough in summer).
  return now <= Date.parse(`${ends}T23:59:59Z`);
}
