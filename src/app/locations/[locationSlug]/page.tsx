import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import { withSeoOverride } from "@/lib/seo";

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
    title: `Construction & Renewable Energy Services in ${location.name}`,
    description: `Greentek installs solar PV, air source heat pumps, insulation and full property renovations in ${location.name}, ${location.region}. Free local survey and fixed-price quote.`,
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

  const otherLocations = siteConfig.locations
    .filter((l) => l.slug !== location.slug)
    .slice(0, 3);

  const phoneHref = `tel:${siteConfig.phone.replace(/\s/g, "")}`;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#c5eb02]">
          <div className="relative min-h-[560px] md:min-h-[620px] w-full">
            <Image
              src={location.image}
              alt={location.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative z-10 h-full flex flex-col items-center justify-end px-6 py-12 max-w-4xl mx-auto">
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 text-[#c5eb02] font-bold text-sm mb-6 hover:text-[#c5eb02]/80 w-fit"
              >
                ← All Areas
              </Link>
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-4 mx-auto text-center">
                Renewable Energy & Construction in{" "}
                <span className="text-[#c5eb02]">{location.name}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl mb-8 text-center">
                {location.blurb}
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#quote"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
                >
                  Get a Free Quote for {location.name}
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
          </div>
        </section>

        {/* Services in this location */}
        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4">
              Services in {location.name}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl">
              Every service below is delivered by our in-house team local to{" "}
              {location.name} and the wider {location.region} area.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {siteConfig.services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/locations/${location.slug}/${service.slug}`}
                  className="group relative rounded-xl bg-[#101314] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col sm:flex-row gap-0 sm:gap-6"
                >
                  <div className="w-full h-48 sm:h-auto sm:w-[40%]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-full sm:w-[60%] py-4 px-6 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-bold leading-[1.3] text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                      {service.shortName} in {location.name}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Stats />

        {/* Nearby areas */}
        <section className="py-12 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6">
            <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-6">
              Also Covering Nearby
            </h3>
            <div className="flex flex-wrap gap-3">
              {location.nearbyAreas.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Quote form */}
        <div id="quote">
          <CtaSection
            eyebrow="Free Local Quote"
            heading={`Get a Free Quote in ${location.name}`}
            description={`Tell us about your solar, heating, insulation or renovation project in ${location.name} and we'll come back within one business day with a straight answer, a plan and a real quote.`}
          />
        </div>

        <AccreditationsSection />

        {/* Other locations */}
        <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
              Other Areas We Cover
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherLocations.map((other) => (
                <Link
                  key={other.slug}
                  href={`/locations/${other.slug}`}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <p className="text-[10px] font-semibold uppercase mb-3 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit">
                    {other.region}
                  </p>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                    {other.name}
                  </h4>
                  <p className="text-white/70 text-sm mb-4">{other.tagline}</p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    View Area →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
