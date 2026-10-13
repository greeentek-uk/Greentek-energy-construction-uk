/**
 * Shared definitions for the quote request form.
 *
 * The hero form and the full form further down the page post to the same
 * endpoint and ask the same questions with the same answers — only the layout
 * differs. Keeping the lists here stops the two drifting apart: they once did,
 * and the hero offered specific rooms and systems while the full form offered
 * five broad categories, so the same visitor got two
 * different sets of choices depending on which form they scrolled to.
 */

export type ProjectType = "construction" | "energy";

export const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "construction", label: "Construction" },
  { value: "energy", label: "Energy upgrades" },
];

export interface ServiceOption {
  value: string;
  label: string;
  slug?: string;
}

/**
 * The services an enquiry can be about — one option per service page, plus
 * "multiple" and "not sure". Add a service here when one is
 * added in the panel, or its page falls back to the service's broad category.
 *
 * Values are what lands in the inbox and in Meta's Lead, so they're never
 * renamed: a label can change, a value can't.
 */
export const heroServiceOptions: Record<ProjectType, ServiceOption[]> = {
  construction: [
    { value: "construction_full_property", label: "Full home renovation", slug: "full-home-renovation" },
    { value: "construction_kitchen", label: "Kitchen renovation", slug: "kitchen-renovations" },
    { value: "construction_bathroom", label: "Bathroom renovation", slug: "bathroom-renovations" },
    { value: "construction_extension", label: "Single storey extension", slug: "single-storey-extension" },
    { value: "construction_loft_conversion", label: "Loft conversion", slug: "loft-conversions" },
    { value: "construction_living_space", label: "Living room improvements", slug: "living-room-improvements" },
    {
      value: "construction_commercial_maintenance",
      label: "Commercial planned maintenance",
      slug: "commercial-planned-maintenance",
    },
    { value: "construction_multiple_areas", label: "Multiple areas" },
    { value: "construction_not_sure", label: "Not sure yet" },
  ],
  energy: [
    { value: "energy_solar_pv", label: "Solar panels & battery storage", slug: "solar-pv-installations" },
    { value: "energy_heat_pump", label: "Air source heat pump", slug: "air-source-heat-pump-installations" },
    { value: "energy_heating_boiler", label: "Heating system upgrade", slug: "heating-system-upgrades" },
    { value: "energy_loft_insulation", label: "Loft insulation", slug: "loft-insulation" },
    { value: "energy_wall_insulation", label: "External wall insulation", slug: "external-wall-insulation-rendering" },
    { value: "energy_multiple", label: "Multiple upgrades" },
    { value: "energy_not_sure", label: "Not sure yet" },
  ],
};

const retiredServiceOptions = [
  { value: "energy_battery", label: "Energy — Battery storage" },
  { value: "solar_storage", label: "Solar PV & Battery Storage" },
  { value: "heating_boiler", label: "Heating & Boiler Upgrades" },
  { value: "insulation", label: "Insulation" },
  { value: "refurb_extension", label: "Property Refurbishment & Extensions" },
  { value: "commercial", label: "Commercial Refurbishment & Maintenance" },
  { value: "not_sure", label: "Not Sure — Need Advice" },
];

export function serviceOptionValue(service: { slug: string; formCategory: string }): string {
  for (const options of Object.values(heroServiceOptions)) {
    const match = options.find((o) => o.slug === service.slug);
    if (match) return match.value;
  }
  return service.formCategory;
}

export function isOfferedService(value: string): boolean {
  return Object.values(heroServiceOptions).some((options) => options.some((o) => o.value === value));
}

/** A service value from either form, as the team would say it. */
export function serviceLabel(value: string): string {
  for (const [type, options] of Object.entries(heroServiceOptions)) {
    const label = optionLabel(options, value);
    if (label) return `${type === "energy" ? "Energy" : "Construction"} — ${label}`;
  }
  return optionLabel(retiredServiceOptions, value);
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

/**
 * Budget bands for services the whole-project bands don't fit. A bathroom
 * starts at £2,999, so "Under £25,000" would put every bathroom lead in one
 * band and tell sales nothing. Bands only — the price itself comes after the
 * survey. Values are prefixed so an email can't confuse them with the
 * whole-project ones.
 */
export const serviceBudgetOptions: Record<string, typeof budgetOptions> = {
  construction_bathroom: [
    { value: "", label: "Select a budget" },
    { value: "bathroom_2999_6k", label: "£2,999–£5,999" },
    { value: "bathroom_6k_10k", label: "£6,000–£9,999" },
    { value: "bathroom_over_10k", label: "£10,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  construction_kitchen: [
    { value: "", label: "Select a budget" },
    { value: "kitchen_4999_10k", label: "£4,999–£9,999" },
    { value: "kitchen_10k_20k", label: "£10,000–£19,999" },
    { value: "kitchen_over_20k", label: "£20,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
};

/**
 * Bands the forms no longer offer, kept so an enquiry sent with one (an old
 * page still open, or an email being re-read) is still named. Values are never
 * reused for a different band.
 */
const retiredBudgetOptions = [
  { value: "bathroom_under_3k", label: "Under £3,000" },
  { value: "bathroom_3k_6k", label: "£3,000–£6,000" },
  { value: "bathroom_over_6k", label: "More than £6,000" },
  { value: "kitchen_under_8k", label: "Under £8,000" },
  { value: "kitchen_8k_15k", label: "£8,000–£15,000" },
  { value: "kitchen_over_15k", label: "More than £15,000" },
];

/** The budget answers that fit the chosen service. */
export function budgetOptionsFor(service: string) {
  return serviceBudgetOptions[service] ?? budgetOptions;
}

/** Every budget answer any form can send, for naming it in the enquiry email. */
export const allBudgetOptions = [budgetOptions, ...Object.values(serviceBudgetOptions), retiredBudgetOptions].flat();

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
