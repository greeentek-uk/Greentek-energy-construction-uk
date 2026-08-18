"use client";
import { ArrowRight } from "lucide-react";
import type { AreasContent } from "@/data/pageContent";

export default function AreasClient({
  eyebrow,
  heading,
  subheading,
  largeArea,
  smallAreas,
  tickerItems: uniqueTickerItems,
  tickerLabel,
  ctaLabel,
}: AreasContent) {
  // Duplicate the list so the marquee loops seamlessly
  const tickerItems = [...uniqueTickerItems, ...uniqueTickerItems];

  return (
    <section className="py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
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
          {/* Large tile — home base */}
          <div
            className="lg:row-span-2 lg:col-span-2 relative rounded-md overflow-hidden min-h-[280px] lg:min-h-0"
            onClick={() => (window.location.href = largeArea.path)}
          >
            <img
              src={largeArea.image}
              alt={largeArea.name}
              className="absolute inset-0 w-full h-full object-cover position-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <h3 className="text-white text-xl md:text-2xl font-bold">
                {largeArea.name}
              </h3>
              {largeArea.note && (
                <p className="text-white/70 text-xs mt-2 max-w-md">
                  {largeArea.note}
                </p>
              )}
            </div>
          </div>

          {/* Small tiles */}
          {smallAreas.map((area) => (
            <div
              key={area.name}
              className="relative rounded-md overflow-hidden min-h-[160px]"
              onClick={() => (window.location.href = area.path)}
            >
              <img
                src={area.image}
                alt={area.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from- 20% from-black/75 via-black/10 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-4">
                <h4 className="text-white text-lg font-bold">{area.name}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee ticker */}
        <div className="mt-4 relative flex items-center bg-zinc-900 rounded-md overflow-hidden h-16">
          <div className="flex-shrink-0 z-10 h-full flex flex-col justify-center px-6 bg-zinc-900">
            <p className="text-white text-sm font-semibold uppercase leading-none whitespace-nowrap">
              {tickerLabel}
            </p>
          </div>

          <div className="relative flex-1 overflow-hidden h-full">
            <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap">
              {tickerItems.map((city, i) => (
                <span
                  key={`${city}-${i}`}
                  className="flex items-center text-white/80 text-sm font-semibold px-4"
                >
                  {city}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5EB02] ml-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-center items-center">
          <a
            href="/locations"
            className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
          >
            {ctaLabel}{" "}
            <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
          </a>
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
      `}</style>
    </section>
  );
}
