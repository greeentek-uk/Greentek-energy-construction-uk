import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import Process from "@/components/sections/Process";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { withSeoOverride } from "@/lib/seo";
import { buildServiceJsonLd, SITE_URL } from "@/lib/structuredData";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const service = siteConfig.services.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return withSeoOverride(`/services/${service.slug}`, {
    title: service.title,
    description: service.description,
  });
}

export async function generateStaticParams() {
  const { services } = await getCurrentSiteConfig();
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const service = siteConfig.services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const relatedProjects = siteConfig.projects.filter(
    (p) => p.service === service.slug,
  );
  const fallbackProjects = relatedProjects.length
    ? []
    : siteConfig.projects.slice(0, 2);

  const otherServices = siteConfig.services
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  const phoneHref = `tel:${siteConfig.phone.replace(/\s/g, "")}`;
  const jsonLd = buildServiceJsonLd(service, siteConfig, SITE_URL);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${service.image})` }}
        >
          <div className="bg-black/60 pt-30 py-20">
            <div className="mx-auto max-w-4xl px-6">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[#c5eb02] font-bold text-sm mb-6 hover:text-[#c5eb02]/80"
              >
                ← All Services
              </Link>
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6">
                {service.title}
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-3xl mb-8">
                {service.description}
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#quote"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
                >
                  Get a Free {service.shortName} Quote
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

        {/* Highlights Section */}
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
          </div>
        </section>

        {/* Trust bar */}
        <Stats />

        {/* Related Projects */}
        {(relatedProjects.length > 0 || fallbackProjects.length > 0) && (
          <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
            <div className="mx-auto max-w-6xl px-6">
              <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-2">
                {relatedProjects.length > 0
                  ? `${service.title} Projects`
                  : "From Our Project Gallery"}
              </h3>
              <p className="text-white/60 text-sm mb-8">
                {relatedProjects.length > 0
                  ? `Real ${service.shortName.toLowerCase()} work completed by our in-house team.`
                  : "More examples of our completed work."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {(relatedProjects.length > 0
                  ? relatedProjects
                  : fallbackProjects
                ).map((project) => (
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
                      <p className="text-white/70 text-sm mb-2">
                        {project.description}
                      </p>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-[#c5eb02] font-bold text-sm hover:text-[#c5eb02]/80"
                      >
                        View Project →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quote Form */}
        <div id="quote">
          <CtaSection
            eyebrow="Free Quote"
            heading={`Get a Free ${service.shortName} Quote`}
            description={`Tell us about your ${service.shortName.toLowerCase()} project and we'll come back within one business day with a straight answer, a plan and a real quote.`}
            defaultService={service.formCategory}
          />
        </div>

        <Process />
        <AccreditationsSection />

        {/* Other Services */}
        <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
              Other Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherServices.map((other) => (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                    {other.title}
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    {other.description}
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Learn More →
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
