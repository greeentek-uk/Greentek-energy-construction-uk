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

/** The hero form's first choice, which decides the service list shown under it. */
export type ProjectType = "construction" | "energy";

export const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "construction", label: "Construction" },
  { value: "energy", label: "Energy upgrades" },
];

/**
 * The hero form's services — more specific than the full form's list, so the
 * team knows which room or system the enquiry is about before calling back.
 */
export const heroServiceOptions: Record<ProjectType, { value: string; label: string }[]> = {
  construction: [
    { value: "construction_full_property", label: "Full property" },
    { value: "construction_kitchen", label: "Kitchen" },
    { value: "construction_bathroom", label: "Bathroom" },
    { value: "construction_extension", label: "Extension" },
    { value: "construction_loft_conversion", label: "Loft conversion" },
    { value: "construction_living_space", label: "Living space" },
    { value: "construction_multiple_areas", label: "Multiple areas" },
    { value: "construction_not_sure", label: "Not sure yet" },
  ],
  energy: [
    { value: "energy_solar_pv", label: "Solar panels" },
    { value: "energy_battery", label: "Battery storage" },
    { value: "energy_heat_pump", label: "Air source heat pump" },
    { value: "energy_heating_boiler", label: "Heating & boiler" },
    { value: "energy_loft_insulation", label: "Loft insulation" },
    { value: "energy_wall_insulation", label: "External wall insulation" },
    { value: "energy_multiple", label: "Multiple upgrades" },
    { value: "energy_not_sure", label: "Not sure yet" },
  ],
};

/** A service value from either form, as the team would say it. */
export function serviceLabel(value: string): string {
  for (const [type, options] of Object.entries(heroServiceOptions)) {
    const label = optionLabel(options, value);
    if (label) return `${type === "energy" ? "Energy" : "Construction"} — ${label}`;
  }
  return optionLabel(serviceOptions, value);
}

export const timelineOptions = [
  { value: "", label: "Select a timeframe" },
  { value: "asap", label: "As soon as possible" },
  { value: "1_3_months", label: "Within 1–3 months" },
  { value: "3_6_months", label: "Within 3–6 months" },
];

export const ownerOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "buying", label: "Buying the property" },
];

export const budgetOptions = [
  { value: "", label: "Select a budget" },
  { value: "under_25k", label: "Under £25,000" },
  { value: "25k_50k", label: "£25,000–£50,000" },
  { value: "50k_100k", label: "£50,000–£100,000" },
  { value: "over_100k", label: "More than £100,000" },
  { value: "guidance", label: "I need guidance" },
];

/** Label for a stored option value, for the enquiry email. */
export function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value && value)?.label ?? "";
}

/** Property photos an enquiry can carry. */
export const MAX_ENQUIRY_PHOTOS = 5;

/** Largest photo accepted, checked on the phone before anything is uploaded. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** JPEG, PNG and HEIC (the iPhone camera's format) only. */
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
export const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

export function isAllowedPhoto(file: { name: string; type: string }): boolean {
  const name = file.name.toLowerCase();
  return (
    PHOTO_MIME_TYPES.includes(file.type.toLowerCase()) ||
    PHOTO_EXTENSIONS.some((ext) => name.endsWith(ext))
  );
}

/**
 * Cloudinary folder for enquiry photos — kept apart from the site's own media
 * folder, so customers' photos never show up in the panel's media library.
 */
export const ENQUIRY_PHOTO_FOLDER = "enquiry-photos";

export interface QuoteSubmission {
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  service: string;
  property_type?: string;
  is_homeowner?: string;
  timeline?: string;
  budget?: string;
  message?: string;
  /** Cloudinary URLs of property photos uploaded with the enquiry. */
  photos?: string[];
  /** The numbered enquiry the photos were uploaded under. */
  enquiry?: { number: number; token: string } | null;
  consent: boolean;
  /** Which form it came from, so enquiries can be told apart in the inbox. */
  source?: string;
  /** Shared with the browser pixel's Lead so Meta de-duplicates the pair. */
  event_id?: string;
  /** Page the enquiry was sent from, reported to Meta as the event source. */
  page_url?: string;
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
