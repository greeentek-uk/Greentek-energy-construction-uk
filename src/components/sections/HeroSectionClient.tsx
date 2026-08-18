"use client";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HomeHeroContent } from "@/data/pageContent";

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

export default function HeroSectionClient({
  trustBadgeSuffix,
  headingLine1,
  headingLine2,
  body,
  ctaLabel,
}: HomeHeroContent) {
  const heroFade = useFadeIn(100);

  return (
    <section className="bg-[url('/images/home-page/house-2.png')] bg-cover bg-center overflow-hidden relative">
      <div className="relative px-5 sm:px-15 py-16 sm:pt-32 lg:pt-40 bg-black/40 flex flex-col">
        <div
          ref={heroFade.ref}
          className={`max-w-3xl transition-all duration-1000 ease-out ${
            heroFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div
            className={`font-medium text-white text-md mb-8 bg-white w-fit py-1.5 px-1 rounded-2xl text-sm`}
          >
            <span
              className={`bg-[#c5eb02] text-zinc-900 rounded-2xl px-3 py-1
              `}
            >
              Trusted
            </span>
            <span className={`mx-2 text-black`}>{trustBadgeSuffix}</span>
          </div>
          <h1 className="text-white text-[2.5rem] md:text-[4rem] font-bold leading-[1.1] ">
            {headingLine1} <br className="hidden sm:block" />
            {headingLine2}
          </h1>

          <p className="mt-8 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
            {body}
          </p>

          <div className="my-12">
            <a
              href="/contact"
              className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
            >
              {ctaLabel}{" "}
              <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
