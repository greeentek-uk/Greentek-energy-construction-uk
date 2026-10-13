const FIELDS = [
  ["utm_source", "Source"],
  ["utm_medium", "Medium"],
  ["utm_campaign", "Campaign"],
  ["utm_term", "Keyword"],
  ["utm_content", "Ad"],
] as const;

const CLICK_IDS = [
  ["gclid", "Google Ads"],
  ["gbraid", "Google Ads"],
  ["wbraid", "Google Ads"],
  ["fbclid", "Meta (Facebook / Instagram)"],
  ["msclkid", "Microsoft Ads"],
] as const;

export function campaignRows(pageUrl: unknown): [string, string][] {
  if (typeof pageUrl !== "string" || !pageUrl) return [];
  let params: URLSearchParams;
  try {
    params = new URL(pageUrl).searchParams;
  } catch {
    return [];
  }
  const value = (key: string) => (params.get(key) ?? "").trim().slice(0, 150);

  const rows: [string, string][] = [];
  const clickFrom = CLICK_IDS.find(([key]) => value(key));
  if (clickFrom) rows.push(["Paid click", clickFrom[1]]);
  for (const [key, label] of FIELDS) {
    if (value(key)) rows.push([label, value(key)]);
  }
  return rows;
}

export function pagePath(pageUrl: unknown): string {
  if (typeof pageUrl !== "string" || !pageUrl) return "";
  try {
    return new URL(pageUrl).pathname.slice(0, 200);
  } catch {
    return "";
  }
}
