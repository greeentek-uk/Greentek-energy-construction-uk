"use client";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { HomeHeroContent } from "@/data/pageContent";
import HeroQuoteForm from "./HeroQuoteForm";

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

/**
 * Homepage hero: one static panel, copy on the left and the two-step quote
 * form on the right.
 *
 * This replaced a three-slide carousel. Rotating copy competes with a form for
 * attention, and moving text beside a field someone is filling in is a
 * distraction rather than a feature.
 */
export default function HeroSectionClient({
  trustBadgeSuffix,
  image,
  imageAlt,
  headingLine1,
  headingLine2,
  body,
  ctaLabel,
  formHeading,
  formSubheading,
}: HomeHeroContent) {
  const heroFade = useFadeIn(100);

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
            ref={heroFade.ref}
            className={`text-center sm:text-left transition-all duration-1000 ease-out ${
              heroFade.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="mx-auto sm:mx-0 font-medium text-white text-md mb-8 bg-white w-fit py-1.5 px-1 rounded-2xl text-sm">
              <span className="bg-[#c5eb02] text-zinc-900 rounded-2xl px-3 py-1">
                Trusted
              </span>
              <span className="mx-2 text-black">{trustBadgeSuffix}</span>
            </div>

            <h1 className="text-white text-[2.5rem] md:text-[3.75rem] font-bold leading-[1.1] text-balance">
              {headingLine1} <br className="hidden sm:block" />
              {headingLine2}
            </h1>

            <p className="mt-6 mx-auto sm:mx-0 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
              {body}
            </p>

            <div className="mt-8 flex justify-center sm:justify-start">
              <a
                href="/contact"
                className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
              >
                {ctaLabel}{" "}
                <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
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
