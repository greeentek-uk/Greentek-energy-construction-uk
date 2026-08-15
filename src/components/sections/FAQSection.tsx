"use client";

import { useEffect, useRef, useState } from "react";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return { ref, visible };
}

const faqItems = [
  {
    question: "What services does Greentek provide?",
    answer:
      "We provide comprehensive services including solar PV installation, air source heat pumps, boiler upgrades, new central heating systems, loft insulation, external wall insulation, property refurbishment, kitchen refurbishment, bathroom refurbishment, and building extensions.",
  },
  {
    question:
      "Do you offer air source heat pump conversions and ASHP installation?",
    answer:
      "Yes. Greentek specializes in air source heat pump installation and conversions, helping homeowners transition to efficient, low-carbon heating solutions across West Midlands, Wolverhampton, and Wales.",
  },
  {
    question: "What insulation solutions do you offer?",
    answer:
      "We provide loft insulation and external wall insulation services to improve energy efficiency, reduce utility costs, and meet building regulations for property refurbishment projects.",
  },
  {
    question: "Are you accredited and compliant?",
    answer:
      "Yes, we maintain full compliance with industry standards. We are accredited by leading bodies such as TrustMark, HIES, and Gas Safe, ensuring quality and peace of mind for every solar installation, heat pump setup, and construction project.",
  },
  {
    question:
      "How can I contact Greentek for solar, heat pump, or refurbishment projects?",
    answer:
      "You can reach us directly via phone at 0333 533 4567 or email info@greentekenergy.co.uk. Our team is ready to discuss your solar PV installation, boiler upgrade, property refurbishment, or building extension project and provide a formal quote.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionFade = useFadeIn(0);

  return (
    <section
      className="py-12 md:py-16 lg:py-24 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div
          ref={sectionFade.ref}
          className={`transition-all duration-1000 ease-out ${
            sectionFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          {/* Heading Block */}
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit mx-auto">
              Common Inquiries
            </p>
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="group border hover:border-[#c5eb02] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 md:p-8 text-left transition-colors bg-[#101314] "
                  aria-expanded={openIndex === index}
                >
                  <span className="text-[1.05rem] md:text-[1.25rem] font-medium leading-[1.3] text-white pr-8">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center transition-all duration-500 shadow-sm ${openIndex === index ? "bg-[#c5eb02] border-green-600 text-black rotate-180 shadow-green-500/20" : "bg-white text-black"}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-5 md:p-8 pt-0 text-white/80 leading-relaxed text-base sm:text-lg border-t border-zinc-50 bg-[#101314]">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
