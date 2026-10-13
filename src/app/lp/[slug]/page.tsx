import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check, CircleAlert, ShieldCheck } from "lucide-react";
import Footer from "@/components/layout/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import StickyQuoteBar from "@/components/landing/StickyQuoteBar";
import PageQuoteHero from "@/components/sections/PageQuoteHero";
import FinanceBanner from "@/components/sections/FinanceBanner";
import Testimonials from "@/components/sections/Testimonials";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import CtaSection from "@/components/sections/CtaSection";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import FaqSection from "@/components/site/FaqSection";
import TrackViewContent from "@/components/site/TrackViewContent";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { LANDING_PAGES, landingPage } from "@/lib/landingPages";
import { paragraphs } from "@/lib/financeProviders";
import { SITE_URL } from "@/lib/structuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = landingPage((await params).slug);
  if (!meta) return { title: "Not found" };
  const content = await getPageContent(meta.block);
  return {
    // Absolute: the copy is written whole in the panel, brand and all.
    title: { absolute: content.metaTitle || meta.name },
    description: content.metaDescription,
    alternates: { canonical: `${SITE_URL}/lp/${meta.slug}` },
    // Paid traffic only. Indexed, these would compete with /services for the
    // same searches with thinner copy — and Google Ads doesn't need them indexed.
    robots: { index: false, follow: false },
    openGraph: {
      title: content.metaTitle || meta.name,
      description: content.metaDescription,
      ...(content.heroImage ? { images: [{ url: content.heroImage }] } : {}),
    },
  };
}

const h2 = "text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white text-balance";

/** Every in-page button goes back to the hero form, which may already be half filled. */
function QuoteButton({ label }: { label: string }) {
  if (!label) return null;
  return (
    <a
      href="#start"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c5eb02] px-7 py-4 text-base font-bold text-black transition-all hover:bg-[#c5eb02]/85 active:scale-[.98]"
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </a>
  );
}

/**
 * An ad landing page — one service, one goal.
 *
 * The order follows the questions a visitor from an ad asks, in the order
 * they ask them:
 *   1. Am I in the right place?   hero repeats the ad's promise, form in the fold
 *   2. Can I trust them?          trust strip, finance, straight under the form
 *   3. Do they get my problem?    the frustrations, then exactly what's included
 *   4. Are they any good?         real before/after photos, then reviews
 *   5. What will it cost?         price ranges (filters out enquiries we can't serve)
 *   6. What happens next?         four steps, then the guarantee
 *   7. What's stopping me?        FAQs that answer the objections
 *   8. Do it.                     the full form, then accreditations + footer
 * A button back to the form follows each "proof" section, and on phones a
 * call / quote bar is pinned to the bottom once the hero is out of sight.
 *
 * No menu, no breadcrumbs, no links into the rest of the site: every exit that
 * isn't a call or an enquiry costs a click the ad has already paid for. The
 * footer stays for the company details and finance disclosures it carries,
 * minus its site-wide CTA banner.
 */
