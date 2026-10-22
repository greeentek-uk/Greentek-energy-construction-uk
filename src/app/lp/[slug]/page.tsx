import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ChevronDown, MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import Footer from "@/components/layout/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import StickyQuoteBar from "@/components/landing/StickyQuoteBar";
import QuoteModal from "@/components/landing/QuoteModal";
import HeroQuoteForm from "@/components/sections/HeroQuoteForm";
import FinanceBanner from "@/components/sections/FinanceBanner";
import AccreditationsSection from "@/components/sections/AccreditationsSection";
import TrackViewContent from "@/components/site/TrackViewContent";
import { StarStrip } from "@/components/site/TrustRatingBadge";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { LANDING_PAGES, landingPage, withLandingDefaults } from "@/lib/landingPages";
import { paragraphs } from "@/lib/financeProviders";
import { splitHeading } from "@/lib/heroHeading";
import { SITE_URL } from "@/lib/structuredData";
import type { TestimonialsContent } from "@/data/pageContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = landingPage((await params).slug);
  if (!meta) return { title: "Not found" };
  const content = withLandingDefaults(meta.block, await getPageContent(meta.block));
  return {
    title: { absolute: content.metaTitle || meta.name },
    description: content.metaDescription,
    alternates: { canonical: `${SITE_URL}/lp/${meta.slug}` },
    robots: { index: false, follow: false },
    openGraph: {
      title: content.metaTitle || meta.name,
      description: content.metaDescription,
      ...(content.heroImage ? { images: [{ url: content.heroImage }] } : {}),
    },
  };
}

type Review = TestimonialsContent["items"][number];

const h2 =
  "font-heading text-[2rem] leading-[1.08] md:text-[2.75rem] font-extrabold tracking-[-0.02em] text-balance";
const lime = "#c5eb02";

function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const parts = splitHeading(text, highlight || undefined);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.before}
      <mark className="rounded-md bg-[#c5eb02] px-1.5 text-black [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
        {parts.highlight}
      </mark>
      {parts.after}
    </>
  );
}

