import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import ProblemSection from "@/components/sections/ProblemSection";
import ServicePricingSection from "@/components/sections/ServicePricingSection";
import ProjectOwnerReview from "@/components/sections/ProjectOwnerReview";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import Process from "@/components/sections/Process";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import ContentBlocks from "@/components/ui/ContentBlocks";
import CtaSection from "@/components/sections/CtaSection";
import FaqSection from "@/components/site/FaqSection";
import { label, type PageSectionOverrides } from "@/data/pageSections";
import { withSeoOverride } from "@/lib/seo";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const project = siteConfig.projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return withSeoOverride(`/projects/${project.slug}`, {
    kind: "project",
    title: project.title,
    description: project.description,
    image: project.after,
    vars: { category: project.category },
  });
}

export async function generateStaticParams() {
  const { projects } = await getCurrentSiteConfig();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const siteConfig = await getCurrentSiteConfig();
  const project = siteConfig.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const otherProjects = siteConfig.projects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  const relatedService = siteConfig.services.find(
    (s) => s.slug === project.service,
  );

  // This project's own wording first, then the service it belongs to, then the
  // shared defaults — so a service's steps cover its case studies too.
  const sections: PageSectionOverrides = {
    labels: { ...relatedService?.sections?.labels, ...project.sections?.labels },
    process: project.sections?.process ?? relatedService?.sections?.process,
    stats: project.sections?.stats ?? relatedService?.sections?.stats,
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/projects/${project.slug}`} />
      <Breadcrumbs
        crumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* 1 — Same hero as the service pages: the finished job behind the
            copy and the quote form, with the service already chosen. */}
        <PageQuoteHero
          image={project.after || project.before}
          imageAlt={project.afterAlt || `${project.title} — after`}
          heading={project.title}
          body={project.description}
          source={`Project page — ${project.title}`}
          {...(relatedService
            ? {
                fixedService: {
                  value: relatedService.formCategory,
                  label: relatedService.title,
                },
              }
            : {})}
        />

        {/* 2 — The before and after, then the write-up. The photos are the
            point of a case study, so they come straight after the hero. */}
        {/* Before / After Slider */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <BeforeAfterSlider
              before={project.before}
              after={project.after}
              title={project.title}
              beforeAlt={project.beforeAlt}
              afterAlt={project.afterAlt}
              sizes="(min-width: 768px) 576px, 100vw"
              className="aspect-[4/5] mx-auto max-w-xl"
            />
            <p className="text-center text-white/50 text-sm mt-4 font-medium">
              Drag the slider to compare before and after
            </p>
          </div>
        </section>

        {/* 3 — About this project: the write-up, scope and gallery */}
        {(project.overview?.length ||
          project.gallery?.length ||
          relatedService) && (
          <section className="pb-10 lg:pb-16">
            <div className="site-container">
              {project.overview && project.overview.length > 0 && (
                <>
                  <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-6">
                    About This Project
                  </h2>
                  <div className="site-prose space-y-4 mb-10">
                    {project.overview.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-lg text-white/80 leading-relaxed font-medium"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              )}

              {relatedService && relatedService.highlights.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-6">
                    Scope of Work
                  </h3>
                  <ul className="space-y-4">
                    {relatedService.highlights.map((item, idx) => (
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
                        <span className="text-white/80 leading-relaxed font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.gallery && project.gallery.length > 0 && (
                <div>
                  <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-6">
                    More Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.gallery.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-64 rounded-xl overflow-hidden border border-white/10"
                      >
                        <Image
                          src={src}
                          sizes="(min-width: 640px) 50vw, 100vw"
                          alt={project.galleryAlt?.[idx] || `${project.title} — additional photo ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3b — Finance strip */}
        <FinanceBanner />

        {/* 4 — The problem this kind of job solves, from the linked service. */}
        <ProblemSection content={relatedService?.problem} eyebrow={sections.labels?.problemEyebrow} />

        {/* 5 — Long-form body copy, for the SEO team to expand. */}
        {project.content && project.content.length > 0 && (
          <section className="pb-10 lg:pb-16">
            <div className="site-container">
              <ContentBlocks blocks={project.content} />
            </div>
          </section>
        )}

        {/* 6 — Proof: the owner's words, the numbers, the reviews. */}
        {/* Owner review — the customer whose property is in the photos. */}
        <ProjectOwnerReview review={project.review} />

        <Stats override={sections.stats} />
        <Testimonials
          eyebrow={sections.labels?.testimonialsEyebrow}
          heading={sections.labels?.testimonialsHeading}
          subheading={sections.labels?.testimonialsSubheading}
        />

        {/* 7 — How we work */}
        <Process override={sections.process} />

        {/* 8 — Credentials */}
        <AccreditationsSection heading={sections.labels?.accreditationsHeading} />

        {/* 9 — What it costs, from the linked service. No figures. */}
        <ServicePricingSection
          content={relatedService?.pricing}
          eyebrow={sections.labels?.pricingEyebrow}
          includedHeading={sections.labels?.pricingIncludedHeading}
        />

        {/* 10 — FAQs, also emitted as FAQPage schema by the component. */}
        <FaqSection
          faqs={project.faqs}
          heading={label(sections, "faqHeading", "Frequently asked questions")}
        />

        {/* CTA */}
        <section className="pb-10 lg:pb-16">
          <div className="site-container">
            <div className="p-8 md:p-12 bg-white/5 rounded-xl border border-[#c5eb02]">
              {relatedService ? (
                <>
                  <span className="inline-block bg-[#c5eb02] text-black text-xs font-bold px-4 py-2 rounded-full mb-4">
                    {relatedService.title}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Want the same results?
                  </h3>
                  <p className="site-prose text-lg text-white/80 mb-8 font-medium">
                    This project was completed as part of our{" "}
                    {relatedService.title} service. Explore what&apos;s
                    included, or get a free quote for your own property.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/services/${relatedService.slug}`}
                      className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
                    >
                      Explore {relatedService.shortName} →
                    </Link>
                    <Link
                      href={`/services/${relatedService.slug}#quote`}
                      className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm font-bold hover:border-[#c5eb02] hover:text-[#c5eb02] transition-all"
                    >
                      Get a Free Quote
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Considering a similar project?
                  </h3>
                  <p className="site-prose text-lg text-white/80 mb-8 font-medium">
                    Get in touch for a free, no-obligation survey and quote
                    tailored to your property.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
                  >
                    Get in Touch
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Other Projects */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
              More Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherProjects.map((other) => (
                <Link
                  key={other.slug}
                  href={`/projects/${other.slug}`}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <p className="text-[10px] font-semibold uppercase mb-3 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit">
                    {other.category}
                  </p>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                    {other.title}
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    {other.description}
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    View Project →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* 11 — More projects above, then the final CTA. #quote is the
            target every button on the page uses. */}
        <div id="quote">
          <CtaSection
            eyebrow={label(sections, "ctaEyebrow", "Free Quote")}
            heading={label(sections, "ctaHeading", "Want results like this at your place?")}
            description={label(
              sections,
              "ctaDescription",
              "Tell us about your property and we'll come back within one business day with a straight answer, a plan and a real quote.",
            )}
            {...(relatedService ? { defaultService: relatedService.formCategory } : {})}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
