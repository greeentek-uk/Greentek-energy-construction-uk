"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import Image from "next/image";
import type { AccreditationsContent } from "@/data/pageContent";


export default function AccreditationsSectionClient({ heading, logos }: AccreditationsContent) {
  const [introFadeRef, introFadeVisible] = useFadeIn(0, 0.2);

  return (
    <section
      className="py-12 md:py-16 lg:py-24"
      aria-labelledby="accreditations-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading Block */}
        <div
          ref={introFadeRef}
          className={`max-w-4xl mb-8 transition-all duration-700 ease-out ${
            introFadeVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <h2
            id="accreditations-heading"
            className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white"
          >
            {heading}
          </h2>
        </div>

        {/* Logos */}
        <div
          className="w-full grid grid-cols-4 items-center justify-center md:grid-cols-4 gap-6 md:gap-8"
          role="region"
          aria-label="Accreditation logos"
        >
          {logos.map((logo) => (
            <div key={logo.name} className="">
              <div className="relative w-25 h-25 md:w-45 md:h-25">
                <Image
                  src={logo.image}
                  sizes="(min-width: 768px) 180px, 100px"
                  alt={logo.imageAlt || logo.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