function Tick({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 ${dark ? "text-white" : "text-[#0b0d0e]"}`}>
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#c5eb02]">
        <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  );
}

function Faces({ reviews }: { reviews: Review[] }) {
  const faces = reviews.filter((r) => r.image).slice(0, 3);
  if (!faces.length) return null;
  return (
    <span className="flex shrink-0 -space-x-2.5" aria-hidden>
      {faces.map((r) => (
        <Image
          key={r.name}
          src={r.image!}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
        />
      ))}
    </span>
  );
}

function Cta({
  label,
  phone,
  proof,
  reviews,
  dark = false,
  align = "center",
}: {
  label: string;
  phone: string;
  proof: string;
  reviews: Review[];
  dark?: boolean;
  align?: "center" | "start";
}) {
  const center = align === "center";
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : "items-start"}`}>
      <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row ${center ? "sm:justify-center" : ""}`}>
        <a
          href="#quote"
          data-quote
          className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#c5eb02] px-8 text-base font-extrabold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(197,235,2,0.6)] transition hover:bg-[#d4f53a] active:scale-[.98]"
        >
          {label}
        </a>
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-7 text-base font-bold transition active:scale-[.98] ${
            dark
              ? "border-2 border-white/30 text-white hover:border-white"
              : "bg-[#0b0d0e] text-white hover:bg-black"
          }`}
        >
          <Phone className="h-5 w-5" aria-hidden />
          {phone}
        </a>
      </div>
      {proof && (
        <p className={`flex items-center gap-3 text-sm font-medium ${dark ? "text-white/75" : "text-[#0b0d0e]/70"}`}>
          <Faces reviews={reviews} />
          {proof}
        </p>
      )}
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Google review">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function GoldStars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-[#f5b301] text-[#f5b301]" : "text-black/20"}`} aria-hidden />
      ))}
    </span>
  );
}

function firstSentence(quote: string): { lead: string; rest: string } {
  const match = quote.match(/^([\s\S]{12,90}?[.!?])\s+([\s\S]*)$/);
  return match ? { lead: match[1], rest: match[2] } : { lead: "", rest: quote };
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export default async function LandingPage({ params }: Props) {
  const meta = landingPage((await params).slug);
  if (!meta) notFound();
  const [stored, siteConfig, rating, testimonials] = await Promise.all([
    getPageContent(meta.block),
    getCurrentSiteConfig(),
    getPageContent("home-hero"),
    getPageContent("testimonials"),
  ]);
  const content = withLandingDefaults(meta.block, stored);
  const source = `Ad landing page — ${meta.name}`;
  const fixedService = { value: meta.service, label: meta.name };
  // Bathroom enquiries also give the property's address (owner's request, 2026-10-22).
  const askAddress = meta.slug === "bathroom-renovation";
  const areaNames = content.areaNames.length
    ? content.areaNames
    : siteConfig.locations.map((location) => location.name);
  const reviews = testimonials.items;
  const phone = siteConfig.phone;
  const cta = { label: content.quoteButtonLabel || "Get my free quote", phone, proof: content.socialProofLine, reviews };
  const score = Number.parseFloat(rating.ratingScore) || 0;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0b0d0e] pb-20 lg:pb-0">
      <TrackViewContent name={meta.name} category="ad_landing_page" id={`lp-${meta.slug}`} />
      <LandingHeader phone={phone} offer={content.offerBar} quoteLabel={cta.label} />

      <main className="flex-1">
        <section className="grid lg:grid-cols-2">
          <div className="relative order-1 h-64 sm:h-80 lg:order-2 lg:h-auto lg:min-h-[640px]">
            <Image
              src={content.heroImage}
              alt={content.heroImageAlt || meta.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="order-2 bg-[#f6f7f2] lg:order-1">
            <div className="mx-auto max-w-[640px] px-5 py-10 sm:px-8 md:py-14 lg:ml-auto lg:mr-0 lg:py-20 lg:pr-14 xl:pl-0">
              {(content.ratingText || score > 0) && (
                <a
                  href={rating.ratingUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
                >
                  {score > 0 && <StarStrip score={score} />}
                  {content.ratingText}
                </a>
              )}
              <h1 className="mt-6 font-heading text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.025em] text-balance sm:text-[2.75rem] xl:text-[3.4rem]">
                <Highlighted text={content.heroHeading || meta.name} highlight={content.heroHighlight} />
              </h1>
              {content.heroBody && (
                <p className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/75">{content.heroBody}</p>
              )}
              <div id="hero-cta" className="mt-8">
                <Cta {...cta} proof="" align="start" />
              </div>
              {content.heroTicks.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold">
                  {content.heroTicks.map((t) => (
                    <Tick key={t}>{t}</Tick>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="bg-[#0b0d0e] text-white">
            <ul className="site-container grid gap-6 py-8 md:grid-cols-3 md:gap-10">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.name} className="flex flex-col gap-2.5">
                  <GoldStars rating={r.rating} />
                  <p className="text-[15px] font-medium leading-snug">&ldquo;{clip(r.quote, 120)}&rdquo;</p>
                  <p className="text-sm text-white/55">{r.name}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.resultsHeading && content.results.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="site-container">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={h2}>{content.resultsHeading}</h2>
                {content.resultsIntro && <p className="mt-4 text-lg text-[#0b0d0e]/65">{content.resultsIntro}</p>}
              </div>
              <ul
                className={`mx-auto mt-12 grid gap-6 ${
                  content.results.length === 1 ? "max-w-3xl" : "md:grid-cols-2 lg:max-w-none"
                }`}
              >
                {content.results.map((r) => (
                  <li key={r.title + r.after} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
                    <div className="relative aspect-[4/5] sm:aspect-[5/4]">
                      <Image
                        src={r.after}
                        alt={r.afterAlt || `${meta.name}, after`}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-[#c5eb02] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-black">
                        After
                      </span>
                      <div className="absolute bottom-4 right-4 w-[34%] max-w-[180px] overflow-hidden rounded-xl border-4 border-white shadow-xl">
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={r.before}
                            alt={r.beforeAlt || `${meta.name}, before`}
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white">
                          Before
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-xl font-extrabold leading-snug">{r.title}</h3>
                      {r.body && <p className="mt-2 text-[#0b0d0e]/65">{r.body}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <Cta {...cta} />
              </div>
            </div>
          </section>
        )}

        {content.problemHeading && (
          <section className="bg-[#f6f7f2] py-16 md:py-24">
            <div
              className={`site-container grid items-center gap-12 lg:gap-16 ${
                content.problemImage ? "lg:grid-cols-2" : "max-w-3xl"
              }`}
            >
              <div>
                <h2 className={h2}>{content.problemHeading}</h2>
                {content.problemQuestions.length > 0 && (
                  <ul className="mt-7 space-y-3 text-lg font-semibold">
                    {content.problemQuestions.map((q) => (
                      <Tick key={q}>{q}</Tick>
                    ))}
                  </ul>
                )}
                {paragraphs(content.problemBody).map((p, i) => (
                  <p key={i} className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/75">
                    {p}
                  </p>
                ))}
                <div className="mt-9">
                  <Cta {...cta} align="start" />
                </div>
              </div>
              {content.problemImage && (
                <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-[#c5eb02]" aria-hidden />
                  <Image
                    src={content.problemImage}
                    alt={content.problemImageAlt || meta.name}
                    fill
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="rounded-2xl object-cover"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {content.reviewsHeading && reviews.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="site-container">
              <h2 className={`${h2} mx-auto max-w-3xl text-center`}>{content.reviewsHeading}</h2>
              <ul className="mt-12 grid gap-5 md:grid-cols-3">
                {reviews.slice(0, 3).map((r) => {
                  const { lead, rest } = firstSentence(r.quote);
                  return (
                    <li key={r.name} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6">
                      <GoldStars rating={r.rating} />
                      {lead && <p className="mt-4 font-heading text-lg font-extrabold leading-snug">&ldquo;{lead}&rdquo;</p>}
                      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#0b0d0e]/70">{clip(rest, 260)}</p>
                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                        <span className="flex items-center gap-3">
                          {r.image ? (
                            <Image src={r.image} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c5eb02] text-sm font-bold">
                              {r.name.charAt(0)}
                            </span>
                          )}
                          <span className="text-sm font-semibold">{r.name}</span>
                        </span>
                        {r.source === "google" && <GoogleG />}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-12">
                <Cta {...cta} />
              </div>
            </div>
          </section>
        )}

        {content.tickerItems.length > 0 && (
          <div className="overflow-hidden bg-[#c5eb02] py-4" aria-label="Why Greentek">
            <ul className="lp-marquee flex w-max gap-10 whitespace-nowrap">
              {[...content.tickerItems, ...content.tickerItems].map((item, i) => (
                <li
                  key={i}
                  aria-hidden={i >= content.tickerItems.length}
                  className="flex items-center gap-3 font-heading text-lg font-extrabold uppercase tracking-wide text-black"
                >
                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.features.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="site-container space-y-16 md:space-y-24">
              {content.features.map((f, i) => (
                <div key={f.heading} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={i % 2 ? "lg:order-2" : ""}>
                    <h2 className={h2}>{f.heading}</h2>
                    {f.body && <p className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/75">{f.body}</p>}
                    {f.image && f.bullets.length > 0 && (
                      <ul className="mt-6 space-y-3 text-[17px] font-medium">
                        {f.bullets.map((b) => (
                          <Tick key={b}>{b}</Tick>
                        ))}
                      </ul>
                    )}
                    <div className="mt-8">
                      <Cta {...cta} proof="" align="start" />
                    </div>
                  </div>
                  <div className={i % 2 ? "lg:order-1" : ""}>
                    {f.image ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                        <Image
                          src={f.image}
                          alt={f.imageAlt || f.heading}
                          fill
                          sizes="(min-width: 1024px) 45vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-[#0b0d0e] p-8 md:p-10">
                        <ShieldCheck className="h-12 w-12" style={{ color: lime }} aria-hidden />
                        <ul className="mt-6 space-y-4 text-lg font-semibold">
                          {f.bullets.map((b) => (
                            <Tick key={b} dark>
                              {b}
                            </Tick>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.pricingHeading && content.pricingTiers.length > 0 && (
          <section className="bg-[#f6f7f2] py-16 md:py-24">
            <div className="site-container">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={h2}>{content.pricingHeading}</h2>
                {content.pricingIntro && <p className="mt-4 text-lg text-[#0b0d0e]/65">{content.pricingIntro}</p>}
              </div>
              <ul
                className={`mt-12 grid gap-5 ${
                  content.pricingTiers.length === 1
                    ? "mx-auto max-w-xl"
                    : content.pricingTiers.length >= 3
                      ? "md:grid-cols-3"
                      : "md:grid-cols-2"
                }`}
              >
                {content.pricingTiers.map((tier, i) => {
                  const featured = content.pricingTiers.length === 1 || (content.pricingTiers.length >= 3 && i === 1);
                  return (
                    <li
                      key={tier.name}
                      className={`flex flex-col rounded-2xl p-7 ${
                        featured ? `bg-[#0b0d0e] text-white ${content.pricingTiers.length > 1 ? "md:-my-3 md:py-10" : ""}` : "border border-black/10 bg-white"
                      }`}
                    >
                      <h3 className="text-sm font-bold uppercase tracking-[0.12em] opacity-70">{tier.name}</h3>
                      <p className={`mt-3 font-heading text-[2.1rem] font-extrabold leading-none ${featured ? "text-[#c5eb02]" : ""}`}>
                        {tier.price}
                      </p>
                      {tier.description && <p className="mt-4 opacity-75">{tier.description}</p>}
                      {tier.features.length > 0 && (
                        <ul className={`mt-6 space-y-3 border-t pt-6 ${featured ? "border-white/15" : "border-black/10"}`}>
                          {tier.features.map((f) => (
                            <Tick key={f} dark={featured}>
                              {f}
                            </Tick>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              {content.pricingNote && (
                <p className="mx-auto mt-10 max-w-2xl text-center text-[#0b0d0e]/65">{content.pricingNote}</p>
              )}
              <div className="mt-10">
                <Cta {...cta} />
              </div>
            </div>
          </section>
        )}

        <FinanceBanner />

        {content.guaranteeHeading && (
          <section className="bg-white py-14 md:py-20">
            <div className="site-container">
              <div className="flex flex-col items-start gap-6 rounded-3xl bg-[#eef9b8] p-8 md:flex-row md:items-center md:gap-10 md:p-12">
                <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[#0b0d0e]">
                  <ShieldCheck className="h-12 w-12" style={{ color: lime }} aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em] md:text-[2.25rem]">
                    {content.guaranteeHeading}
                  </h2>
                  {content.guaranteeBody && (
                    <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#0b0d0e]/75">{content.guaranteeBody}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {content.stepsHeading && content.steps.length > 0 && (
          <section className="bg-white pb-16 md:pb-24">
            <div className="site-container">
              <h2 className={`${h2} mx-auto max-w-3xl text-center`}>{content.stepsHeading}</h2>
              <ol className={`relative mt-14 grid gap-10 sm:grid-cols-2 ${content.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                <span className="absolute left-0 right-0 top-6 hidden h-0.5 bg-black/10 lg:block" aria-hidden />
                {content.steps.map((step, i) => (
                  <li key={step.title} className="relative">
                    <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#c5eb02] font-heading text-xl font-extrabold ring-8 ring-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-5 font-heading text-xl font-extrabold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-[#0b0d0e]/70">{step.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-14">
                <Cta {...cta} />
              </div>
            </div>
          </section>
        )}

        {content.stats.length > 0 && (
          <section className="bg-[#0b0d0e] text-white">
            <ul className={`site-container grid grid-cols-2 gap-8 py-12 md:py-16 ${content.stats.length >= 4 ? "lg:grid-cols-4" : "md:grid-cols-3"}`}>
              {content.stats.map((s) => (
                <li key={s.label} className="text-center">
                  <p className="font-heading text-[2.75rem] font-extrabold leading-none md:text-[3.5rem]" style={{ color: lime }}>
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm text-white/70 md:text-base">{s.label}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.areasHeading && areaNames.length > 0 && (
          <section className="bg-[#f6f7f2] py-16 md:py-20">
            <div className="site-container text-center">
              <h2 className={`${h2} mx-auto max-w-3xl`}>{content.areasHeading}</h2>
              {content.areasBody && <p className="mx-auto mt-4 max-w-2xl text-lg text-[#0b0d0e]/70">{content.areasBody}</p>}
              <ul className="mt-8 flex flex-wrap justify-center gap-3">
                {areaNames.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 font-semibold"
                  >
                    <MapPin className="h-4 w-4 text-[#0b0d0e]/60" aria-hidden />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {content.faqs.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="site-container">
              <div className="mx-auto max-w-3xl">
                <h2 className={`${h2} text-center`}>{content.faqHeading || "Frequently asked questions"}</h2>
                <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
                  {content.faqs.map((faq, i) => (
                    <details key={i} className="group py-5" {...(i === 0 ? { open: true } : {})}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                        {faq.question}
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <div
                        className="mt-3 leading-relaxed text-[#0b0d0e]/70 [&_a]:font-semibold [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="quote" className="relative scroll-mt-20 overflow-hidden">
          {content.finalImage && (
            <Image
              src={content.finalImage}
              alt={content.finalImageAlt || ""}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/55" aria-hidden />
          <div className="site-container relative grid items-center gap-8 py-16 md:py-24 lg:grid-cols-[1fr_minmax(360px,440px)] lg:gap-14">
            <div className="rounded-2xl bg-white p-8 md:p-10">
              {(content.ratingText || score > 0) && (
                <p className="inline-flex flex-wrap items-center gap-2.5 text-sm font-semibold">
                  {score > 0 && <StarStrip score={score} />}
                  {content.ratingText}
                </p>
              )}
              {content.finalHeading && (
                <h2 className="mt-5 font-heading text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[2.5rem]">
                  {content.finalHeading}
                </h2>
              )}
              {content.finalBody && <p className="mt-4 text-lg leading-relaxed text-[#0b0d0e]/75">{content.finalBody}</p>}
              {content.finalTicks.length > 0 && (
                <ul className="mt-6 space-y-3 font-semibold">
                  {content.finalTicks.map((t) => (
                    <Tick key={t}>{t}</Tick>
                  ))}
                </ul>
              )}
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-8 inline-flex items-center gap-2 text-lg font-bold underline-offset-4 hover:underline"
              >
                <Phone className="h-5 w-5" aria-hidden />
                Prefer to talk? Call {phone}
              </a>
            </div>
            <div className="w-full">
              <HeroQuoteForm
                heading={content.formHeading || `Get your free ${meta.name.toLowerCase()} quote`}
                subheading={content.formSubheading}
                source={source}
                fixedService={fixedService}
                askAddress={askAddress}
              />
            </div>
          </div>
        </section>

        <div className="bg-black">
          <AccreditationsSection />
        </div>
      </main>

      <Footer hideCta />
      <QuoteModal
        heading={content.formHeading || `Get your free ${meta.name.toLowerCase()} quote`}
        subheading={content.formSubheading}
        source={source}
        fixedService={fixedService}
        askAddress={askAddress}
      />
      <StickyQuoteBar
        phone={phone}
        callLabel={content.stickyCallLabel || "Call us"}
        quoteLabel={content.stickyQuoteLabel || "Free quote"}
      />
    </div>
  );
}
