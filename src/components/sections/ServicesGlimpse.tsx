"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Clock,
  Maximize,
  PiggyBank,
  Thermometer,
  TrendingUp,
} from "lucide-react";

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

/* ============================================================
   ADD A BENEFIT — drop an object into the array. The list and
   the image panel stay in sync on their own.
   ============================================================ */
type Benefit = {
  id: string;
  title: string;
  desc: string;
  image: string;
  icon: LucideIcon;
};

const benefits: Benefit[] = [
  {
    id: "bills",
    title: "Lower Electricity Bills",
    desc: "Generate your own power during the day and store what you don't use, so you're buying far less of it back at peak rates.",
    image: "/images/projects/Examples/Solar Panel Installation.png",
    icon: PiggyBank,
  },
  {
    id: "warmth",
    title: "A Warmer, Cheaper Home",
    desc: "Insulation and efficient heating work together. Keep the heat in first, then the system you're running costs a fraction of what it did before.",
    image: "/images/projects/External Wall Insulation/after.jpg",
    icon: Thermometer,
  },
  {
    id: "space",
    title: "More Usable Space",
    desc: "An extension or loft conversion adds the room the household actually needs, without the cost and upheaval of moving house to get it.",
    image: "/images/projects/RIR/Mid RiR.jpeg",
    icon: Maximize,
  },
  {
    id: "value",
    title: "Higher Property Value",
    desc: "A better EPC rating and finished, professionally certified work both show up when the property is valued, surveyed or let.",
    image: "/images/projects/heating-system.jpg",
    icon: TrendingUp,
  },
  {
    id: "funding",
    title: "Grants & Funding Support",
    desc: "Several measures qualify for government funding or reduced VAT. We check what your property is eligible for before you commit to anything.",
    image: "/images/projects/Shop Chimney/Post shop.jpeg",
    icon: Banknote,
  },
  {
    id: "one-programme",
    title: "One Job, Not Three",
    desc: "Doing the energy work and the building work on the same programme means one set of scaffolding, one clean-up, and one team accountable at the end.",
    image: "/images/projects/Examples/Solar Panel Installation.png",
    icon: Clock,
  },
];

export default function Benefits() {
  const headerFade = useFadeIn(0);
  const bodyFade = useFadeIn(150);
  const [active, setActive] = useState(0);

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
            The Benefits
          </p>
          <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem]">
            What The Work Gives You Back.
          </h2>
          <p className="mt-4 text-md font-normal leading-relaxed text-white/80 md:text-xl">
            Cheaper bills, a warmer property and more space to live in, from one
            upgrade programme instead of three separate jobs.
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
          {/* LEFT: benefit list */}
          <div className="order-2 flex flex-col gap-3 lg:order-1">
            {benefits.map((benefit, i) => {
              const isActive = i === active;
              const Icon = benefit.icon;

              return (
                <button
                  key={benefit.id}
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
                      {benefit.title}
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
                      {benefit.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: image panel */}
          <div className="relative order-1 min-h-[280px] w-full overflow-hidden rounded-2xl bg-[#000000] lg:order-2 lg:min-h-full">
            {benefits.map((benefit, i) => (
              <Image
                key={benefit.id}
                src={benefit.image}
                alt={benefit.title}
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