export default async function LandingPage({ params }: Props) {
  const meta = landingPage((await params).slug);
  if (!meta) notFound();
  const [content, siteConfig] = await Promise.all([getPageContent(meta.block), getCurrentSiteConfig()]);
  const source = `Ad landing page — ${meta.name}`;

  const before = content.gallery.find((g) => /^before$/i.test(g.caption.trim()));
  const after = content.gallery.find((g) => /^after$/i.test(g.caption.trim()));
  const slider = before && after ? { before, after } : null;
  const galleryRest = slider ? content.gallery.filter((g) => g !== before && g !== after) : content.gallery;

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20 lg:pb-0">
      <TrackViewContent name={meta.name} category="ad_landing_page" id={`lp-${meta.slug}`} />
      <LandingHeader phone={siteConfig.phone} callLabel={content.stickyCallLabel} />

      <main className="flex-1">
        {/* 1 — The promise and the form, together in the fold. */}
        <PageQuoteHero
          image={content.heroImage}
          imageAlt={content.heroImageAlt || meta.name}
          eyebrow={content.heroEyebrow}
          heading={content.heroHeading || meta.name}
          headingHighlight={content.heroHighlight || undefined}
          body={content.heroBody}
          bullets={content.heroBullets}
          source={source}
          fixedService={{ value: meta.service, label: meta.name }}
          formHeading={content.formHeading}
          formSubheading={content.formSubheading}
        />

        {/* 2 — Trust, straight under the form. */}
        {content.trustPoints.length > 0 && (
          <section className="border-y border-white/10 bg-[#101314]">
            <div className="site-container">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 md:flex md:flex-wrap md:justify-between">
                {content.trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm md:text-base font-semibold text-white">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#c5eb02]" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <FinanceBanner />

        {/* 3 — Their problem, then the fix. */}
        {content.problemHeading && (
          <section className="py-12 lg:py-20" aria-labelledby="lp-problem">
            <div className="site-container">
              <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                  <h2 id="lp-problem" className={h2}>
                    {content.problemHeading}
                  </h2>
                  {paragraphs(content.problemIntro).map((p, i) => (
                    <p
                      key={i}
                      className={`mt-4 leading-relaxed ${i === 0 ? "text-lg font-medium text-white/85" : "text-base text-white/70"}`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
                {content.problemCards.length > 0 && (
                  <ul className="grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 sm:grid-cols-2 lg:col-span-7">
                    {content.problemCards.map((card) => (
                      <li key={card.title} className="rounded-2xl bg-black px-6 py-7">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[#c5eb02]">
                          <CircleAlert className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                        </span>
                        <h3 className="mt-4 text-lg font-semibold leading-snug text-white md:text-xl">{card.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{card.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {content.includedHeading && content.includedItems.length > 0 && (
          <section className="py-12 lg:py-16 bg-[#101314]">
            <div className="site-container">
              <h2 className={h2}>{content.includedHeading}</h2>
              {content.includedIntro && <p className="mt-3 text-lg text-white/70">{content.includedIntro}</p>}
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {content.includedItems.map((item) => (
                  <li key={item} className="flex items-start gap-4 rounded-xl border border-white/10 bg-black px-5 py-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#c5eb02]">
                      <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-lg font-medium leading-relaxed text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <QuoteButton label={content.quoteButtonLabel} />
              </div>
            </div>
          </section>
        )}

        {/* 4 — Proof: real jobs, then real customers. */}
        {content.galleryHeading && content.gallery.length > 0 && (
          <section className="py-12 lg:py-20">
            <div className="site-container">
              <h2 className={h2}>{content.galleryHeading}</h2>
              {content.galleryIntro && <p className="mt-3 text-lg text-white/70">{content.galleryIntro}</p>}
              <div className={`mt-8 grid gap-4 ${slider && galleryRest.length ? "lg:grid-cols-2" : ""}`}>
                {slider && (
                  <BeforeAfterSlider
                    before={slider.before.image}
                    after={slider.after.image}
                    beforeAlt={slider.before.alt}
                    afterAlt={slider.after.alt}
                    title={meta.name}
                    className={`rounded-xl overflow-hidden ${galleryRest.length ? "aspect-[4/5]" : "aspect-[4/3] max-w-3xl"}`}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                )}
                {galleryRest.length > 0 && (
                  <ul className={`grid gap-4 ${slider ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {galleryRest.map((g) => (
                      <li key={g.image} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        <Image
                          src={g.image}
                          alt={g.alt || g.caption || meta.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                        />
                        {g.caption && (
                          <span className="absolute left-3 bottom-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase text-white">
                            {g.caption}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        <Testimonials heading={content.reviewsHeading || undefined} />
        <div className="site-container -mt-4 mb-12 text-center">
          <QuoteButton label={content.quoteButtonLabel} />
        </div>

        {/* 5 — Cost, answered up front. */}
        {content.pricingHeading && content.pricingTiers.length > 0 && (
          <section className="py-12 lg:py-20 bg-[#101314]">
            <div className="site-container">
              <h2 className={h2}>{content.pricingHeading}</h2>
              {content.pricingIntro && <p className="mt-3 text-lg text-white/70 site-prose">{content.pricingIntro}</p>}
              <ul className={`mt-8 grid gap-4 ${content.pricingTiers.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                {content.pricingTiers.map((tier) => (
                  <li key={tier.name} className="flex flex-col rounded-2xl border border-white/10 bg-black p-6">
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <p className="mt-2 text-3xl font-bold text-[#c5eb02]">{tier.price}</p>
                    {tier.description && <p className="mt-3 text-white/70">{tier.description}</p>}
                    {tier.features.length > 0 && (
                      <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-white/85">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-[#c5eb02]" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              {content.pricingNote && <p className="mt-6 text-white/60 site-prose">{content.pricingNote}</p>}
              <div className="mt-8">
                <QuoteButton label={content.quoteButtonLabel} />
              </div>
            </div>
          </section>
        )}

        {/* 6 — What happens next, and what if it goes wrong. */}
        {content.stepsHeading && content.steps.length > 0 && (
          <section className="py-12 lg:py-20">
            <div className="site-container">
              <h2 className={h2}>{content.stepsHeading}</h2>
              <ol className={`mt-8 grid gap-4 sm:grid-cols-2 ${content.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {content.steps.map((step, i) => (
                  <li key={step.title} className="rounded-2xl border border-white/10 bg-[#101314] p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#c5eb02] text-lg font-bold text-black">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-white/70 leading-relaxed">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {content.guaranteeHeading && content.guaranteeItems.length > 0 && (
          <section className="pb-12 lg:pb-20">
            <div className="site-container">
              <h2 className={h2}>{content.guaranteeHeading}</h2>
              <ul className="mt-8 grid gap-4 md:grid-cols-3">
                {content.guaranteeItems.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-[#c5eb02]/30 bg-[#c5eb02]/5 p-6">
                    <ShieldCheck className="h-7 w-7 text-[#c5eb02]" aria-hidden />
                    <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-white/75 leading-relaxed">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 7 — Objections. */}
        <FaqSection faqs={content.faqs} heading={content.faqHeading || undefined} />

        {/* 8 — The full form, for anyone who scrolled past the first one. */}
        <div id="quote">
          <CtaSection
            eyebrow={meta.name}
            heading={content.ctaHeading || undefined}
            description={content.ctaBody || undefined}
            defaultService={meta.service}
            source={source}
            messagePlaceholder={`Tell us about your ${meta.name.split(" ")[0].toLowerCase()}... (optional)`}
          />
        </div>
        <AccreditationsSection />
      </main>

      <Footer hideCta />
      <StickyQuoteBar
        phone={siteConfig.phone}
        callLabel={content.stickyCallLabel || "Call us"}
        quoteLabel={content.stickyQuoteLabel || "Free quote"}
      />
    </div>
  );
}
