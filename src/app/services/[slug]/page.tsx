import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import ProblemSection from "@/components/sections/ProblemSection";
import ProjectCaseStudy from "@/components/sections/ProjectCaseStudy";
import ServicePricingSection from "@/components/sections/ServicePricingSection";
import Testimonials from "@/components/sections/Testimonials";
import Process from "@/components/sections/Process";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import ContentBlocks from "@/components/ui/ContentBlocks";
import { caseStudyLabels, label } from "@/data/pageSections";
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


  // Per-page section overrides; anything unset falls back to the shared copy.
  const sections = service.sections;

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
          heading={label(sections, "heroHeading", service.title)}
          headingHighlight={sections?.labels?.heroHighlight?.trim() || undefined}
          body={label(sections, "heroBody", service.description)}
          source={`Service page — ${service.title}`}
          fixedService={{ value: service.formCategory, label: service.title }}
        />

        <FinanceBanner />

        {/* 2 — The reader's problem and who this is for, named before the
            page describes the fix. Service-level content, so a location +
            service page shows its service's block. */}
        <ProblemSection content={service.problem} eyebrow={sections?.labels?.problemEyebrow} />

        {/* 3 — What the service includes */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
              {label(sections, "includedHeading", "What's Included")}
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

        {/* 3b — Long-form body copy, for the SEO team to expand */}
        {service.content && service.content.length > 0 && (
          <section className="pb-10 lg:pb-16">
            <div className="site-container">
              <ContentBlocks blocks={service.content} />
            </div>
          </section>
        )}

        {/* 4 — Proof: a real job, the numbers behind it, and customers by name. */}
        {caseStudy && (
          <ProjectCaseStudy project={caseStudy} labels={caseStudyLabels(sections)} />
        )}
        <Stats override={sections?.stats} />
        <Testimonials
          eyebrow={sections?.labels?.testimonialsEyebrow}
          heading={sections?.labels?.testimonialsHeading}
          subheading={sections?.labels?.testimonialsSubheading}
        />

        {/* 5 — How we work */}
        <Process override={sections?.process} />

        {/* 6 — Credentials */}
        <AccreditationsSection heading={sections?.labels?.accreditationsHeading} />

        {/* 7 — What it costs. No figures: everything is quoted after a survey. */}
        <ServicePricingSection
          content={service.pricing}
          eyebrow={sections?.labels?.pricingEyebrow}
          includedHeading={sections?.labels?.pricingIncludedHeading}
        />

        {/* 8 — FAQs, also emitted as FAQPage schema by the component. */}
        <FaqSection
          faqs={service.faqs}
          heading={label(sections, "faqHeading", "Frequently asked questions")}
        />

        {/* 9 — Final CTA. #quote is the target every button on the page uses. */}
        <div id="quote">
          <CtaSection
            eyebrow={label(sections, "ctaEyebrow", "Free Quote")}
            heading={label(sections, "ctaHeading", `Get a Free ${service.shortName} Quote`)}
            description={label(
              sections,
              "ctaDescription",
              `Tell us about your ${service.shortName.toLowerCase()} project and we'll come back within one business day with a straight answer, a plan and a real quote.`,
            )}
            defaultService={service.formCategory}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
