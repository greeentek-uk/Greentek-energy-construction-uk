import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/data/site";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { withSeoOverride } from "@/lib/seo";

interface Props {
  params: {
    locationSlug: string;
    serviceSlug: string;
  };
}

function findEntities(locationSlug: string, serviceSlug: string) {
  const location = siteConfig.locations.find((l) => l.slug === locationSlug);
  const service = siteConfig.services.find((s) => s.slug === serviceSlug);
  return { location, service };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug, serviceSlug } = await params;
  const { location, service } = findEntities(locationSlug, serviceSlug);

  if (!location || !service) {
    return { title: "Page Not Found" };
  }

  return withSeoOverride(`/locations/${location.slug}/${service.slug}`, {
    title: `${service.shortName} in ${location.name}`,
    description: `Professional ${service.shortName.toLowerCase()} in ${location.name}, ${location.region}. Free local survey, fixed-price quote and in-house installation team. Also covering ${location.nearbyAreas.join(", ")}.`,
  });
}

export function generateStaticParams() {
  return siteConfig.locations.flatMap((location) =>
    siteConfig.services.map((service) => ({
      locationSlug: location.slug,
      serviceSlug: service.slug,
    })),
  );
}

export default async function LocationServicePage({ params }: Props) {
  const { locationSlug, serviceSlug } = await params;
  const { location, service } = findEntities(locationSlug, serviceSlug);

  if (!location || !service) {
    notFound();
  }

  const relatedProjects = siteConfig.projects.filter(
    (p) => p.service === service.slug,
  );

  const otherServicesHere = siteConfig.services
    .filter((s) => s.slug !== service.slug)
    .slice(0, 4);

  const phoneHref = `tel:${siteConfig.phone.replace(/\s/g, "")}`;

  const localIntro = location.isHomeBase
    ? `As our home base, ${location.name} gets same-week surveys and the fastest turnaround on ${service.shortName.toLowerCase()} work.`
    : `Our in-house team covers ${location.name} and the surrounding ${location.region} regularly for ${service.shortName.toLowerCase()} projects, with no subcontractors passing the job around.`;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6 flex flex-col items-center justify-center text-center">
            <div className="flex flex-wrap items-center gap-2 text-sm mb-6">
              <Link
                href="/locations"
                className="text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
              >
                Locations
              </Link>
              <span className="text-white/40">/</span>
              <Link
                href={`/locations/${location.slug}`}
                className="text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
              >
                {location.name}
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white/60">{service.shortName}</span>
            </div>

            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6">
              {service.shortName} in{" "}
              <span className="text-[#c5eb02]">{location.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium max-w-3xl mb-4">
              {service.description}
            </p>
            <p className="text-lg text-white/70 leading-relaxed font-medium max-w-3xl mb-8">
              {localIntro}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#quote"
                className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
              >
                Get a Free Quote in {location.name}
              </Link>
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm font-bold hover:border-[#c5eb02] hover:text-[#c5eb02] transition-all"
              >
                <Phone className="w-4 h-4" />
                Call {siteConfig.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Cover Image */}
        <div className="relative h-96 md:h-125 w-full bg-black overflow-hidden flex items-center justify-center border-b border-[#c5eb02]">
          <Image
            src={service.image}
            alt={`${service.title} in ${location.name}`}
            fill
            className="object-contain object-center"
            priority
          />
        </div>

        {/* Highlights */}
        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {service.highlights.map((item, idx) => (
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
          <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
            <div className="mx-auto max-w-6xl px-6">
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
          <CtaSection
            eyebrow="Free Local Quote"
            heading={`Get a Free ${service.shortName} Quote in ${location.name}`}
            description={`Tell us about your ${service.shortName.toLowerCase()} project in ${location.name} and we'll come back within one business day with a straight answer, a plan and a real quote.`}
            defaultService={service.formCategory}
          />
        </div>

        <AccreditationsSection />

        {/* Other services in this location */}
        <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-6xl px-6">
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
