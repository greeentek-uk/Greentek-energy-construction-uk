import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import type { SiteConfig } from "@/data/site";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import ProblemSection from "@/components/sections/ProblemSection";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { withSeoOverride } from "@/lib/seo";
import { buildLocalizedServiceJsonLd, SITE_URL } from "@/lib/structuredData";
import { getLocationServiceContentByKeys } from "@/lib/db/locationServiceContent";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqSection from "@/components/site/FaqSection";
import TrackViewContent from "@/components/site/TrackViewContent";

interface Props {
  params: {
    locationSlug: string;
    serviceSlug: string;
  };
}

function findEntities(
  siteConfig: SiteConfig,
  locationSlug: string,
  serviceSlug: string,
) {
  const location = siteConfig.locations.find((l) => l.slug === locationSlug);
  const service = siteConfig.services.find((s) => s.slug === serviceSlug);
  return { location, service };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug, serviceSlug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const { location, service } = findEntities(siteConfig, locationSlug, serviceSlug);

  if (!location || !service) {
    return { title: "Page Not Found" };
  }

  const override = await getLocationServiceContentByKeys(location.slug, service.slug);

  return withSeoOverride(`/locations/${location.slug}/${service.slug}`, {
    kind: "locationService",
    title: override?.metaTitle || `${service.shortName} in ${location.name}`,
    description:
      override?.metaDescription ||
      `Professional ${service.shortName.toLowerCase()} in ${location.name}, ${location.region}. Free local survey, fixed-price quote and in-house installation team. Also covering ${location.nearbyAreas.join(", ")}.`,
    image: service.image,
    vars: {
      service: service.shortName,
      location: location.name,
      region: location.region,
    },
  });
}

export async function generateStaticParams() {
  const { locations, services } = await getCurrentSiteConfig();
  return locations.flatMap((location) =>
    services.map((service) => ({
      locationSlug: location.slug,
      serviceSlug: service.slug,
    })),
  );
}

export default async function LocationServicePage({ params }: Props) {
  const { locationSlug, serviceSlug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const { location, service } = findEntities(siteConfig, locationSlug, serviceSlug);

  if (!location || !service) {
    notFound();
  }

  const relatedProjects = siteConfig.projects.filter(
    (p) => p.service === service.slug,
  );

  const otherServicesHere = siteConfig.services
    .filter((s) => s.slug !== service.slug)
    .slice(0, 4);


  const override = await getLocationServiceContentByKeys(location.slug, service.slug);

  const localIntro = location.isHomeBase
    ? `As our home base, ${location.name} gets same-week surveys and the fastest turnaround on ${service.shortName.toLowerCase()} work.`
    : `Our in-house team covers ${location.name} and the surrounding ${location.region} regularly for ${service.shortName.toLowerCase()} projects, with no subcontractors passing the job around.`;

  const introText = override?.intro || service.description;
  const localNoteText = override?.localNote || localIntro;
  const highlights = override?.highlights?.length ? override.highlights : service.highlights;

  const jsonLd = buildLocalizedServiceJsonLd(service, location, siteConfig, SITE_URL);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/locations/${location.slug}/${service.slug}`} defaultJsonLd={jsonLd} />
      <TrackViewContent
        name={`${service.title} in ${location.name}`}
        category={service.formCategory}
        id={service.slug}
      />
      <Breadcrumbs
        crumbs={[
          { label: "Locations", href: "/locations" },
          { label: location.name, href: `/locations/${location.slug}` },
          { label: service.shortName },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/*
          Hero. The service is fixed here too, so the form skips that question
          — the reader has already picked both a service and an area to land on
          this URL.

          The standalone cover image that used to sit under this hero is gone:
          the hero now renders the same service photo full-bleed behind the
          copy, so keeping it would show the identical image twice in a row.
        */}
        <PageQuoteHero
          image={service.heroImage || service.image}
          imageAlt={
            service.heroImageAlt ||
            service.imageAlt ||
            `${service.title} in ${location.name}`
          }
          heading={`${service.shortName} in`}
          headingHighlight={location.name}
          body={introText}
          secondaryBody={localNoteText}
          source={`${service.title} in ${location.name}`}
          fixedService={{ value: service.formCategory, label: service.title }}
        />

        <FinanceBanner />

        {/* The reader's problem, named before the page describes the fix.
            Service-level content, so a location + service page shows its
            service's block. */}
        <ProblemSection content={service.problem} />

        {/* Highlights */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
              What&apos;s Included
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {highlights.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4"
                >
                  <span className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-[#c5eb02] flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-lg text-white/80 leading-relaxed font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Nearby areas */}
            <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm mb-3 font-medium">
                We also deliver {service.shortName.toLowerCase()} work near{" "}
                {location.name} in:
              </p>
              <div className="flex flex-wrap gap-2">
                {location.nearbyAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Stats />

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-10 lg:py-16">
            <div className="site-container">
              <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-2">
                {service.shortName} Work
              </h3>
              <p className="text-white/60 text-sm mb-8">
                Examples of completed {service.shortName.toLowerCase()} work
                from our in-house team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {relatedProjects.map((project) => (
                  <div key={project.slug}>
                    <BeforeAfterSlider
                      before={project.before}
                      after={project.after}
                      title={project.title}
                      beforeAlt={project.beforeAlt}
                      afterAlt={project.afterAlt}
                      className="h-72"
                    />
                    <div className="pt-4">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="group"
                      >
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-[#c5eb02] transition-colors">
                          {project.title}
                        </h4>
                      </Link>
                      <p className="text-white/70 text-sm">
                        {project.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quote form */}
        <div id="quote">
          <FaqSection faqs={override?.faqs} />
          <CtaSection
            eyebrow="Free Local Quote"
            heading={`Get a Free ${service.shortName} Quote in ${location.name}`}
            description={`Tell us about your ${service.shortName.toLowerCase()} project in ${location.name} and we'll come back within one business day with a straight answer, a plan and a real quote.`}
            defaultService={service.formCategory}
          />
        </div>

        <AccreditationsSection />

        {/* Other services in this location */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
              Other Services in {location.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherServicesHere.map((other) => (
                <Link
                  key={other.slug}
                  href={`/locations/${location.slug}/${other.slug}`}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                    {other.shortName}
                  </h4>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Learn More →
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/locations/${location.slug}`}
                className="text-[#c5eb02] font-bold text-sm hover:text-[#c5eb02]/80"
              >
                ← All services in {location.name}
              </Link>
              <Link
                href={`/services/${service.slug}`}
                className="text-[#c5eb02] font-bold text-sm hover:text-[#c5eb02]/80"
              >
                More about {service.title} →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
