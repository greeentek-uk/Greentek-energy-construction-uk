import type { ContentBlock } from "./content";
import type { FaqItem } from "./pages";

/**
 * A problem-agitation block: names the reader's frustration in their own terms
 * before the page describes the fix. Shown on the service page and on every
 * location + service page for that service.
 */
export interface ProblemSection {
  heading: string;
  /** Paragraphs separated by a blank line. */
  intro: string;
  /** Up to four; blank slots are dropped on save. */
  cards: { title: string; body: string }[];
  /** Button text; the button scrolls to the page's enquiry form. */
  ctaLabel: string;
}

export interface Service {
  slug: string;
  title: string;
  shortName: string;
  description: string;
  image: string;
  /** Alt text for `image`. Falls back to the service title when blank. */
  imageAlt?: string;
  /** Background for this page's own hero. Falls back to `image`, which is framed as a card thumbnail and doesn't always work full-bleed behind text. */
  heroImage?: string;
  /** Alt text for `heroImage`. Falls back to `imageAlt`, then the service title. */
  heroImageAlt?: string;
  formCategory: string;
  highlights: string[];
  metaTitle?: string;
  metaDescription?: string;
  content?: ContentBlock[];
  /** Page-specific FAQs, rendered on the page and marked up as FAQPage schema. */
  faqs?: FaqItem[];
  /** Null when cleared in the panel; the section is then not rendered. */
  problem?: ProblemSection | null;
  /**
   * Slug of the project shown as this page's case study. Blank means
   * automatic: the first project linked to this service, or none.
   */
  caseStudyProject?: string;
}

export interface Project {
  slug: string;
  service: string;
  category: string;
  title: string;
  description: string;
  before: string;
  /** Alt text for the "before" photo. Falls back to a title-derived description. */
  beforeAlt?: string;
  after: string;
  /** Alt text for the "after" photo. Falls back to a title-derived description. */
  afterAlt?: string;
  gallery?: string[];
  /** Alt text per gallery image, positionally matched to `gallery`. */
  galleryAlt?: string[];
  overview?: string[];
}

export interface Location {
  slug: string;
  name: string;
  region: string;
  isHomeBase?: boolean;
  image: string;
  /** Alt text for `image`. Falls back to the location name when blank. */
  imageAlt?: string;
  /** Background for this page's own hero. Falls back to `image`. */
  heroImage?: string;
  /** Alt text for `heroImage`. Falls back to `imageAlt`, then the location name. */
  heroImageAlt?: string;
  tagline: string;
  blurb: string;
  nearbyAreas: string[];
  metaTitle?: string;
  metaDescription?: string;
  content?: ContentBlock[];
  /** Page-specific FAQs, rendered on the page and marked up as FAQPage schema. */
  faqs?: FaqItem[];
}

/** Per-combination overrides for a /locations/[locationSlug]/[serviceSlug] page, keyed by locationSlug+serviceSlug. Optional — a combo with no row here falls back to the templated defaults those pages already render. */
export interface LocationServiceContent {
  locationSlug: string;
  serviceSlug: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Unique paragraph replacing the reused service.description on this specific combo page. */
  intro: string;
  /** Optional second paragraph replacing the generic isHomeBase template sentence. */
  localNote?: string;
  /** Optional override of service.highlights for this combo; falls back to service.highlights when empty. */
  highlights?: string[];
  /** Combo-specific FAQs, rendered on the page and marked up as FAQPage schema. */
  faqs?: FaqItem[];
}

export interface SiteConfig {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    region: string;
    postcode: string;
  };
  companyNo: string;
  location: string;
  /** Local SEO fields — feed the LocalBusiness schema and the contact page. */
  localSeo?: {
    /** schema.org type, e.g. "GeneralContractor" or "HomeAndConstructionBusiness". */
    businessType?: string;
    priceRange?: string;
    latitude?: string;
    longitude?: string;
    /** Free-text service radius, e.g. "40 miles of Solihull". */
    serviceArea?: string;
    openingHours?: { days: string; opens: string; closes: string; closed?: boolean }[];
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  /** Header navigation, managed in the admin panel's Menus section. */
  navLinks: { label: string; href: string; newTab?: boolean }[];
  /** Footer legal links, managed alongside the header menu. */
  footerLinks: { label: string; href: string; newTab?: boolean }[];
  stats: { value: string; label: string }[];
  services: Service[];
  whyChooseUs: { title: string; description: string }[];
  brands: { name: string; src: string }[];
  projects: Project[];
  locations: Location[];
}
