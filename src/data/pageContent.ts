/**
 * The homepage hero — a single, static panel.
 *
 * This was a rotating carousel of three slides. It is now one: the hero shares
 * its space with the quote form, and copy that changes under the reader while
 * they are filling in a form works against both of them.
 */
export interface HomeHeroContent {
  /** Rating word shown before the stars, e.g. "Excellent". */
  ratingLabel: string;
  /** Score out of 5, e.g. "4.4". Drives how much of the star strip is filled. */
  ratingScore: string;
  /** Where the badge links — your public Trustpilot profile. */
  ratingUrl: string;
  image: string;
  imageAlt?: string;
  headingLine1: string;
  headingLine2: string;
  body: string;
  ctaLabel: string;
  /** Heading above the hero quote form. */
  formHeading: string;
  /** Short line under the form heading. */
  formSubheading: string;
}

export interface WhyUsContent {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subheading: string;
  items: { heading: string; body: string }[];
}

export interface WhyChooseUsContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: {
    id: string;
    title: string;
    description: string;
    image: string;
    imageAlt?: string;
  }[];
}

export interface TestimonialsContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: {
    name: string;
    quote: string;
    role: string;
    rating: number;
    /** Optional — initials are shown when there's no photo. */
    image?: string;
    imageAlt?: string;
    /** Where the review came from, e.g. "trustpilot" or "google". */
    source?: string;
    /** Optional link to the review itself. Makes the whole card clickable. */
    url?: string;
  }[];
}

export interface FaqContent {
  eyebrow: string;
  heading: string;
  items: { question: string; answer: string }[];
}

export interface AreasContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  largeArea: {
    name: string;
    stat: string;
    note: string;
    image: string;
    imageAlt?: string;
    path: string;
  };
  smallAreas: {
    name: string;
    image: string;
    imageAlt?: string;
    path: string;
  }[];
  tickerItems: string[];
  tickerLabel: string;
  ctaLabel: string;
}

export interface CorePillarsContent {
  heading: string;
  intro: string;
  pillars: {
    label: string;
    title: string;
    description: string;
    items: string[];
  }[];
}

export interface VerticalsContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  groups: {
    name: string;
    intro: string;
    href: string;
    services: { title: string; body: string; href: string }[];
  }[];
}

export interface AccreditationsContent {
  heading: string;
  /** `url` points to the accrediting body — or better, your listing on its register. */
  logos: { name: string; image: string; imageAlt?: string; url?: string }[];
}

/**
 * A type alias rather than an interface: RepeatingFieldList needs an implicit
 * index signature, which a named interface doesn't carry.
 */
export type FeaturedServiceItem = {
  title: string;
  body: string;
  image: string;
  imageAlt?: string;
  linkLabel: string;
  href: string;
};

export interface FeaturedServicesContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  /** Alternating rows; the accreditation strip sits between the second and third. */
  items: FeaturedServiceItem[];
  accreditationHeading: string;
  accreditationBody: string;
}

export interface ProcessContent {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subheading: string;
  steps: { number: string; title: string; body: string }[];
}

export interface BrandsContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  logos: { name: string; image: string; imageAlt?: string }[];
}

export interface StatsContent {
  items: { value: string; label: string; description: string }[];
}

/** One of the two feature cards under the About heading: copy left, image right. */
export interface AboutCard {
  title: string;
  body: string;
  /** Uploaded in the panel. The card renders text-only until one is set. */
  image: string;
  imageAlt: string;
  linkLabel: string;
  href: string;
}

export interface AboutUsSlideContent {
  eyebrow: string;
  heading: string;
  body: string;
  /** Always two — solar on the left, construction on the right. */
  cards: AboutCard[];
}

export interface ProjectsPreviewContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  beforeBadgeLabel: string;
  /** Shown once the divider is dragged past halfway. Falls back to "After". */
  afterBadgeLabel?: string;
  ctaLabel: string;
  /** How many projects the homepage shows. Multiples of the 3-column grid. */
  projectCount: PROJECT_COUNT;
}

/** The grid is three columns, so anything else would leave a ragged last row. */
export const PROJECT_COUNT_OPTIONS = [3, 6, 9] as const;
export type PROJECT_COUNT = (typeof PROJECT_COUNT_OPTIONS)[number];
export const DEFAULT_PROJECT_COUNT: PROJECT_COUNT = 6;

export interface FinanceBannerContent {
  /** Short line above the link, e.g. "Finance options available". */
  heading: string;
  /** Finance provider logo. Falls back to `providerName` as text when unset. */
  logo: string;
  logoAlt: string;
  providerName: string;
  linkLabel: string;
  linkHref: string;
}

