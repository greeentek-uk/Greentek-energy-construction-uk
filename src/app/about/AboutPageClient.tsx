"use client";

import type { ReactNode } from "react";
import type { SiteConfig } from "@/data/site";
import type { AboutPageContent } from "@/data/pageContent";

export default function AboutPageClient({
  siteConfig,
  content,
  whyUsSlot,
  aboutUsSlot,
  whyChooseUsSlot,
  brandsSlot,
  processSlot,
}: {
  siteConfig: SiteConfig;
  content: AboutPageContent;
  whyUsSlot: ReactNode;
  aboutUsSlot: ReactNode;
  whyChooseUsSlot: ReactNode;
  brandsSlot: ReactNode;
  processSlot: ReactNode;
}) {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative  bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
        <div className="bg-black/60 pt-30 py-20">
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white">
              {content.heroHeadingLine1} <br />
              <span className="text-[#C5EB02]">{content.heroHeadingHighlight}</span>
            </h1>
            <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {content.heroSubheading}
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-6">
                {content.journeyHeading}
              </h2>
              <div className="space-y-4 text-lg text-white/80">
                {content.journeyParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {siteConfig.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#101314] p-8 rounded-2xl border border-[#c5eb02] "
                >
                  <div className="text-4xl font-bold text-[#c5eb02]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-white/80 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {whyUsSlot}
      {aboutUsSlot}
      {whyChooseUsSlot}
      {brandsSlot}
      {processSlot}
    </main>
  );
}
