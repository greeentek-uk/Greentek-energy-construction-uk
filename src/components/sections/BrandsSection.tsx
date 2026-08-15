"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

// Filenames match the assets already live on greentekenergy.co.uk/images/brands/
const brands = [
  { name: "AIKO", src: "/images/brands/aiko.png" },
  { name: "Growatt", src: "/images/brands/growatt.png" },
  { name: "Ideal Heating", src: "/images/brands/ideal-heating.png" },
  { name: "InstaGen", src: "/images/brands/instagen.png" },
  { name: "JinkoSolar", src: "/images/brands/jinko-solar.png" },
  { name: "SolaX", src: "/images/brands/solax.png" },
  { name: "Trinasolar", src: "/images/brands/trina-solar.png" },
  { name: "Vaillant", src: "/images/brands/vaillant.png" },
  { name: "Worcester Bosch", src: "/images/brands/worcester.png" },
  // Note: on the live site this logo file is oddly named "0x0.png" — worth
  // renaming to something sane like "swip.png" in your own /public folder
  // rather than carrying the typo forward.
  { name: "SWIP", src: "/images/brands/swip.png" },
];

export default function BrandsSection() {
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
            Our Network
          </p>
          <h2
            id="brands-heading"
            className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white"
          >
            Trusted by Industry Leaders.
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed text-center w-full md:w-[85%] mx-auto font-normal">
            Strategic partnerships with leading global manufacturers to deliver
            high-performance hardware.
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
          {[...brands, ...brands, ...brands].map((logo, idx) => (
            <div
              key={`${logo.name}-${idx}`}
              className="relative w-28 h-16 md:w-40 md:h-24 shrink-0 bg-white rounded-xl p-4 md:p-6 flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.src}
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
