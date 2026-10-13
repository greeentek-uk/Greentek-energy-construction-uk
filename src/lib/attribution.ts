/**
 * Where an enquiry came from, read from the URL of the page it was sent on —
 * the UTM tags and ad click ids the ad platforms add to their links.
 *
 * Both quote forms already send that URL (`page_url`, for Meta), so nothing new
 * is collected or stored in the browser. On an ad landing page the form sits
 * on the page the ad opened, so the tags are still in the URL when it's sent.
 * It goes in the enquiry email so the team can see which campaign, ad and
 * keyword produced each lead, and which leads came from paid clicks at all.
 */
const FIELDS = [
  ["utm_source", "Source"],
  ["utm_medium", "Medium"],
  ["utm_campaign", "Campaign"],
  ["utm_term", "Keyword"],
  ["utm_content", "Ad"],
] as const;

/** Click ids: present means the visit came from a paid click on that platform. */
const CLICK_IDS = [
  ["gclid", "Google Ads"],
  ["gbraid", "Google Ads"],
  ["wbraid", "Google Ads"],
  ["fbclid", "Meta (Facebook / Instagram)"],
  ["msclkid", "Microsoft Ads"],
] as const;

/** Rows for the enquiry email; empty when the page URL carried no tags. */
export function campaignRows(pageUrl: unknown): [string, string][] {
  if (typeof pageUrl !== "string" || !pageUrl) return [];
  let params: URLSearchParams;
  try {
    params = new URL(pageUrl).searchParams;
  } catch {
    return [];
  }
  // Values come from a public request, so they're length-capped; the mailer
  // HTML-escapes them like every other field.
  const value = (key: string) => (params.get(key) ?? "").trim().slice(0, 150);

  const rows: [string, string][] = [];
  const clickFrom = CLICK_IDS.find(([key]) => value(key));
  if (clickFrom) rows.push(["Paid click", clickFrom[1]]);
  for (const [key, label] of FIELDS) {
    if (value(key)) rows.push([label, value(key)]);
  }
  return rows;
}

/** The page path the enquiry was sent from, without the query. */
export function pagePath(pageUrl: unknown): string {
  if (typeof pageUrl !== "string" || !pageUrl) return "";
  try {
    return new URL(pageUrl).pathname.slice(0, 200);
  } catch {
    return "";
  }
}