export interface PageHeaderContent {
  headingPrefix: string;
  headingHighlight: string;
  subheading: string;
}

export interface AboutPageContent {
  heroHeadingLine1: string;
  heroHeadingHighlight: string;
  heroSubheading: string;
  journeyHeading: string;
  journeyParagraphs: string[];
}

/** Central registry: block key -> its content shape. */
export interface PageContentMap {
  "home-hero": HomeHeroContent;
  "why-us": WhyUsContent;
  "home-why-choose-us": WhyChooseUsContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  areas: AreasContent;
  "core-pillars": CorePillarsContent;
  verticals: VerticalsContent;
  accreditations: AccreditationsContent;
  process: ProcessContent;
  brands: BrandsContent;
  stats: StatsContent;
  "about-us-slide": AboutUsSlideContent;
  "featured-services": FeaturedServicesContent;
  "projects-preview": ProjectsPreviewContent;
  "finance-banner": FinanceBannerContent;
  "services-page-header": PageHeaderContent;
  "locations-page-header": PageHeaderContent;
  "projects-page-header": PageHeaderContent;
  "about-page": AboutPageContent;
}

export type PageContentKey = keyof PageContentMap;

export const PAGE_CONTENT_KEYS = [
  "home-hero",
  "why-us",
  "home-why-choose-us",
  "testimonials",
  "faq",
  "areas",
  "core-pillars",
  "verticals",
  "accreditations",
  "process",
  "brands",
  "stats",
  "about-us-slide",
  "featured-services",
  "projects-preview",
  "finance-banner",
  "services-page-header",
  "locations-page-header",
  "projects-page-header",
  "about-page",
] as const satisfies readonly PageContentKey[];

export interface PageContentMeta {
  label: string;
  group: "Shared Sections" | "Page Headers";
  routes: string[];
}

export const PAGE_CONTENT_META: Record<PageContentKey, PageContentMeta> = {
  "home-hero": { label: "Home Hero", group: "Shared Sections", routes: ["/"] },
  "why-us": { label: "Why Us", group: "Shared Sections", routes: ["/about"] },
  "home-why-choose-us": {
    label: "Why Choose Us (Homeowners)",
    group: "Shared Sections",
    routes: ["/", "/about"],
  },
  testimonials: {
    label: "Testimonials",
    group: "Shared Sections",
    routes: ["/"],
  },
  faq: { label: "FAQ", group: "Shared Sections", routes: ["/"] },
  areas: { label: "Service Areas", group: "Shared Sections", routes: ["/"] },
  "core-pillars": {
    label: "Core Pillars",
    group: "Shared Sections",
    routes: ["(not currently linked from any page)"],
  },
  verticals: { label: "Verticals", group: "Shared Sections", routes: ["/"] },
  accreditations: {
    label: "Accreditations",
    group: "Shared Sections",
    routes: [
      "/services/[slug]",
      "/locations/[locationSlug]",
      "/locations/[locationSlug]/[serviceSlug]",
    ],
  },
  process: {
    label: "Our Process",
    group: "Shared Sections",
    routes: [
      "/",
      "/about",
      "/services",
      "/energy-solutions",
      "/home-solutions",
    ],
  },
  brands: { label: "Brands", group: "Shared Sections", routes: ["/about"] },
  stats: {
    label: "Stats",
    group: "Shared Sections",
    routes: [
      "/",
      "/services/[slug]",
      "/locations/[locationSlug]",
      "/locations/[locationSlug]/[serviceSlug]",
    ],
  },
  "about-us-slide": {
    label: "About Us",
    group: "Shared Sections",
    routes: ["/", "/about"],
  },
  "featured-services": {
    label: "Featured Services",
    group: "Shared Sections",
    routes: ["/"],
  },
  "projects-preview": {
    label: "Our Work (Home Preview)",
    group: "Shared Sections",
    routes: ["/", "/services"],
  },
  "finance-banner": {
    label: "Finance Banner",
    group: "Shared Sections",
    routes: ["/"],
  },
  "services-page-header": {
    label: "Services Page Header",
    group: "Page Headers",
    routes: ["/services"],
  },
  "locations-page-header": {
    label: "Locations Page Header",
    group: "Page Headers",
    routes: ["/locations"],
  },
  "projects-page-header": {
    label: "Projects Page Header",
    group: "Page Headers",
    routes: ["/projects"],
  },
  "about-page": {
    label: "About Page (Hero + Journey)",
    group: "Page Headers",
    routes: ["/about"],
  },
};
