"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Banknote,
  MapPin,
  PiggyBank,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { WhyChooseUsContent } from "@/data/pageContent";

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

// Icons stay code-owned, zipped by index against the fetched items.
const REASON_ICONS: LucideIcon[] = [ShieldCheck, Users, Banknote, PiggyBank, Award, MapPin];

export default function WhyChooseUsClient({
  eyebrow,
  heading,
  subheading,
  items,
}: WhyChooseUsContent) {
  const headerFade = useFadeIn(0);
  const bodyFade = useFadeIn(150);
  const [active, setActive] = useState(0);

  const reasons = items.map((item, i) => ({ ...item, icon: REASON_ICONS[i] ?? ShieldCheck }));

  return (
    <section className="py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={headerFade.ref}
          className={`mx-auto mb-12 max-w-3xl text-center transition-all duration-700 ease-out md:mb-16 ${
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

        <div
          ref={bodyFade.ref}
          className={`grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 transition-all duration-700 ease-out lg:grid-cols-2 ${
            bodyFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {/* LEFT: reason list */}
          <div className="order-2 flex flex-col gap-3 lg:order-1">
            {reasons.map((reason, i) => {
              const isActive = i === active;
              const Icon = reason.icon;

              return (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className="group w-full rounded-2xl bg-[#000000] px-5 py-4 text-left md:px-6 md:py-5"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
                        isActive
                          ? "bg-[#c5eb02] text-black"
                          : "bg-white/5 text-[#c5eb02]"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>

                    <span
                      className={`flex-1 text-lg font-semibold transition-colors duration-300 md:text-xl ${
                        isActive ? "text-[#c5eb02]" : "text-white/90"
                      }`}
                    >
                      {reason.title}
                    </span>

                    {isActive ? (
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-[#c5eb02]" />
                    ) : (
                      <ArrowRight className="h-5 w-5 shrink-0 text-white/25 transition-colors group-hover:text-white/60" />
                    )}
                  </div>

                  <div
                    className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                    style={{
                      maxHeight: isActive ? 160 : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                  >
                    <p className="mt-3 pl-14 text-sm leading-relaxed text-white/80 sm:text-base">
                      {reason.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: image panel */}
          <div className="relative order-1 min-h-[280px] w-full overflow-hidden rounded-2xl bg-[#000000] lg:order-2 lg:min-h-full">
            {reasons.map((reason, i) => (
              <Image
                key={reason.id}
                src={reason.image}
                alt={reason.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-500 ease-in-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
