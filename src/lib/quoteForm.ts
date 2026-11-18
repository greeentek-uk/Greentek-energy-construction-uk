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
 * Budget bands per service. The whole-project bands fit neither end: "Under
 * £25,000" would put every bathroom lead in one band and tell sales nothing,
 * and loft insulation was being offered "More than £100,000". The whole-project
 * list is only for "multiple" / "not sure", where the job isn't known yet.
 * Bands only — the price itself comes after the survey. Bathroom and kitchen
 * figures are the owner's (2026-10-13); the rest follow published UK cost
 * guides (2026-11-02) until the owner confirms them, with the cuts where the
 * job changes: panels vs panels + battery, Velux vs dormer vs mansard, terrace
 * vs semi vs detached. The first band is the floor (owner, 2026-11-02): nothing
 * lower is offered, because people pick the first option, and "Under £1,200"
 * says what the budget is without suggesting the job can be done for less.
 * Only the owner's two state a starting price; the others open with "Under".
 * Heat pump bands are what's paid after the Boiler
 * Upgrade Scheme, and commercial maintenance is a yearly schedule. Values are
 * prefixed so an email can't confuse them with the whole-project ones.
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
  construction_full_property: [
    { value: "", label: "Select a budget" },
    { value: "full_home_under_45k", label: "Under £45,000" },
    { value: "full_home_45k_70k", label: "£45,000–£69,999" },
    { value: "full_home_70k_100k", label: "£70,000–£99,999" },
    { value: "full_home_over_100k", label: "£100,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  construction_extension: [
    { value: "", label: "Select a budget" },
    { value: "extension_under_35k", label: "Under £35,000" },
    { value: "extension_35k_50k", label: "£35,000–£49,999" },
    { value: "extension_50k_70k", label: "£50,000–£69,999" },
    { value: "extension_over_70k", label: "£70,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  construction_loft_conversion: [
    { value: "", label: "Select a budget" },
    { value: "loft_conversion_under_30k", label: "Under £30,000" },
    { value: "loft_conversion_30k_45k", label: "£30,000–£44,999" },
    { value: "loft_conversion_45k_60k", label: "£45,000–£59,999" },
    { value: "loft_conversion_over_60k", label: "£60,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  construction_living_space: [
    { value: "", label: "Select a budget" },
    { value: "living_room_under_3k", label: "Under £3,000" },
    { value: "living_room_3k_6k", label: "£3,000–£5,999" },
    { value: "living_room_6k_10k", label: "£6,000–£9,999" },
    { value: "living_room_over_10k", label: "£10,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  construction_commercial_maintenance: [
    { value: "", label: "Select a budget" },
    { value: "maintenance_under_1k", label: "Under £1,000 a year" },
    { value: "maintenance_1k_3k", label: "£1,000–£2,999 a year" },
    { value: "maintenance_3k_10k", label: "£3,000–£9,999 a year" },
    { value: "maintenance_over_10k", label: "£10,000 a year or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  energy_solar_pv: [
    { value: "", label: "Select a budget" },
    { value: "solar_under_6k", label: "Under £6,000" },
    { value: "solar_6k_9k", label: "£6,000–£8,999" },
    { value: "solar_9k_14k", label: "£9,000–£13,999" },
    { value: "solar_over_14k", label: "£14,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  energy_heat_pump: [
    { value: "", label: "Select a budget" },
    { value: "heat_pump_under_3k", label: "Under £3,000" },
    { value: "heat_pump_3k_5k", label: "£3,000–£4,999" },
    { value: "heat_pump_5k_8k", label: "£5,000–£7,999" },
    { value: "heat_pump_over_8k", label: "£8,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  energy_heating_boiler: [
    { value: "", label: "Select a budget" },
    { value: "heating_under_2500", label: "Under £2,500" },
    { value: "heating_2500_4k", label: "£2,500–£3,999" },
    { value: "heating_4k_8k", label: "£4,000–£7,999" },
    { value: "heating_over_8k", label: "£8,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  energy_loft_insulation: [
    { value: "", label: "Select a budget" },
    { value: "loft_insulation_under_1200", label: "Under £1,200" },
    { value: "loft_insulation_1200_2k", label: "£1,200–£1,999" },
    { value: "loft_insulation_2k_3k", label: "£2,000–£2,999" },
    { value: "loft_insulation_over_3k", label: "£3,000 or more" },
    { value: "guidance", label: "I need guidance" },
  ],
  energy_wall_insulation: [
    { value: "", label: "Select a budget" },
    { value: "wall_insulation_under_10k", label: "Under £10,000" },
    { value: "wall_insulation_10k_15k", label: "£10,000–£14,999" },
    { value: "wall_insulation_15k_25k", label: "£15,000–£24,999" },
    { value: "wall_insulation_over_25k", label: "£25,000 or more" },
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

/**
 * Heat pump questions (ad landing page, 2026-10-29). They replace property
 * type and budget there: nobody arriving from a heat pump ad is a commercial
 * site, and the whole-project bands put every heat pump lead in "Under
 * £25,000". What they ask instead is what decides the Boiler Upgrade Scheme —
 * what the home is heated with now and who owns it (no EPC: the scheme
 * stopped needing one on 28 April 2026) — plus
 * why they're looking, so a broken boiler can be called before a grant
 * browser. Mirrors the Meta lead form, so leads from both read the same.
 * Values are never renamed (see heroServiceOptions).
 */
export const currentHeatingOptions = [
  { value: "gas", label: "Gas boiler" },
  { value: "oil", label: "Oil boiler" },
  { value: "lpg", label: "LPG boiler" },
  { value: "electric", label: "Electric heaters" },
  { value: "heat_pump", label: "Already a heat pump" },
  { value: "other", label: "Something else" },
];

export const homeTypeOptions = [
  { value: "detached", label: "Detached" },
  { value: "semi", label: "Semi-detached" },
  { value: "terraced", label: "Terraced" },
  { value: "bungalow", label: "Bungalow" },
  { value: "flat", label: "Flat" },
  { value: "other", label: "Other" },
];

export const heatPumpReasonOptions = [
  { value: "", label: "Choose a reason" },
  { value: "boiler_broken", label: "My boiler is old or broken" },
  { value: "lower_bills", label: "Lower my energy bills" },
  { value: "off_gas", label: "Move away from gas or oil" },
  { value: "grant", label: "Just looking at the grant for now" },
];

/**
 * UK mobile or landline, with or without +44 / spaces / brackets. Mobiles are
 * always 11 digits; a few old landlines (01xxx area codes) are 10.
 */
export function isLikelyUkPhone(value: string): boolean {
  const digits = value.replace(/[\s().-]/g, "").replace(/^(\+44|0044)0?/, "0");
  return /^07\d{9}$/.test(digits) || /^0[1-3]\d{8,9}$/.test(digits);
}

/** Loose shape check — one @, a dot in the domain, no spaces. */
export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Domains people commonly mistype on a phone keyboard. Only ever offered as a
 * "Did you mean …?" — never changed silently, since an unusual domain can be
 * real.
 */
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.co.uk": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.co.uk",
  "hotmail.con": "hotmail.com",
  "yahoo.co": "yahoo.co.uk",
  "yaho.co.uk": "yahoo.co.uk",
  "yahooo.co.uk": "yahoo.co.uk",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "btinternet.co": "btinternet.com",
  "btinternet.co.uk": "btinternet.com",
};

export function suggestEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const fix = EMAIL_DOMAIN_TYPOS[email.slice(at + 1)];
  return fix ? `${email.slice(0, at)}@${fix}` : null;
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
  /** Street address; every form asks for it (optional here for pages left open). */
  address?: string;
  service: string;
  property_type?: string;
  is_homeowner?: string;
  timeline?: string;
  budget?: string;
  message?: string;
  /** Heat pump questions (only the heat pump landing page asks them). */
  current_heating?: string;
  home_type?: string;
  main_reason?: string;
  /** Cloudinary URLs of property photos uploaded with the enquiry. */
  photos?: string[];
  /** The numbered enquiry the photos were uploaded under. */
  enquiry?: { number: number; token: string } | null;
  consent: boolean;
  /**
   * A "call me back" request (name, phone, postcode only): the one case the
   * API accepts without an email address.
   */
  callback?: boolean;
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
