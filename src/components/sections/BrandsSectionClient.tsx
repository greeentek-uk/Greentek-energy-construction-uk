"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { BrandsContent } from "@/data/pageContent";

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

export default function BrandsSectionClient({ eyebrow, heading, subheading, logos }: BrandsContent) {
  const introFade = useFadeIn(0);

  return (
    <section
      className="py-12 md:py-16 lg:py-24 overflow-hidden px-4 md:px-10"
      aria-labelledby="brands-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading Block */}
        <div
          ref={introFade.ref}
          className={`text-center max-w-4xl mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
            introFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit mx-auto">
            {eyebrow}
          </p>
          <h2
            id="brands-heading"
            className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white"
          >
            {heading}
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed text-center w-full md:w-[85%] mx-auto font-normal">
            {subheading}
          </p>
        </div>
      </div>

      {/* Single marquee row — all breakpoints */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Edge fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-16 md:w-32 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #000000, transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-16 md:w-32 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #000000, transparent)",
          }}
        />

        <div
          className="flex items-center gap-4 md:gap-8"
          style={{
            animation: "marquee-brands 30s linear infinite",
            width: "max-content",
            willChange: "transform",
          }}
        >
          {[...logos, ...logos, ...logos].map((logo, idx) => (
            <div
              key={`${logo.name}-${idx}`}
              className="relative w-28 h-16 md:w-40 md:h-24 shrink-0 bg-white rounded-xl p-4 md:p-6 flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-brands {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
