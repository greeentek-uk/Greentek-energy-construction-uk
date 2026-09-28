import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import { ServiceCardGrid } from "@/components/site/ServiceCards";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import Stats from "@/components/sections/Stats";
import ProjectCaseStudy from "@/components/sections/ProjectCaseStudy";
import Testimonials from "@/components/sections/Testimonials";
import Process from "@/components/sections/Process";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import ContentBlocks from "@/components/ui/ContentBlocks";
import { caseStudyLabels, label } from "@/data/pageSections";
import { withSeoOverride } from "@/lib/seo";
import { getLocationServiceContentForLocation } from "@/lib/db/locationServiceContent";
import { buildLocationJsonLd, SITE_URL } from "@/lib/structuredData";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqSection from "@/components/site/FaqSection";

interface Props {
  params: {
    locationSlug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const location = siteConfig.locations.find((l) => l.slug === locationSlug);

  if (!location) {
    return { title: "Location Not Found" };
  }

  return withSeoOverride(`/locations/${location.slug}`, {
    kind: "location",
    title:
      location.metaTitle ||
      `Construction & Renewable Energy Services in ${location.name}`,
    description:
      location.metaDescription ||
      `Greentek installs solar PV, air source heat pumps, insulation and full property renovations in ${location.name}, ${location.region}. Free local survey and fixed-price quote.`,
    image: location.image,
    vars: { location: location.name, region: location.region },
  });
}

export async function generateStaticParams() {
  const { locations } = await getCurrentSiteConfig();
  return locations.map((location) => ({
    locationSlug: location.slug,
  }));
}

export default async function LocationDetailPage({ params }: Props) {
  const { locationSlug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const location = siteConfig.locations.find((l) => l.slug === locationSlug);

  if (!location) {
    notFound();
  }

  // Every service, pointed at its combination page for this area. Each card's
  // wording is edited on that combination page, since the title is the anchor
  // text of the link to it.
  const comboBySlug = new Map(
    (await getLocationServiceContentForLocation(location.slug)).map((c) => [c.serviceSlug, c]),
  );
  const serviceCards = siteConfig.services.map((service) => {
    const combo = comboBySlug.get(service.slug);
    return {
      title: combo?.cardTitle || `${service.shortName} in ${location.name}`,
      body: combo?.cardText || service.description,
      href: `/locations/${location.slug}/${service.slug}`,
    };
  });

  const sections = location.sections;

  // Only the project picked for this area: projects carry no location, so any
  // automatic choice could present a job done elsewhere as local proof.
  const caseStudy = siteConfig.projects.find((p) => p.slug === location.caseStudyProject);

  const jsonLd = buildLocationJsonLd(location, siteConfig, SITE_URL);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/locations/${location.slug}`} defaultJsonLd={jsonLd} />
      <Breadcrumbs
        crumbs={[
          { label: "Locations", href: "/locations" },
          { label: location.name },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero — a location covers every service, so the form still asks which. */}
        <PageQuoteHero
          image={location.heroImage || location.image}
          imageAlt={location.heroImageAlt || location.imageAlt || location.name}
          heading={label(
            sections,
            "heroHeading",
            `Renewable Energy & Construction in ${location.name}`,
          )}
          // Unedited, the location name stays green as it always has. Once the
          // H1 is rewritten, only the words the editor names are highlighted.
          headingHighlight={
            sections?.labels?.heroHighlight?.trim() ||
            (sections?.labels?.heroHeading?.trim() ? undefined : location.name)
          }
          body={label(sections, "heroBody", location.blurb)}
          source={`Location page — ${location.name}`}
        />

        <FinanceBanner />

        {/* Services in this location */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4">
              {label(sections, "servicesHeading", `Services in ${location.name}`)}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl">
              {label(
                sections,
                "servicesIntro",
                `Every service below is delivered by our in-house team local to ${location.name} and the wider ${location.region} area.`,
              )}
            </p>
            {/* The same card the vertical pages and the homepage use. */}
            <ServiceCardGrid services={serviceCards} />
          </div>
        </section>

        {/* The towns around this one, which have no page of their own. */}
        <section className="pb-10 lg:pb-16">
          <div className="site-container">
            <div className="p-6 md:p-8 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-[1.375rem] md:text-[1.75rem] font-bold leading-[1.2] text-white mb-3">
                {label(sections, "areasHeading", `Areas we cover around ${location.name}`)}
              </h2>
              <p className="text-white/70 text-base md:text-lg mb-5 max-w-3xl">
                {label(
                  sections,
                  "areasIntro",
                  `The same in-house team that works in ${location.name} covers the towns around it, with the same free survey, fixed-price quote and written workmanship warranty.`,
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {location.nearbyAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Long-form content */}
        {location.content && location.content.length > 0 && (
          <section className="pb-10 lg:pb-16">
            <div className="site-container">
              <ContentBlocks blocks={location.content} />
            </div>
          </section>
        )}

        {/* Proof: a job picked for this area, the numbers, customers by name. */}
        <Stats override={sections?.stats} />
        {caseStudy && (
          <ProjectCaseStudy project={caseStudy} labels={caseStudyLabels(sections)} />
        )}
        <Testimonials
          eyebrow={sections?.labels?.testimonialsEyebrow}
          heading={sections?.labels?.testimonialsHeading}
          subheading={sections?.labels?.testimonialsSubheading}
        />

        {/* How we work */}
        <Process override={sections?.process} />

        {/* Quote form */}
        <div id="quote">
          <FaqSection
            faqs={location.faqs}
            heading={label(sections, "faqHeading", "Frequently asked questions")}
          />
          <CtaSection
            eyebrow={label(sections, "ctaEyebrow", "Free Local Quote")}
            heading={label(sections, "ctaHeading", `Get a Free Quote in ${location.name}`)}
            description={label(
              sections,
              "ctaDescription",
              `Tell us about your solar, heating, insulation or renovation project in ${location.name} and we'll come back within one business day with a straight answer, a plan and a real quote.`,
            )}
          />
        </div>

        <AccreditationsSection heading={sections?.labels?.accreditationsHeading} />
      </main>

      <Footer />
    </div>
  );
}
