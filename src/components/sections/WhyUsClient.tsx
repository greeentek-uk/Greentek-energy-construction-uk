"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Handshake, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WhyUsContent } from "@/data/pageContent";

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

const ITEM_ICONS: LucideIcon[] = [Award, Users, Handshake];

export default function WhyUsClient({
  eyebrow,
  headingLine1,
  headingLine2,
  subheading,
  items,
}: WhyUsContent) {
  const headerFade = useFadeIn(0);

  return (
    <section className="gap-4 md:gap-6 py-12 md:py-16 lg:py-24 overflow-hidden mx-auto px-4 md:px-10">
      {" "}
      <div>
        {/* Centered heading block */}
        <div
          ref={headerFade.ref}
          className={`mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit text-center mx-auto">
            {eyebrow}
          </p>
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white text-center">
            {headingLine1}
            <br /> {headingLine2}
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed w-[80%] text-center md:w-3/4 font-normal mx-auto">
            {subheading}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-7xl mx-auto">
        {items.map((item, i) => {
          const Icon = ITEM_ICONS[i] ?? Award;
          return (
            <div
              key={item.heading}
              className="bg-[#101314] rounded-xl border border-[#C5EB02] py-4 px-4 md:py-6 md:px-6 "
            >
              <Icon className="text-[#C5EB02] w-8 h-8 mb-4" />
              <h3 className="mb-2 font-bold text-xl md:text-2xl">{item.heading}</h3>
              <p className="text-white/80 text-md">{item.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
