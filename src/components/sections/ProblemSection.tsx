import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import type { ProblemSection as ProblemSectionContent } from "@/data/site";

/**
 * Problem-agitation block for a service: the reader's frustrations, named in
 * their own terms, before the page moves on to what's included.
 *
 * Laid out like the rest of the site — copy on the left, cards in the dark
 * tray on the right, the same card treatment as the service cards — so it
 * reads as part of the page rather than a bolted-on sales panel.
 */
export default function ProblemSection({
  content,
  eyebrow = "Sound familiar?",
}: {
  content: ProblemSectionContent | null | undefined;
  /** Reworded per page so 77 pages don't share one label. */
  eyebrow?: string;
}) {
  if (!content?.heading || !content.cards?.length) return null;

  const paragraphs = content.intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="py-10 lg:py-16" aria-labelledby="problem-heading">
      <div className="site-container">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="mb-5 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[14px]">
              {eyebrow}
            </p>
            <h2
              id="problem-heading"
              className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.25rem] text-balance"
            >
              {content.heading}
            </h2>
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`mt-4 leading-relaxed ${
                  i === 0 ? "text-lg font-medium text-white/85" : "text-base text-white/70"
                }`}
              >
                {paragraph}
              </p>
            ))}
            {content.ctaLabel && (
              // #quote is the full enquiry form further down the page.
              <Link
                href="#quote"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#c5eb02] px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#c5eb02]/80"
              >
                {content.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <ul className="grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 sm:grid-cols-2 lg:col-span-7">
            {content.cards.map((card) => (
              <li key={card.title} className="rounded-2xl bg-[#000000] px-6 py-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[#c5eb02]">
                  <CircleAlert className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-white md:text-xl">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
                  {card.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
