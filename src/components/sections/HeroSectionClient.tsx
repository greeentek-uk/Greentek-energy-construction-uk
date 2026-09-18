"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Phone, MessageSquareMore } from "lucide-react";
import Image from "next/image";
import type { HomeHeroContent } from "@/data/pageContent";
import HeroQuoteForm from "./HeroQuoteForm";
import TrustRatingBadge from "@/components/site/TrustRatingBadge";

/**
 * Homepage hero: one static panel, copy on the left and the two-step quote
 * form on the right.
 *
 * This replaced a three-slide carousel. Rotating copy competes with a form for
 * attention, and moving text beside a field someone is filling in is a
 * distraction rather than a feature.
 */
export default function HeroSectionClient({
  ratingLabel,
  ratingScore,
  ratingUrl,
  image,
  imageAlt,
  headingLine1,
  headingLine2,
  body,
  ctaLabel,
  formHeading,
  formSubheading,
}: HomeHeroContent) {
  const [heroFadeRef, heroFadeVisible] = useFadeIn(100);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt || `${headingLine1} ${headingLine2}`.trim()}
          fill
          sizes="100vw"
          // The hero fills the fold, so this is the LCP element — it has to
          // load eagerly at full width rather than lazily.
          priority
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative px-5 sm:px-15 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_minmax(360px,0.85fr)] lg:gap-14 items-center">
          <div
            ref={heroFadeRef}
            className={`text-center sm:text-left transition-all duration-1000 ease-out ${
              heroFadeVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <TrustRatingBadge
              label={ratingLabel}
              score={ratingScore}
              url={ratingUrl}
              className="mx-auto sm:mx-0 mb-8"
            />

            {/*
              Exactly two lines at every width.

              The break is unconditional — hiding it below `sm` let the two
              halves run together and wrap into four or five lines on phones.
              `text-balance` is gone for the same reason: it redistributes
              lines and fights an explicit break.

              Sizes stay at the original 2.5rem / 3.75rem wherever those
              already fit on two lines, which measurement showed is 540px to
              1023px and 1440px upward. The two clamps cover only the ranges
              that didn't: phones, and 1024–1439px, where the quote form takes
              half the row and leaves the heading a narrower column. Each clamp
              reaches its original size as soon as there is room for it.
            */}
            <h1 className="text-white font-bold leading-[1.1] text-[1.5rem] md:text-[2rem] lg:text-[3.5rem]">
              {headingLine1}
              <br />
              {headingLine2}
            </h1>

            <p className="mt-6 mx-auto sm:mx-0 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
              {body}
            </p>

            <div className="mt-8 flex justify-center sm:justify-start gap-3">
              <a
                href="tel:+443335334567"
                className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
              >
                <Phone className="inline mr-2  rounded px-1 py-1 text-black" />
                {ctaLabel}{" "}
              </a>
              <a
                href="https://wa.me/+443335334567"
                className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-white"
              >
                <MessageSquareMore className="inline mr-2  rounded px-1 py-1 text-black" />
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <HeroQuoteForm heading={formHeading} subheading={formSubheading} />
          </div>
        </div>
      </div>
    </section>
  );
}
