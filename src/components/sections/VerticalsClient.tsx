"use client";

import { useEffect, useRef, useState } from "react";
import type { VerticalsContent } from "@/data/pageContent";
import { ServiceGroup } from "@/components/site/ServiceCards";

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

export default function VerticalsClient({ eyebrow, heading, subheading, groups }: VerticalsContent) {
  const headerFade = useFadeIn(0);

  return (
    <section className="py-10 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={headerFade.ref}
          className={`mx-auto mb-12 max-w-3xl text-center transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mx-auto mb-6 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[16px]">
            {eyebrow}
          </p>
          <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-4 text-md font-normal leading-relaxed text-white/80 md:text-xl">
            {subheading}
          </p>
        </div>

        <div className="flex flex-col gap-12 md:gap-14">
          {groups.map((group, gIdx) => (
            <ServiceGroup
              key={group.name}
              name={group.name}
              intro={group.intro}
              href={group.href}
              services={group.services}
              offset={gIdx * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
