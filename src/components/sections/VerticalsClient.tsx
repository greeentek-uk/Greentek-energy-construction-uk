"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Flame,
  Hammer,
  Home,
  Layers,
  PaintRoller,
  Ruler,
  Sofa,
  Sun,
  Thermometer,
  Wrench,
} from "lucide-react";
import type { VerticalsContent } from "@/data/pageContent";

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

// Icons stay code-owned, zipped by [groupIndex][serviceIndex] against the fetched services.
const GROUP_ICONS: LucideIcon[][] = [
  [Sun, Thermometer, Flame, Layers, PaintRoller],
  [Home, Ruler, Blocks, Hammer, Sofa, Wrench],
];

type Service = VerticalsContent["groups"][number]["services"][number] & { icon: LucideIcon };

function ServiceCard({ service, delay }: { service: Service; delay: number }) {
  const fade = useFadeIn(delay);
  const Icon = service.icon;

  return (
    <div
      ref={fade.ref}
      className={`transition-all duration-700 ${
        fade.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <Link
        href={service.href}
        className="group relative flex h-full flex-col rounded-2xl bg-[#000000] px-6 py-7 md:px-10 md:py-10"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-[#c5eb02] transition-colors duration-300 group-hover:bg-[#c5eb02] group-hover:text-black">
          <Icon className="h-6 w-6 md:h-10 md:w-10" strokeWidth={1.75} />
        </span>

        <h4 className="mt-5 pr-8 text-2xl font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#c5eb02]">
          {service.title}
        </h4>

        <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/80">
          {service.body}
        </p>

        <ArrowUpRight className="absolute right-6 top-7 h-5 w-5 text-white/25 transition-colors duration-300 group-hover:text-[#c5eb02] md:right-8 md:top-8" />
      </Link>
    </div>
  );
}

function ServiceGroup({
  group,
  offset,
}: {
  group: Omit<VerticalsContent["groups"][number], "services"> & { services: Service[] };
  offset: number;
}) {
  const fade = useFadeIn(offset);

  return (
    <div>
      <div
        ref={fade.ref}
        className={`mb-8 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between transition-all duration-700 ${
          fade.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div>
          <h3 className="text-xl md:text-2xl font-semibold leading-[1.3] text-white">
            {group.name}
          </h3>
        </div>

        <Link
          href={group.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase text-[#c5eb02]"
        >
          View {group.name}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.services.map((service, i) => (
          <ServiceCard
            key={service.title}
            service={service}
            delay={offset + i * 80}
          />
        ))}
      </div>
    </div>
  );
}

export default function VerticalsClient({ eyebrow, heading, subheading, groups }: VerticalsContent) {
  const headerFade = useFadeIn(0);

  return (
    <section className="py-12 md:py-14 lg:py-18">
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
          {groups.map((group, gIdx) => {
            const icons = GROUP_ICONS[gIdx] ?? GROUP_ICONS[0];
            const servicesWithIcons: Service[] = group.services.map((s, i) => ({
              ...s,
              icon: icons[i] ?? Sun,
            }));
            return (
              <ServiceGroup
                key={group.name}
                group={{ ...group, services: servicesWithIcons }}
                offset={gIdx * 100}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
