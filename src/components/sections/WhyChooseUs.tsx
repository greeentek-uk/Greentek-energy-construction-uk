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

type Reason = {
  id: string;
  title: string;
  desc: string;
  image: string;
  icon: LucideIcon;
};

const reasons: Reason[] = [
  {
    id: "certified",
    title: "Certified & Accredited Installers",
    desc: "Every installer is MCS and TrustMark certified, so the work is signed off to the standard your warranty and any grant funding requires.",
    image: "/images/projects/Examples/Solar Panel Installation.png",
    icon: ShieldCheck,
  },
  {
    id: "one-team",
    title: "One Team, Start To Finish",
    desc: "The same team handles the energy work and the building work, so there's a single point of contact and no trades passing the blame between each other.",
    image: "/images/projects/RIR/Mid RiR.jpeg",
    icon: Users,
  },
  {
    id: "fixed-price",
    title: "Fixed-Price, No Surprises",
    desc: "You get a clear written quote before work starts, and that's what you pay, not an inflated final invoice once the job is already underway.",
    image: "/images/projects/heating-system.jpg",
    icon: Banknote,
  },
  {
    id: "funding",
    title: "We Handle The Funding Paperwork",
    desc: "From grant schemes to reduced VAT, we check what your property is eligible for and manage the application so you're not left chasing forms yourself.",
    image: "/images/projects/Shop Chimney/Post shop.jpeg",
    icon: PiggyBank,
  },
  {
    id: "guarantee",
    title: "Workmanship You Can Rely On",
    desc: "Every installation is backed by a workmanship guarantee, so if something isn't right after we've left, we come back and put it right.",
    image: "/images/projects/External Wall Insulation/after.jpg",
    icon: Award,
  },
  {
    id: "local",
    title: "Local Team, On Site When You Need Us",
    desc: "Based in the areas we work in, so if a question comes up during or after the job, you're speaking to someone who can actually visit.",
    image: "/images/projects/Examples/solar.png",
    icon: MapPin,
  },
];

export default function WhyChooseUs() {
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
            Why Choose Us
          </p>
          <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem]">
            Why Homeowners Choose Greentek.
          </h2>
          <p className="mt-4 text-md font-normal leading-relaxed text-white/80 md:text-xl">
            Certified installers, fixed prices and one accountable team, from
            the first survey through to the final sign-off.
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
                      {reason.desc}
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
