import Image from "next/image";
import { ArrowRight, Check, ChevronDown, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import CallbackForm from "@/components/landing/CallbackForm";
import GrantQuiz from "@/components/landing/GrantQuiz";
import { StarStrip } from "@/components/site/TrustRatingBadge";
import { FINANCE_PROVIDERS, paragraphs } from "@/lib/financeProviders";
import { splitHeading } from "@/lib/heroHeading";
import { reviewHighlight } from "@/lib/reviewHighlight";
import { whatsappUrl } from "@/lib/whatsapp";
import type { LandingPageContent, TestimonialsContent } from "@/data/pageContent";

/**
 * The heat pump ad landing page, v3 (2026-11-05): the best section of each
 * competitor that out-converts us in the heat pump auction, rebuilt with our
 * own facts. Each section's comment names whose idea it is and why it fits.
 *
 * Why its own layout and not the shared `/lp/*` template: the owner compared
 * the template with Aira, British Gas, Octopus and E.ON and found every one
 * of them better — 21 sections, the same three reviews twice, two number
 * strips, £7,500 about ten times, and eight rows of "CHECK MY GRANT + phone +
 * Join 500+" between heavy black bands. This page has ten sections, one dark
 * band (the comparison, so it stands out), lime only as an accent, semibold
 * (not extra-bold) headings and sentence-case buttons — Aira's calm, which
 * reads as trustworthy where ours read as loud. Kitchen, bathroom and solar
 * keep the template until the owner signs this look off.
 *
 * All wording is the same `lp-air-source-heat-pumps` block the panel edits;
 * sections whose fields are blank don't render. Fields only the template
 * shows (ticker, feature blocks, the second stats strip, areas, review wall
 * heading) are ignored here, by design.
 */

type Review = TestimonialsContent["items"][number];

const h2 = "font-heading text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-balance md:text-[2.75rem]";
const card =
  "rounded-3xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.18)]";
const primaryButton =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#c5eb02] px-8 text-base font-bold text-black transition hover:bg-[#d4f53a] active:scale-[.98]";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function Tick({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#c5eb02]">
        <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} aria-hidden />
      </span>
      <span className={dark ? "text-white/85" : "text-[#0b0d0e]/80"}>{children}</span>
    </li>
  );
}

/** Quote button + phone. Every `[data-quote]` scrolls to the quiz (ScrollToQuiz). */
function Actions({ label, phone, dark = false, center = false }: { label: string; phone: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${center ? "sm:justify-center" : ""}`}>
      <a href="#quote" data-quote className={primaryButton}>
        {label}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </a>
      <a
        href={telHref(phone)}
        className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition ${
          dark ? "text-white hover:bg-white/10" : "text-[#0b0d0e] hover:bg-black/5"
        }`}
      >
        <Phone className="h-5 w-5" aria-hidden />
        {phone}
      </a>
    </div>
  );
}

function RatingBadge({ score, text, url, dark = false }: { score: number; text: string; url?: string; dark?: boolean }) {
  if (!text && !score) return null;
  const className = `inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full px-4 py-2 text-sm font-semibold ${
    dark ? "bg-white text-[#0b0d0e]" : "border border-black/10 bg-white"
  }`;
  const inner = (
    <>
      {score > 0 && <StarStrip score={score} />}
      {text}
    </>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <span className={className}>{inner}</span>
  );
}

