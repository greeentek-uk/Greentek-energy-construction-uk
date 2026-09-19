"use client";

import Image from "next/image";
import { MessageSquareMore, Phone } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";
import HeroQuoteForm, { type FixedService } from "./HeroQuoteForm";
import TrustRatingBadge from "@/components/site/TrustRatingBadge";
import { whatsappUrl } from "@/lib/whatsapp";

export interface PageQuoteHeroContent {
  image: string;
  imageAlt: string;
  heading: string;
  /** Appended to the heading in the brand colour, e.g. the location name. */
  headingHighlight?: string;
  body: string;
  /** A second paragraph, used by the location + service pages for their local note. */
  secondaryBody?: string;
  phone: string;
  callLabel: string;
  rating: { label: string; score: string; url: string };
  form: {
    heading: string;
    subheading: string;
    source: string;
    fixedService?: FixedService;
  };
}

/**
 * The homepage hero's layout, reused by the service, location and
 * location + service pages: photo behind, copy on the left, quote form on the
 * right.
 *
 * Those three pages previously opened with copy and a button that scrolled
 * down to a form. Putting the form in the fold instead means the page asks for
 * the enquiry at the point the reader is most interested, rather than asking
 * them to travel for it.
 */
export default function PageQuoteHeroClient({
  image,
  imageAlt,
  heading,
  headingHighlight,
  body,
  secondaryBody,
  phone,
  callLabel,
  rating,
  form,
}: PageQuoteHeroContent) {
  const [heroFadeRef, heroFadeVisible] = useFadeIn(100);
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="100vw"
          // Fills the fold, so this is the LCP element on every one of these
          // pages — it has to load eagerly at full width rather than lazily.
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
              heroFadeVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {/* No "back to index" link here: the Breadcrumbs component above
                the header already covers that navigation, and a second one in
                the hero pulled attention away from the form. */}
            <TrustRatingBadge
              label={rating.label}
              score={rating.score}
              url={rating.url}
              className="mx-auto sm:mx-0 mb-8"
            />

            {/* Left to wrap naturally: unlike the homepage's two fixed lines,
                these headings are built from a service or location name and
                have no predictable length to break at. */}
            <h1 className="text-white font-bold leading-[1.1] text-[1.5rem] md:text-[2rem] lg:text-[3.5rem]">
              {heading}
              {headingHighlight && (
                <>
                  {" "}
                  <span className="text-[#c5eb02]">{headingHighlight}</span>
                </>
              )}
            </h1>

            <p className="mt-6 mx-auto sm:mx-0 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
              {body}
            </p>
            {secondaryBody && (
              <p className="mt-3 mx-auto sm:mx-0 text-base md:text-md leading-relaxed text-white/80 max-w-2xl font-normal">
                {secondaryBody}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center sm:justify-start gap-3">
              <a
                href={telHref}
                className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
              >
                <Phone className="inline mr-2 rounded px-1 py-1 text-black" />
                {callLabel}
              </a>
              <a
                href={whatsappUrl(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-white"
              >
                <MessageSquareMore className="inline mr-2 rounded px-1 py-1 text-black" />
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <HeroQuoteForm
              heading={form.heading}
              subheading={form.subheading}
              source={form.source}
              fixedService={form.fixedService}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
