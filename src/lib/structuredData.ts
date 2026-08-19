import type { SiteConfig, Service, Location } from "@/data/site";
import type { BlogPost } from "@/data/blogs";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.greentekenergy.co.uk";

/** Org-wide LocalBusiness schema, rendered once in the root layout — makes the business eligible for Google's Local Pack / rich results. */
export function buildLocalBusinessJsonLd(siteConfig: SiteConfig, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postcode,
      addressCountry: "GB",
    },
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
    ].filter(Boolean),
    areaServed: siteConfig.locations.map((l) => l.name),
  };
}

export function buildServiceJsonLd(
  service: Service,
  siteConfig: SiteConfig,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
      telephone: siteConfig.phone,
    },
    areaServed: siteConfig.locations.map((l) => l.name),
    url: `${siteUrl}/services/${service.slug}`,
  };
}

/** LocalBusiness schema scoped to one service area, for a /locations/[locationSlug] page. */
export function buildLocationJsonLd(
  location: Location,
  siteConfig: SiteConfig,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${siteConfig.name} — ${location.name}`,
    description: location.metaDescription || location.blurb,
    url: `${siteUrl}/locations/${location.slug}`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    ...(location.isHomeBase
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.address.line1,
            addressLocality: siteConfig.address.city,
            addressRegion: siteConfig.address.region,
            postalCode: siteConfig.address.postcode,
            addressCountry: "GB",
          },
        }
      : {}),
    areaServed: [location.name, ...location.nearbyAreas],
  };
}

/** Service schema scoped to one location, for a /locations/[locationSlug]/[serviceSlug] page. */
export function buildLocalizedServiceJsonLd(
  service: Service,
  location: Location,
  siteConfig: SiteConfig,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} in ${location.name}`,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
      telephone: siteConfig.phone,
    },
    areaServed: [location.name, ...location.nearbyAreas],
    url: `${siteUrl}/locations/${location.slug}/${service.slug}`,
  };
}

export function buildBlogPostingJsonLd(post: BlogPost, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${siteUrl}${post.coverImage}`,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Greentek",
    },
    url: `${siteUrl}/blog/${post.slug}`,
  };
}