export default function HeatPumpLanding({
  content,
  name,
  service,
  source,
  phone,
  score,
  ratingUrl,
  reviews,
}: {
  content: LandingPageContent;
  name: string;
  service: string;
  source: string;
  phone: string;
  score: number;
  ratingUrl?: string;
  reviews: Review[];
}) {
  const label = content.quoteButtonLabel || "Check my grant";
  const heading = splitHeading(content.heroHeading || name, content.heroHighlight || undefined);
  const result = content.results[0];
  const trust = (content.ratingText || score > 0) && (
    <span className="inline-flex flex-wrap items-center gap-2.5">
      {score > 0 && <StarStrip score={score} />}
      {content.ratingText}
    </span>
  );

  return (
    <main className="flex-1 bg-[#f7f7f4] text-[#0b0d0e]">
      {/* 1. Hero — the template's split hero, kept by the owner's choice
          (2026-11-05: a full-bleed Aira-style photo hero was tried and the
          owner preferred this): copy on the light panel, our install photo
          beside it, the photo first on phones. */}
      <section className="grid lg:grid-cols-2">
        <div className="relative order-1 h-64 sm:h-80 lg:order-2 lg:h-auto lg:min-h-[640px]">
          <Image
            src={content.heroImage}
            alt={content.heroImageAlt || name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="order-2 bg-[#f6f7f2] lg:order-1">
          <div className="mx-auto max-w-[640px] px-5 py-10 sm:px-8 md:py-14 lg:ml-auto lg:mr-0 lg:py-20 lg:pr-14 xl:pl-0">
            <RatingBadge score={score} text={content.ratingText} url={ratingUrl || undefined} />
            <h1 className="mt-6 font-heading text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.025em] text-balance sm:text-[2.75rem] xl:text-[3.4rem]">
              {heading ? (
                <>
                  {heading.before}
                  <mark className="rounded-md bg-[#c5eb02] px-1.5 text-black [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    {heading.highlight}
                  </mark>
                  {heading.after}
                </>
              ) : (
                content.heroHeading || name
              )}
            </h1>
            {content.heroBody && <p className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/75">{content.heroBody}</p>}
            <div id="hero-cta" className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="#quote"
                data-quote
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#c5eb02] px-8 text-base font-extrabold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(197,235,2,0.6)] transition hover:bg-[#d4f53a] active:scale-[.98]"
              >
                {label}
              </a>
              <a
                href={telHref(phone)}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#0b0d0e] px-7 text-base font-bold text-white transition hover:bg-black active:scale-[.98]"
              >
                <Phone className="h-5 w-5" aria-hidden />
                {phone}
              </a>
            </div>
            {content.heroTicks.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold">
                {content.heroTicks.map((t) => (
                  <Tick key={t}>{t}</Tick>
                ))}
              </ul>
            )}
            {/* For people who'd rather text than ring or fill in a form. */}
            <a
              href={whatsappUrl(phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 hover:underline"
            >
              <MessageCircle className="h-5 w-5 text-[#25d366]" aria-hidden />
              Or message us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 2. Four reasons — British Gas's "Why upgrade" row straight under
          the hero: the whole offer in two seconds. */}
      {content.proofStats.length > 0 && (
        <section className="pt-10 md:pt-14">
          <ul className={`site-container grid grid-cols-2 gap-3 md:gap-5 ${content.proofStats.length >= 4 ? "lg:grid-cols-4" : "md:grid-cols-3"}`}>
            {content.proofStats.map((s) => (
              <li key={`${s.value}${s.label}`} className={`${card} p-5 md:p-7`}>
                <span className="block font-heading text-[1.9rem] font-semibold leading-none tracking-[-0.03em] md:text-[2.6rem]">
                  {s.value}
                </span>
                <span className="mt-2.5 block text-sm leading-snug text-[#0b0d0e]/65 md:text-[15px]">{s.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. Reviews — E.ON's: a rating line, then cards. Each card shows the
          review's best sentence (lib/reviewHighlight), not its first words. */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="site-container">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <h2 className={h2}>{content.reviewsHeading || "What our customers say"}</h2>
              {trust && <p className="text-sm font-semibold">{trust}</p>}
            </div>
            <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.name} className={`${card} flex flex-col p-7`}>
                  <span className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-[#f5b301] text-[#f5b301]" : "text-black/15"}`} aria-hidden />
                    ))}
                  </span>
                  <p className="mt-4 flex-1 text-lg font-medium leading-snug">&ldquo;{reviewHighlight(r.quote)}&rdquo;</p>
                  <p className="mt-5 text-sm text-[#0b0d0e]/55">{r.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4. The quiz — Aira's tap tiles, on the page. Beside it, what the
          price covers (Aira's "everything under one roof") and, once the owner
          gives one, a typical price (E.ON's / Octopus's strongest line). */}
      <section id="grant-quiz" className="scroll-mt-20 pb-20 md:pb-28">
        <div className="site-container grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          <div className="order-2 lg:order-1">
            {(content.includedHeading || content.costAmount) && (
              <div className={`${card} p-7 md:p-9`}>
                {content.costAmount && (
                  <p className="mb-7 border-b border-black/10 pb-7">
                    <span className="block font-heading text-[3rem] font-semibold leading-none tracking-[-0.03em]">{content.costAmount}</span>
                    {content.costLabel && <span className="mt-2 block text-[#0b0d0e]/65">{content.costLabel}</span>}
                  </p>
                )}
                {content.includedHeading && (
                  <h2 className="font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.01em] md:text-[1.75rem]">
                    {content.includedHeading}
                  </h2>
                )}
                {content.includedItems.length > 0 && (
                  <ul className="mt-6 space-y-3.5 text-[15px]">
                    {content.includedItems.map((item) => (
                      <Tick key={item}>{item}</Tick>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* The low-effort way in, beside the quiz: three fields. */}
            <div className={`${card} mt-6 p-7 md:p-9`}>
              <h2 className="font-heading text-[1.375rem] font-semibold leading-tight">Rather we call you?</h2>
              <p className="mt-1.5 mb-5 text-[15px] text-[#0b0d0e]/65">Leave your number and we&apos;ll ring you within one working day.</p>
              <CallbackForm source={`${source} (call me back)`} service={service} />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <GrantQuiz
              heading={content.quizHeading}
              subheading={content.quizSubheading}
              // Its own label, so the inbox shows how many leads the quiz
              // brings in against the closing copy.
              source={`${source} (grant quiz)`}
              service={service}
              trust={trust}
            />
          </div>
        </div>
      </section>

      {/* 5. The grant — E.ON's: short, and "we manage it for you" up front.
          Who qualifies on the left, how it reaches your price on the right. */}
      {content.grantHeading && (
        <section className="bg-white py-20 md:py-28">
          <div className="site-container grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className={h2}>{content.grantHeading}</h2>
              {content.grantBody && <p className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/70">{content.grantBody}</p>}
              {content.grantSteps.length > 0 && (
                <ol className="mt-10 space-y-6">
                  {content.grantSteps.map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0b0d0e] font-heading font-semibold text-[#c5eb02]">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                        <p className="mt-1 leading-relaxed text-[#0b0d0e]/65">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="rounded-3xl bg-[#f7f7f4] p-7 md:p-10">
              {content.grantAmount && (
                <p>
                  <span className="block font-heading text-[3.5rem] font-semibold leading-none tracking-[-0.04em] md:text-[4.5rem]">
                    {content.grantAmount}
                  </span>
                  {content.grantAmountLabel && <span className="mt-3 block text-lg text-[#0b0d0e]/70">{content.grantAmountLabel}</span>}
                </p>
              )}
              {content.grantChecklist.length > 0 && (
                <>
                  {content.grantChecklistHeading && <h3 className="mt-8 font-heading text-lg font-semibold">{content.grantChecklistHeading}</h3>}
                  <ul className="mt-4 space-y-3 text-[15px]">
                    {content.grantChecklist.map((item) => (
                      <Tick key={item}>{item}</Tick>
                    ))}
                  </ul>
                </>
              )}
              {content.grantNote && (
                <p className="mt-8 rounded-2xl bg-[#c5eb02] p-5 font-semibold leading-snug text-black">{content.grantNote}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. "Will it work in my home?" — every competitor answers the fear
          (Aira's 20°C chart, Octopus's 93% survey, British Gas's promise).
          We have no fleet data, so: our own install, and the three worries in
          the visitor's words with our answer (room-by-room sizing). */}
      {content.problemHeading && (
        <section className="py-20 md:py-28">
          <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {result?.after && (
              <figure className={`${card} overflow-hidden`}>
                <div className="relative aspect-[4/3]">
                  <Image src={result.after} alt={result.afterAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  {result.before && (
                    <div className="absolute bottom-4 right-4 w-[32%] overflow-hidden rounded-xl border-[3px] border-white shadow-lg">
                      <div className="relative aspect-[4/3]">
                        <Image src={result.before} alt={result.beforeAlt} fill sizes="200px" className="object-cover" />
                      </div>
                      <span className="block bg-black/75 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white">Before</span>
                    </div>
                  )}
                </div>
                {(result.title || result.body) && (
                  <figcaption className="p-6">
                    {result.title && <p className="font-heading text-lg font-semibold">{result.title}</p>}
                    {result.body && <p className="mt-1.5 text-[15px] leading-relaxed text-[#0b0d0e]/65">{result.body}</p>}
                  </figcaption>
                )}
              </figure>
            )}
            <div>
              <h2 className={h2}>{content.problemHeading}</h2>
              {content.problemQuestions.length > 0 && (
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {content.problemQuestions.map((q) => (
                    <li key={q} className="rounded-full border border-black/10 bg-white px-4 py-2 text-[15px] font-medium">
                      {q}
                    </li>
                  ))}
                </ul>
              )}
              {paragraphs(content.problemBody).map((p) => (
                <p key={p} className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/70">
                  {p}
                </p>
              ))}
              <div className="mt-9">
                <Actions label={label} phone={phone} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Us vs them, and our promise — the one dark band. The national
          names win on brand; we win on who turns up and who you can call.
          The promise card is British Gas's "Warm Home Promise" slot, filled
          with ours (no monthly plan behind it, unlike Aira's guarantee). */}
      {content.compareHeading && content.compareRows.length > 0 && (
        <section className="bg-[#0b0d0e] py-20 text-white md:py-28">
          <div className="site-container">
            <h2 className={`${h2} mx-auto max-w-3xl text-center`}>{content.compareHeading}</h2>
            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10">
              <table className="w-full table-fixed text-left text-[15px]">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th scope="col" className="w-[30%] p-4 md:p-5">
                      <span className="sr-only">Compared</span>
                    </th>
                    <th scope="col" className="bg-[#c5eb02] p-4 font-heading text-base font-semibold text-black md:p-5 md:text-lg">
                      {content.compareUsLabel || "Us"}
                    </th>
                    <th scope="col" className="p-4 font-heading text-base font-semibold text-white/50 md:p-5 md:text-lg">
                      {content.compareThemLabel || "Others"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.compareRows.map((row) => (
                    <tr key={row.label} className="border-t border-white/10">
                      <th scope="row" className="p-4 align-top font-semibold text-white/90 md:p-5">
                        {row.label}
                      </th>
                      <td className="bg-[#c5eb02]/[0.08] p-4 align-top font-medium md:p-5">
                        <span className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c5eb02]" strokeWidth={3} aria-hidden />
                          {row.us}
                        </span>
                      </td>
                      <td className="p-4 align-top text-white/50 md:p-5">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.guaranteeHeading && (
              <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4 rounded-3xl bg-[#c5eb02] p-7 text-black sm:flex-row sm:items-center md:p-8">
                <ShieldCheck className="h-10 w-10 shrink-0" strokeWidth={1.75} aria-hidden />
                <div>
                  <p className="font-heading text-xl font-semibold md:text-2xl">{content.guaranteeHeading}</p>
                  {content.guaranteeBody && <p className="mt-1.5 leading-relaxed text-black/75">{content.guaranteeBody}</p>}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. Pay your way — E.ON's two plain cards. No rate or monthly figure:
          naming one needs a full representative example; each broker's page
          has theirs. Both brokers shown equally, as everywhere on the site. */}
      {content.payHeading && content.payOptions.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="site-container">
            <h2 className={h2}>{content.payHeading}</h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
              {content.payOptions.map((option, i) => (
                <li key={option.title} className={`${card} flex flex-col p-7 md:p-9`}>
                  <h3 className="font-heading text-[1.5rem] font-semibold tracking-[-0.01em]">{option.title}</h3>
                  <p className="mt-3 flex-1 text-lg leading-relaxed text-[#0b0d0e]/70">{option.body}</p>
                  {i === 0 && (
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {FINANCE_PROVIDERS.map((p) => (
                        <a
                          key={p.slug}
                          href={`/finance/${p.slug}`}
                          // A new tab, so reading the broker's terms doesn't
                          // take a paid visitor off the page.
                          target="_blank"
                          rel="noopener"
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-black/15 px-5 text-sm font-semibold transition hover:border-black"
                        >
                          {p.name}
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 9. How it works — British Gas's horizontal timeline: four steps on
          one line, so the whole journey is one glance. */}
      {content.steps.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <div className="site-container">
            <h2 className={`${h2} text-center`}>{content.stepsHeading || "How it works"}</h2>
            <ol className={`relative mt-14 grid gap-10 md:gap-6 ${content.steps.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
              <span className="absolute left-0 right-0 top-5 hidden h-px bg-black/10 md:block" aria-hidden />
              {content.steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#c5eb02] font-heading font-semibold">{i + 1}</span>
                  <h3 className="mt-5 font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-[#0b0d0e]/65">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-14">
              <Actions label={label} phone={phone} center />
              {content.socialProofLine && <p className="mt-4 text-center text-sm text-[#0b0d0e]/55">{content.socialProofLine}</p>}
            </div>
          </div>
        </section>
      )}

      {/* 10. FAQs — British Gas / E.ON accordions, with the heading and a
          phone number pinned beside them for people who'd rather ask. */}
      {content.faqs.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className={h2}>{content.faqHeading || "Your questions, answered"}</h2>
              <a href={telHref(phone)} className="mt-6 inline-flex items-center gap-2 text-lg font-semibold underline-offset-4 hover:underline">
                <Phone className="h-5 w-5" aria-hidden />
                Ask us: {phone}
              </a>
              <a
                href={whatsappUrl(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-lg font-semibold underline-offset-4 hover:underline"
              >
                <MessageCircle className="h-5 w-5 text-[#25d366]" aria-hidden />
                Message us on WhatsApp
              </a>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {content.faqs.map((faq, i) => (
                <details key={i} className="group py-5" {...(i === 0 ? { open: true } : {})}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
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
        </section>
      )}

      {/* 11. Closing — Aira's big, plain question ("Why put up with another
          winter…?"), with the quiz again for whoever read this far. */}
      <section id="quote" className="scroll-mt-20 bg-white py-20 md:py-28">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[1fr_minmax(360px,460px)] lg:gap-16">
          <div>
            {content.finalHeading && <h2 className={h2}>{content.finalHeading}</h2>}
            {content.finalBody && <p className="mt-5 text-lg leading-relaxed text-[#0b0d0e]/70">{content.finalBody}</p>}
            {content.finalTicks.length > 0 && (
              <ul className="mt-7 space-y-3 font-medium">
                {content.finalTicks.map((t) => (
                  <Tick key={t}>{t}</Tick>
                ))}
              </ul>
            )}
            <a href={telHref(phone)} className="mt-8 inline-flex items-center gap-2 text-lg font-semibold underline-offset-4 hover:underline">
              <Phone className="h-5 w-5" aria-hidden />
              Prefer to talk? Call {phone}
            </a>
          </div>
          <GrantQuiz
            heading={content.quizHeading}
            subheading={content.quizSubheading}
            source={`${source} (grant quiz, closing)`}
            service={service}
            idPrefix="final"
            narrow
          />
        </div>
      </section>
    </main>
  );
}
