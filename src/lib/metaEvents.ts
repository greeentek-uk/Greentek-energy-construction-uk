/**
 * Meta event names shared by the browser pixel and the Conversions API.
 *
 * Standard events go through `fbq('track')`; anything else is custom and goes
 * through `fbq('trackCustom')`. Sending one through the other is silently
 * accepted by Meta and then never matches the event you set up in Ads Manager.
 */
export const STANDARD_EVENTS = ["PageView", "ViewContent", "Lead", "Contact", "Schedule"] as const;
export const CUSTOM_EVENTS = ["StartQuote"] as const;

export type MetaEventName = (typeof STANDARD_EVENTS)[number] | (typeof CUSTOM_EVENTS)[number];

export function isStandardEvent(name: string): boolean {
  return (STANDARD_EVENTS as readonly string[]).includes(name);
}

/**
 * Events the public /api/track endpoint will forward.
 *
 * Lead is deliberately absent: it's sent server-to-server from the enquiry
 * endpoint once an enquiry has actually been received. Accepting it here would
 * let anyone post fake leads straight into the ad account's optimisation data.
 */
export const BROWSER_FORWARDABLE_EVENTS: MetaEventName[] = [
  "PageView",
  "ViewContent",
  "Contact",
  "StartQuote",
  "Schedule",
];

/** The only custom_data keys accepted from the browser — nothing that could carry personal data. */
export const ALLOWED_CUSTOM_DATA_KEYS = [
  "content_name",
  "content_category",
  "content_ids",
  "content_type",
  "method",
] as const;
