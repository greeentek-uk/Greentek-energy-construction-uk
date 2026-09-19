"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AreasContent } from "@/data/pageContent";

export default function AreasClient({
  eyebrow,
  heading,
  subheading,
  largeArea,
  smallAreas,
  tickerLinks: uniqueTickerLinks,
  tickerLabel,
  ctaLabel,
}: AreasContent & {
  /** Ticker names resolved to a page by the server component (see resolveAreaHref). */
  tickerLinks: { name: string; href: string }[];
}) {
  // Duplicate the list so the marquee loops seamlessly
  const tickerLinks = [...uniqueTickerLinks, ...uniqueTickerLinks];

  return (
    <section className="py-10 md:py-20 lg:py-24">
      <div className="site-container">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="w-full mb-4 ">
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit text-center mx-auto">
              {eyebrow}
            </p>
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white text-center">
              {heading}
            </h2>
            <p className="text-white/85 text-sm sm:text-base mt-3 text-center">
              {subheading}
            </p>
          </div>
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large tile — home base. Tiles are real links (they were divs with a
              click handler), so they work with a keyboard, open in a new tab
              and pass link value to the location pages. */}
          <Link
            href={largeArea.path}
            className="group lg:row-span-2 lg:col-span-2 relative block rounded-md overflow-hidden min-h-[280px] lg:min-h-0"
          >
            <Image
              src={largeArea.image}
              alt={largeArea.imageAlt || largeArea.name}
              fill
              sizes="(min-width: 1024px) 860px, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <h3 className="text-white text-xl md:text-2xl font-bold">
                {largeArea.name}
              </h3>
              {/* Same as the group intro on Verticals: editable in the panel,
                  but never rendered, so the copy went nowhere. */}
              {largeArea.stat && (
                <p className="mt-1 text-[#c5eb02] text-sm font-semibold">
                  {largeArea.stat}
                </p>
              )}
              {largeArea.note && (
                <p className="text-white/70 text-xs mt-2 max-w-md">
                  {largeArea.note}
                </p>
              )}
            </div>
          </Link>

          {/* Small tiles */}
          {smallAreas.map((area) => (
            <Link
              key={area.name}
              href={area.path}
              className="relative block rounded-md overflow-hidden min-h-[160px]"
            >
              <Image
                src={area.image}
                alt={area.imageAlt || area.name}
                fill
                sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from- 20% from-black/75 via-black/10 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-4">
                <h4 className="text-white text-lg font-bold">{area.name}</h4>
              </div>
            </Link>
          ))}
        </div>

        {/* Marquee ticker */}
        <div className="mt-4 relative flex items-center bg-zinc-900 rounded-md overflow-hidden h-16">
          <div className="flex-shrink-0 z-10 h-full flex flex-col justify-center px-6 bg-zinc-900">
            <p className="text-white text-sm font-semibold uppercase leading-none whitespace-nowrap">
              {tickerLabel}
            </p>
          </div>

          <div className="relative flex-1 overflow-hidden motion-reduce:overflow-x-auto h-full">
            {/* Pauses on hover and keyboard focus — the names are links now,
                and you can't click something that keeps moving. */}
            <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap">
              {tickerLinks.map((area, i) => {
                // The second copy exists only for the visual loop — hidden
                // from screen readers and the tab order so each is announced once.
                const duplicate = i >= uniqueTickerLinks.length;
                return (
                  <span
                    key={`${area.name}-${i}`}
                    className="flex items-center text-sm font-semibold px-4"
                    aria-hidden={duplicate || undefined}
                  >
                    <Link
                      href={area.href}
                      tabIndex={duplicate ? -1 : undefined}
                      className="text-white/80 underline-offset-4 transition-colors hover:text-[#c5eb02] hover:underline focus-visible:text-[#c5eb02] focus-visible:underline"
                    >
                      {area.name}
                    </Link>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5EB02] ml-4" />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-center items-center">
          <Link
            href="/locations"
            className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
          >
            {ctaLabel}{" "}
            <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover,
        .animate-marquee:focus-within {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
