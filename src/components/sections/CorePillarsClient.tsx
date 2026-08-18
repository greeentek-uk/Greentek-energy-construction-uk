"use client";

import { useEffect, useRef, useState } from "react";
import type { CorePillarsContent } from "@/data/pageContent";

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

// Inline SVG path data stays code-owned, zipped by [pillarIndex][itemIndex] against the fetched item labels.
const PILLAR_ICONS = [
  {
    dividerColor: "bg-green-600",
    shadowColor: "shadow-green-900/10",
    headerLabelColor: "text-green-600",
    iconHover: "group-hover/item:bg-green-50 group-hover/item:text-green-600",
    labelHover: "group-hover/item:text-green-700",
    headerIcon: "M13 10V3L4 14h7v7l9-11h-7z",
    items: [
      "M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
      "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.98 7.98 0 01-2.343 5.657z",
      "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    ],
  },
  {
    dividerColor: "bg-slate-900",
    shadowColor: "shadow-zinc-900/10",
    headerLabelColor: "text-zinc-400",
    iconHover: "group-hover/item:bg-zinc-900 group-hover/item:text-white",
    labelHover: "group-hover/item:text-zinc-900",
    headerIcon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    items: [
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    ],
  },
];

export default function CorePillarsClient({ heading, intro, pillars }: CorePillarsContent) {
  const sectionFade = useFadeIn(0);

  return (
    <section className="bg-white py-12 md:py-16 lg:py-24" aria-labelledby="pillars-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={sectionFade.ref}
          className={`transition-all duration-1000 ease-out ${
            sectionFade.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Header Block */}
          <div className="text-center mb-12 md:mb-16">
            <h2 id="pillars-heading" className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-slate-950 mb-8">
              {heading}
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
              {intro}
            </p>
            <div className="h-1.5 w-16 bg-green-600 mx-auto rounded-full" />
          </div>

          {/* Compounded Integrated Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-zinc-50/50 rounded-[3rem] p-3 sm:p-4 md:p-6 lg:p-8 border border-zinc-100 gap-6 md:gap-10">
            {pillars.map((pillar, pIdx) => {
              const style = PILLAR_ICONS[pIdx] ?? PILLAR_ICONS[0];
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-zinc-100 group transition-all duration-500 hover:shadow-2xl hover:shadow-green-900/5 hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-12 h-12 ${style.dividerColor} rounded-xl flex items-center justify-center text-white shadow-lg ${style.shadowColor} group-hover:scale-105 transition-transform duration-500`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={style.headerIcon} />
                        </svg>
                      </div>
                      <div>
                        <span className={`text-[9px] font-black uppercase ${style.headerLabelColor} block mb-0.5`}>
                          {pillar.label}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{pillar.title}</h3>
                      </div>
                    </div>

                    <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-sm">{pillar.description}</p>

                    <div className="grid grid-cols-1 gap-4 mt-auto">
                      {pillar.items.map((label, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-3 group/item">
                          <div className={`w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 ${style.iconHover} transition-all`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeWidth={1.5} d={style.items[iIdx] ?? style.items[0]} />
                            </svg>
                          </div>
                          <span className={`text-[13px] font-bold text-slate-700 ${style.labelHover} transition-colors`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
