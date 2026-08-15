"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
}

const accreditations = [
  { name: "Gas Safe Register", src: "/images/accreditations/gas-safe.png" },
  { name: "HIES", src: "/images/accreditations/hies.png" },
  { name: "Quality Mark", src: "/images/accreditations/qualitymark.png" },
  { name: "SWIGA", src: "/images/accreditations/swiga.png" },
];

export default function AccreditationsSection() {
  const introFade = useFadeIn(0);

  return (
    <section
      className="py-12 md:py-16 lg:py-24"
      aria-labelledby="accreditations-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading Block */}
        <div
          ref={introFade.ref}
          className={`max-w-4xl mb-8 transition-all duration-700 ease-out ${
            introFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <h2
            id="accreditations-heading"
            className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white"
          >
            Fully Accredited & Certified.
          </h2>
        </div>

        {/* Logos */}
        <div
          className="w-full grid grid-cols-4 items-center justify-center md:grid-cols-4 gap-6 md:gap-8"
          role="region"
          aria-label="Accreditation logos"
        >
          {accreditations.map((logo) => (
            <div key={logo.name} className="">
              <div className="relative w-25 h-25 md:w-45 md:h-25">
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
    </section>
  );
}
