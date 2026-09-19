"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import Link from "next/link";
import { createElement } from "react";
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
import type { ServiceCardData } from "@/lib/serviceGroups";

/**
 * Icons keyed by service, not by position.
 *
 * The homepage used to zip a fixed icon list against its cards by index, so
 * reordering or inserting a card shifted every icon after it onto the wrong
 * service. Keying by slug keeps each icon on its service everywhere it appears.
 */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  "solar-pv-installations": Sun,
  "air-source-heat-pump-installations": Thermometer,
  "heating-system-upgrades": Flame,
  "loft-insulation": Layers,
  "external-wall-insulation-rendering": PaintRoller,
  "full-home-renovation": Home,
  "single-storey-extension": Ruler,
  "loft-conversions": Blocks,
  "kitchen-renovations": Hammer,
  "living-room-improvements": Sofa,
  "commercial-planned-maintenance": Wrench,
};

/**
 * The service slug is the last path segment, whether the card links to
 * `/services/loft-insulation` or to `/locations/cardiff/loft-insulation` —
 * matching on a `/services/` prefix meant every card on a location page fell
 * through to the default icon.
 */
function iconFor(href: string): LucideIcon {
  const slug = href.split("?")[0].split("/").filter(Boolean).pop() ?? "";
  return SERVICE_ICONS[slug] ?? Wrench;
}


/** The homepage service card, shared by the homepage and every services listing. */
export function ServiceCard({ service, delay = 0 }: { service: ServiceCardData; delay?: number }) {
  const [fadeRef, fadeVisible] = useFadeIn(delay);

  return (
    <div
      ref={fadeRef}
      className={`transition-all duration-700 ${
        fadeVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <Link
        href={service.href}
        className="group relative flex h-full flex-col rounded-2xl bg-[#000000] px-6 py-7 md:px-10 md:py-10"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-[#c5eb02] transition-colors duration-300 group-hover:bg-[#c5eb02] group-hover:text-black">
          {/* createElement rather than `const Icon = iconFor(...)`: a component
              looked up during render and then used as a tag is treated as a
              new component each render, which resets its state. */}
          {createElement(iconFor(service.href), {
            className: "h-6 w-6 md:h-10 md:w-10",
            strokeWidth: 1.75,
          })}
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

/** The dark tray the cards sit in, three across on desktop. */
export function ServiceCardGrid({
  services,
  offset = 0,
}: {
  services: ServiceCardData[];
  offset?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#101314] p-3 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, i) => (
        <ServiceCard key={service.href} service={service} delay={offset + i * 80} />
      ))}
    </div>
  );
}

/** A group heading with its "View all" link, followed by that group's cards. */
export function ServiceGroup({
  name,
  intro,
  href,
  services,
  offset = 0,
  showLink = true,
}: {
  name: string;
  intro?: string;
  href: string;
  services: ServiceCardData[];
  offset?: number;
  showLink?: boolean;
}) {
  const [fadeRef, fadeVisible] = useFadeIn(offset);

  return (
    <div>
      <div
        ref={fadeRef}
        className={`mb-8 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between transition-all duration-700 ${
          fadeVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div>
          <h3 className="text-xl md:text-2xl font-semibold leading-[1.3] text-white">{name}</h3>
          {intro && (
            <p className="mt-2 max-w-xl text-sm md:text-base leading-relaxed text-white/70">
              {intro}
            </p>
          )}
        </div>

        {showLink && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase text-[#c5eb02]"
          >
            View {name}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <ServiceCardGrid services={services} offset={offset} />
    </div>
  );
}
