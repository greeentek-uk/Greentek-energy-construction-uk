import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import ProblemSection from "@/components/sections/ProblemSection";
import ProjectCaseStudy from "@/components/sections/ProjectCaseStudy";
import Process from "@/components/sections/Process";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import ContentBlocks from "@/components/ui/ContentBlocks";
import { withSeoOverride } from "@/lib/seo";
import { buildServiceJsonLd, SITE_URL } from "@/lib/structuredData";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqSection from "@/components/site/FaqSection";
import TrackViewContent from "@/components/site/TrackViewContent";

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
    kind: "service",
    title: service.metaTitle || service.title,
    description: service.metaDescription || service.description,
    image: service.image,
    vars: { service: service.title },
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

  // The project picked in the panel, else this service's own first project.
  // No fallback to an unrelated job: a solar install shown as the kitchen
  // page's case study would mislead, so with neither there's no case study.
  const caseStudy =
    siteConfig.projects.find((p) => p.slug === service.caseStudyProject) ??
    siteConfig.projects.find((p) => p.service === service.slug);


  const jsonLd = buildServiceJsonLd(service, siteConfig, SITE_URL);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/services/${service.slug}`} defaultJsonLd={jsonLd} />
      <TrackViewContent
        name={service.title}
        category={service.formCategory}
        id={service.slug}
      />
      <Breadcrumbs
        crumbs={[
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero — the service is fixed, so the form doesn't ask for it. */}
        <PageQuoteHero
          image={service.heroImage || service.image}
          imageAlt={service.heroImageAlt || service.imageAlt || service.title}
          heading={service.title}
          body={service.description}
          source={`Service page — ${service.title}`}
          fixedService={{ value: service.formCategory, label: service.title }}
        />

        <FinanceBanner />

        {/* The reader's problem, named before the page describes the fix.
            Service-level content, so a location + service page shows its
            service's block. */}
        <ProblemSection content={service.problem} />

        {/* Highlights Section */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
              What&apos;s Included
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
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

        {/* Long-form content */}
        {service.content && service.content.length > 0 && (
          <section className="pb-10 lg:pb-16">
            <div className="site-container">
              <ContentBlocks blocks={service.content} />
            </div>
          </section>
        )}

        {/* Trust bar */}
        <Stats />

        {/* Case study: the project picked in the panel, or this service's
            own. The only project display on the page — no card grid. */}
        {caseStudy && <ProjectCaseStudy project={caseStudy} />}

        {/* Quote Form */}
        <div id="quote">
          <FaqSection faqs={service.faqs} />
          <CtaSection
            eyebrow="Free Quote"
            heading={`Get a Free ${service.shortName} Quote`}
            description={`Tell us about your ${service.shortName.toLowerCase()} project and we'll come back within one business day with a straight answer, a plan and a real quote.`}
            defaultService={service.formCategory}
          />
        </div>

        <Process />
        <AccreditationsSection />
      </main>

      <Footer />
    </div>
  );
}
