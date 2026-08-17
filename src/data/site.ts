export interface Service {
  slug: string;
  title: string;
  shortName: string;
  description: string;
  image: string;
  formCategory: string;
  highlights: string[];
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
