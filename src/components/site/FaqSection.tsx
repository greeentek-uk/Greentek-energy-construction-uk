import type { FaqItem } from "@/data/pages";

/**
 * Renders page-specific FAQs and their FAQPage markup together.
 *
 * Kept as one component so the two can't drift: Google only treats FAQ markup
 * as valid when the same questions and answers are visible on the page, and
 * generating both from one array is what guarantees that.
 *
 * Uses native <details> so answers are readable with JavaScript disabled —
 * crawlers and AI fetchers frequently render without it.
 */
export default function FaqSection({
  faqs,
  heading = "Frequently asked questions",
}: {
  faqs: FaqItem[] | undefined;
  heading?: string;
}) {
  if (!faqs?.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        // Schema wants the answer text, so inline markup is stripped here.
        text: faq.answer.replace(/<[^>]+>/g, "").trim(),
      },
    })),
  };

  return (
    <section className="py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="site-container">
        <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
          {heading}
        </h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => (
            <details key={index} className="group py-5">
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-lg font-semibold text-white list-none">
                <span>{faq.question}</span>
                <span className="mt-1 shrink-0 text-[#c5eb02] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div
                className="mt-3 site-prose text-lg leading-relaxed text-white/70 font-medium [&_a]:text-[#c5eb02] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
