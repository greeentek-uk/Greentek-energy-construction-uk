import Link from "next/link";
import { ArrowRight, Check, ReceiptText } from "lucide-react";
import type { ServicePricing } from "@/data/site";

/**
 * "What it costs" — the cost question answered honestly without a figure.
 *
 * Two halves, because they answer two different worries: what moves the price
 * (so the reader can place their own job), and what every quote covers (so
 * they know the number won't grow later). No prices by the owner's decision —
 * everything is quoted after a survey.
 */
export default function ServicePricingSection({
  content,
  eyebrow = "What it costs",
  includedHeading = "Every quote includes",
}: {
  content: ServicePricing | null | undefined;
  /** Reworded per page. */
  eyebrow?: string;
  includedHeading?: string;
}) {
  if (!content?.heading || (!content.factors?.length && !content.included?.length)) return null;

  return (
    <section className="py-10 lg:py-16" aria-labelledby="pricing-heading">
      <div className="site-container">
        <p className="mb-5 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[14px]">
          {eyebrow}
        </p>
        <h2
          id="pricing-heading"
          className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem] text-balance"
        >
          {content.heading}
        </h2>
        {content.intro && (
          <p className="mt-4 site-prose text-lg font-medium leading-relaxed text-white/85">
            {content.intro}
          </p>
        )}

        <div className="mt-8 grid gap-3 lg:grid-cols-12">
          {content.factors?.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 sm:grid-cols-2 lg:col-span-7">
              {content.factors.map((factor) => (
                <li key={factor.title} className="rounded-2xl bg-[#000000] px-6 py-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[#c5eb02]">
                    <ReceiptText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-white md:text-xl">
                    {factor.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
                    {factor.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-xl bg-[#101314] p-3 lg:col-span-5">
            <div className="h-full rounded-2xl bg-[#000000] px-6 py-7">
              {content.included?.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-white md:text-xl">
                    {includedHeading}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {content.included.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#c5eb02]">
                          <Check className="h-3 w-3 text-black" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="text-sm leading-relaxed text-white/80 sm:text-base">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {content.note && (
                <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/60">
                  {content.note}
                </p>
              )}
              {content.ctaLabel && (
                <Link
                  href="#quote"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#c5eb02] px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#c5eb02]/80"
                >
                  {content.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
