"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AboutCard, AboutUsSlideContent } from "@/data/pageContent";

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
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

/**
 * Copy on the left, image on the right — the layout from the reference — built
 * with the site's own card surface and type scale rather than the reference's
 * green panels.
 *
 * The image column only exists once an image is uploaded, so a freshly created
 * card shows clean text instead of an empty box on the live site.
 */
function FeatureCard({ card }: { card: AboutCard }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black sm:flex-row sm:items-stretch">
      <div className="flex flex-1 flex-col justify-center gap-4 p-4 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold leading-[1.25] text-white text-balance">
          {card.title}
        </h3>
        {card.body && (
          <p className="text-md font-normal leading-relaxed text-white/80">
            {card.body}
          </p>
        )}
        {card.linkLabel && card.href && (
          <Link
            href={card.href}
            className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-[#c5eb02] hover:text-[#c5eb02]"
          >
            {card.linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {card.image && (
        <div className="relative min-h-[220px] w-full sm:min-h-0 sm:w-[46%] shrink-0">
          <Image
            src={card.image}
            alt={card.imageAlt || card.title}
            fill
            // Each card is half the row from lg, and the image is just under half the card.
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 46vw, 100vw"
            className="object-contain object-bottom p-4 sm:p-0 sm:pt-6"
          />
        </div>
      )}
    </div>
  );
}

export default function AboutUsClient({
  eyebrow,
  heading,
  body,
  cards,
}: AboutUsSlideContent) {
  const visibleCards = (cards ?? []).filter((card) => card.title);
  const headerFade = useFadeIn(0);

  return (
    <section className="py-10 md:py-20 lg:py-24 overflow-hidden px-4 md:px-10">
      <div className="mx-auto max-w-7xl px-2 md:px-6">
        <div
          ref={headerFade.ref}
          className={`flex flex-col items-center transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit">
            {eyebrow}
          </p>
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white text-center">
            {heading}
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed font-normal text-center">
            {body}
          </p>
        </div>

        {visibleCards.length > 0 && (
          <div
            className={`mt-10 md:mt-12 grid gap-4 bg-[#101314] px-3 py-3 rounded ${
              visibleCards.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {visibleCards.map((card) => (
              <FeatureCard key={card.title} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
