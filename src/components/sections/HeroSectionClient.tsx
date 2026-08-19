"use client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HomeHeroContent } from "@/data/pageContent";

const SLIDE_DURATION = 6000;

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

export default function HeroSectionClient({ trustBadgeSuffix, slides }: HomeHeroContent) {
  const heroFade = useFadeIn(100);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images, crossfade */}
      {slides.map((slide, i) => (
        <div
          key={slide.image + i}
          aria-hidden={i !== index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative px-5 sm:px-15 pt-28 sm:pt-32 lg:pt-40 pb-24 sm:pb-28 lg:pb-32 flex flex-col">
        <div
          ref={heroFade.ref}
          className={`max-w-3xl text-center sm:text-left transition-all duration-1000 ease-out ${
            heroFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mx-auto sm:mx-0 font-medium text-white text-md mb-8 bg-white w-fit py-1.5 px-1 rounded-2xl text-sm">
            <span className="bg-[#c5eb02] text-zinc-900 rounded-2xl px-3 py-1">
              Trusted
            </span>
            <span className="mx-2 text-black">{trustBadgeSuffix}</span>
          </div>

          <div className="relative min-h-[280px] sm:min-h-[240px] lg:min-h-[220px]">
            {slides.map((slide, i) => (
              <div
                key={slide.headingLine1 + i}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === index ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <h1 className="text-white text-[2.5rem] md:text-[4rem] font-bold leading-[1.1]">
                  {slide.headingLine1} <br className="hidden sm:block" />
                  {slide.headingLine2}
                </h1>

                <p className="mt-8 mx-auto sm:mx-0 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
                  {slide.body}
                </p>

                <div className="my-12 flex justify-center sm:justify-start">
                  <a
                    href="/contact"
                    className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
                  >
                    {slide.ctaLabel}{" "}
                    <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-5 sm:bottom-10 sm:right-15 lg:bottom-12 z-10 flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.image + i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-[#c5eb02]" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
