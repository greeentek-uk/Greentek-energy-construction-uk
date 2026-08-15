"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   ADD SLIDES HERE — copy a block and change the values.
   `date` and `href` are optional. Everything else (progress
   bars, arrows, timing) adapts on its own.
   ============================================================ */
type Slide = {
  image: string;
  title: string;
  text: string;
  href?: string;
  date?: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/verticals/energy.avif",
    href: "/energy-solutions",
    title: "Energy Solutions",
    text: "Turnkey multi-measure energy upgrades, from Solar PV to high-efficiency thermal systems.",
  },
  {
    image: "/images/verticals/home.jpeg",
    href: "/home-solutions",
    title: "Home Solutions",
    text: "Primary contractor for renovations, extentions, and planned maintenance across residential and commercial properties.",
  },
];

const SLIDE_DURATION = 6000; // ms each slide stays on screen

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

export default function AboutUs() {
  const headerFade = useFadeIn(0);
  const showFade = useFadeIn(100);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  // Respect reduced-motion: hold on the first slide until the user navigates.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  // Reset the timer whenever the slide changes.
  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
  }, [index]);

  // Autoplay.
  useEffect(() => {
    if (paused || SLIDES.length < 2) return;

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      elapsed.current += now - last;
      last = now;

      const ratio = Math.min(elapsed.current / SLIDE_DURATION, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        setIndex((i) => (i + 1) % SLIDES.length);
        return;
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [index, paused]);

  const go = (next: number) =>
    setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section className="py-12 md:py-16 lg:py-24 overflow-hidden px-4 md:px-10">
      <div className="mx-auto max-w-7xl px-2 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ---------- Left: copy ---------- */}
        <div
          ref={headerFade.ref}
          className={`transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit">
            About Us
          </p>
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white">
            A Home That Works Harder, For Less.
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed font-normal">
            We believe you shouldn't need three different companies to power
            your property, fix your heating, and renovate your space. That's why
            Greentek brings solar, heat pumps, and energy storage together with
            expert construction and renovation both residential and commercial,
            so everything gets handled by one accredited team, properly, from
            day one.
          </p>
        </div>

        {/* ---------- Right: slideshow ---------- */}
        <div
          ref={showFade.ref}
          className={`relative w-full h-80 sm:h-[26rem] lg:h-[30rem] rounded-xl border-1 border-white overflow-hidden bg-[#111827] transition-all duration-700 ease-out ${
            showFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {SLIDES.map((slide, i) => {
            const active = i === index;
            const slideClassName = `group absolute inset-0 bg-center bg-cover transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`;
            const slideStyle = { backgroundImage: `url('${slide.image}')` };

            const content = (
              <div className="h-full flex flex-col justify-end px-6 py-6 text-white bg-linear-to-b from-transparent from-45% to-[#111827] to-100%">
                {slide.date && (
                  <span className="text-sm text-white/75 mb-1">
                    {slide.date}
                  </span>
                )}
                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-[#c5eb02] transition-colors">
                  {slide.title}
                </h3>
                <p className="text-md font-normal max-w-[46ch]">
                  {slide.text}
                </p>
              </div>
            );

            if (slide.href) {
              return (
                <Link
                  key={slide.title}
                  href={slide.href}
                  aria-hidden={!active}
                  tabIndex={active ? undefined : -1}
                  className={slideClassName}
                  style={slideStyle}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={slide.title}
                aria-hidden={!active}
                tabIndex={active ? undefined : -1}
                className={slideClassName}
                style={slideStyle}
              >
                {content}
              </div>
            );
          })}

          {/* progress bars */}
          <div className="absolute top-5 left-5 right-[7.5rem] z-20 flex gap-2">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.title}
                className="h-[3px] flex-1 rounded-full bg-white/35 overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width:
                      i < index
                        ? "100%"
                        : i === index
                          ? `${progress * 100}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* pause / play */}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="absolute top-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]"
          >
            {paused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>

          {/* prev / next */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}