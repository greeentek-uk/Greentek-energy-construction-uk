export interface HomeHeroContent {
  trustBadgeSuffix: string;
  headingLine1: string;
  headingLine2: string;
  body: string;
  ctaLabel: string;
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
  items: { id: string; title: string; description: string; image: string }[];
}

export interface TestimonialsContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: { name: string; quote: string; role: string; rating: number; image: string }[];
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
  largeArea: { name: string; stat: string; note: string; image: string; path: string };
  smallAreas: { name: string; image: string; path: string }[];
  tickerItems: string[];
  tickerLabel: string;
  ctaLabel: string;
}

export interface CorePillarsContent {
  heading: string;
  intro: string;
  pillars: { label: string; title: string; description: string; items: string[] }[];
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
  logos: { name: string; image: string }[];
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
  logos: { name: string; image: string }[];
}

export interface StatsContent {
  items: { value: string; label: string; description: string }[];
}

export interface AboutUsSlideContent {
  eyebrow: string;
  heading: string;
  body: string;
}

export interface ProjectsPreviewContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  beforeBadgeLabel: string;
  ctaLabel: string;
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
  "projects-preview": ProjectsPreviewContent;
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
  "projects-preview",
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
  testimonials: { label: "Testimonials", group: "Shared Sections", routes: ["/"] },
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
    routes: ["/services/[slug]", "/locations/[locationSlug]", "/locations/[locationSlug]/[serviceSlug]"],
  },
  process: {
    label: "Our Process",
    group: "Shared Sections",
    routes: ["/", "/about", "/services", "/energy-solutions", "/home-solutions"],
  },
  brands: { label: "Brands", group: "Shared Sections", routes: ["/about"] },
  stats: {
    label: "Stats",
    group: "Shared Sections",
    routes: ["/", "/services/[slug]", "/locations/[locationSlug]", "/locations/[locationSlug]/[serviceSlug]"],
  },
  "about-us-slide": { label: "About Us (Home Slide)", group: "Shared Sections", routes: ["/", "/about"] },
  "projects-preview": { label: "Our Work (Home Preview)", group: "Shared Sections", routes: ["/", "/services"] },
  "services-page-header": { label: "Services Page Header", group: "Page Headers", routes: ["/services"] },
  "locations-page-header": { label: "Locations Page Header", group: "Page Headers", routes: ["/locations"] },
  "projects-page-header": { label: "Projects Page Header", group: "Page Headers", routes: ["/projects"] },
  "about-page": { label: "About Page (Hero + Journey)", group: "Page Headers", routes: ["/about"] },
};
