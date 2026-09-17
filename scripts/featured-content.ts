/**
 * Seed content for the Featured Services section and the full accreditation
 * list. Shared by the page-content seed and the one-off backfill below, so the
 * two can't disagree.
 *
 * Accreditation links were each checked to resolve to the right organisation.
 * Two traps worth knowing: qualitymark.org.uk is an unrelated food blog (the
 * real site is qualitymark.co.uk), and british-assessment.co.uk now redirects
 * to Amtivo, which acquired it.
 */
import type { AccreditationsContent, FeaturedServicesContent } from "../src/data/pageContent";

export const FEATURED_SERVICES: FeaturedServicesContent = {
  eyebrow: "Featured Services",
  heading: "The Work We're Known For",
  subheading:
    "From complete renovations to low-carbon heating, delivered by one accredited in-house team.",
  items: [
    {
      title: "Full Home Renovations",
      body: "Complete home renovation from start to finish, transforming the property throughout to the highest standard, with one accountable team managing every stage.",
      image: "/images/projects/full-home-renovation.jpg",
      imageAlt: "",
      linkLabel: "Find out more",
      href: "/services/full-home-renovation",
    },
    {
      title: "Kitchen & Bathroom Renovations",
      body: "Kitchen and bathroom refurbishments delivered from design through to installation and final finishing.",
      image: "/images/projects/kitchen-conversion.jpg",
      imageAlt: "",
      linkLabel: "Find out more",
      href: "/services/kitchen-renovations",
    },
    {
      title: "Air Source Heat Pumps",
      body: "Efficient air source heat pumps for residential and commercial properties, providing sustainable, lower-carbon heating.",
      image: "/images/projects/Heating/after.webp",
      imageAlt: "",
      linkLabel: "Find out more",
      href: "/services/air-source-heat-pump-installations",
    },
    {
      title: "External Wall Insulation",
      body: "External wall insulation and rendering that improves thermal performance, protects your walls and refreshes your home's appearance.",
      image: "/images/projects/External Wall Insulation/after.jpg",
      imageAlt: "",
      linkLabel: "Find out more",
      href: "/services/external-wall-insulation-rendering",
    },
  ],
  accreditationHeading: "Certified and accredited with",
  accreditationBody: "",
};

export const ACCREDITATION_LOGOS: AccreditationsContent["logos"] = [
  { name: "MCS Certified", image: "/images/accreditations/image-808x1024.png", imageAlt: "MCS Certified", url: "https://mcscertified.com" },
  { name: "TrustMark", image: "/images/accreditations/trustmark.png", imageAlt: "TrustMark Government Endorsed Quality", url: "https://www.trustmark.org.uk" },
  { name: "Gas Safe Register", image: "/images/accreditations/gas-safe.png", imageAlt: "Gas Safe Register", url: "https://www.gassaferegister.co.uk" },
  { name: "HIES", image: "/images/accreditations/hies.png", imageAlt: "HIES accredited", url: "https://hies.org.uk" },
  { name: "Amtivo", image: "/images/accreditations/amtivo-logo-new.png", imageAlt: "Amtivo certified", url: "https://amtivo.com" },
  { name: "CHAS", image: "/images/accreditations/chas.png", imageAlt: "CHAS accredited contractor", url: "https://www.chas.co.uk" },
  { name: "SWIGA", image: "/images/accreditations/swiga.png", imageAlt: "SWIGA member", url: "https://www.swiga.co.uk" },
  { name: "Qualitymark Protection", image: "/images/accreditations/qualitymark.png", imageAlt: "Qualitymark Protection accredited", url: "https://qualitymark.co.uk" },
  { name: "British Assessment Bureau", image: "/images/accreditations/post-fallback-bab-img.png", imageAlt: "British Assessment Bureau certified", url: "https://amtivo.com/uk/" },
];
