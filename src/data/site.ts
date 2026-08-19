import type { ContentBlock } from "./content";

export interface Service {
  slug: string;
  title: string;
  shortName: string;
  description: string;
  image: string;
  formCategory: string;
  highlights: string[];
  metaTitle?: string;
  metaDescription?: string;
  content?: ContentBlock[];
}

export interface Project {
  slug: string;
  service: string;
  category: string;
  title: string;
  description: string;
  before: string;
  after: string;
  gallery?: string[];
  overview?: string[];
}

export interface Location {
  slug: string;
  name: string;
  region: string;
  isHomeBase?: boolean;
  image: string;
  tagline: string;
  blurb: string;
  nearbyAreas: string[];
  metaTitle?: string;
  metaDescription?: string;
  content?: ContentBlock[];
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
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  navLinks: { label: string; href: string }[];
  stats: { value: string; label: string }[];
  services: Service[];
  whyChooseUs: { title: string; description: string }[];
  brands: { name: string; src: string }[];
  projects: Project[];
  locations: Location[];
}
