/**
 * Shared definitions for the quote request form.
 *
 * The hero form and the full form further down the page post to the same
 * endpoint, so their service values have to match exactly — keeping the lists
 * here stops the two drifting apart and silently sending values the inbox
 * doesn't recognise.
 */
export const serviceOptions = [
  { value: "", label: "Select a service" },
  { value: "solar_storage", label: "Solar PV & Battery Storage" },
  { value: "heating_boiler", label: "Heating & Boiler Upgrades" },
  { value: "insulation", label: "Insulation" },
  { value: "refurb_extension", label: "Property Refurbishment & Extensions" },
  { value: "commercial", label: "Commercial Refurbishment & Maintenance" },
  { value: "not_sure", label: "Not Sure — Need Advice" },
];

export const timelineOptions = [
  { value: "", label: "Select a timeframe" },
  { value: "asap", label: "As soon as possible" },
  { value: "3_months", label: "Within 3 months" },
  { value: "researching", label: "Just researching" },
];

export interface QuoteSubmission {
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  service: string;
  property_type?: string;
  is_homeowner?: string;
  timeline?: string;
  message?: string;
  consent: boolean;
  /** Which form it came from, so enquiries can be told apart in the inbox. */
  source?: string;
}

export async function submitQuoteRequest(payload: QuoteSubmission): Promise<void> {
  const response = await fetch("/api/quote-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
}

/** UK postcode, loosely checked — enough to catch a typo without rejecting valid ones. */
export function isLikelyPostcode(value: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d?[A-Z]{0,2}$/i.test(value.trim());
}
