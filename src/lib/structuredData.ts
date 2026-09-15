import type { SiteConfig, Service, Location } from "@/data/site";
import type { BlogPost } from "@/data/blogs";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const fallback = "https://www.greentekenergy.co.uk";
  if (!configured) return fallback;

  // Every canonical tag, sitemap entry, JSON-LD url and llms.txt link is built
  // from this value. A localhost value copied from .env.local into a hosting
  // dashboard would publish a site that points entirely at localhost — so on a
  // real deploy that is a hard failure rather than a silent one. Local
  // production builds are left alone.
  const isDeployment = Boolean(process.env.VERCEL || process.env.CI);
  if (isDeployment && /localhost|127\.0\.0\.1/.test(configured)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is "${configured}" on a deployed build. ` +
        `Set it to the public site origin (e.g. ${fallback}) — otherwise every ` +
        `canonical URL, sitemap entry and schema link will point at localhost.`,
    );
  }

  return configured.replace(/\/$/, "");
}

export const SITE_URL = resolveSiteUrl();

/** Org-wide LocalBusiness schema, rendered once in the root layout — makes the business eligible for Google's Local Pack / rich results. */
export function buildLocalBusinessJsonLd(siteConfig: SiteConfig, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.localSeo?.businessType || "LocalBusiness",
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
    ...localSeoFields(siteConfig),
  };
}

/**
 * The admin-entered Local SEO fields, in the shape schema.org expects.
 *
 * Split out so the same block can be reused by any business-type schema, and
 * so an unset field is omitted entirely rather than emitted empty — Google
 * treats a blank `priceRange` as a malformed value, not an absent one.
 */
function localSeoFields(siteConfig: SiteConfig) {
  const local = siteConfig.localSeo;
  if (!local) return {};

  const hours = (local.openingHours ?? [])
    .filter((entry) => entry.days.trim())
    .map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: entry.days.split(",").map((d) => d.trim()).filter(Boolean),
      ...(entry.closed ? { opens: "00:00", closes: "00:00" } : {}),
      ...(!entry.closed && entry.opens ? { opens: entry.opens } : {}),
      ...(!entry.closed && entry.closes ? { closes: entry.closes } : {}),
    }));

  return {
    ...(local.priceRange ? { priceRange: local.priceRange } : {}),
    ...(local.latitude && local.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: local.latitude,
            longitude: local.longitude,
          },
        }
      : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
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
