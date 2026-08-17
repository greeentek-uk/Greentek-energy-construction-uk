"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhyUs from "@/components/sections/WhyUs";
import Verticals from "@/components/sections/AboutUs";
import BrandsSection from "@/components/sections/BrandsSection";
import OurProcess from "@/components/sections/Process";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Image from "next/image";
import { siteConfig } from "@/data/site";
import { useEffect, useRef, useState } from "react";

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

function PartnerLogo({ brand, index }: { brand: any; index: number }) {
  const { ref, visible } = useFadeIn(index * 100);

  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-2xl border border-zinc-100 flex items-center justify-center hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="relative w-full h-16">
        <Image
          src={brand.src}
          alt={brand.name}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default function AboutPageClient() {
  const partnersHeaderFade = useFadeIn(0);
  const brands = siteConfig.brands;
  const row1 = brands.slice(0, Math.ceil(brands.length / 2));
  const row2 = brands.slice(Math.ceil(brands.length / 2));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative  bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/60 pt-30 py-20">
            <div className="relative mx-auto max-w-7xl px-6 text-center">
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white">
                Leading the Way in <br />
                <span className="text-[#C5EB02]">Construction & Energy</span>
              </h1>
              <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Greentek is an Agile, Multi-disciplinary construction and Energy
                Firm, dedicated to delivering high-performance solutions for a
                sustainable future.
              </p>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-6">
                  Our Journey Since 2020
                </h2>
                <div className="space-y-4 text-lg text-white/80">
                  <p>
                    Established in 2020, Greentek has rapidly grown into a
                    powerhouse in the UK construction and energy sector. We have
                    successfully delivered over 500 projects under major schemes
                    including ECO3, ECO4, and LA Flex.
                  </p>
                  <p>
                    Our approach is built on two core pillars: Energy &
                    Decarbonization and Commercial & Domestic Construction. By
                    bridging the gap between traditional building practices and
                    modern energy efficiency, we provide a unique, holistic
                    service to our clients.
                  </p>
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
        <WhyUs />
        <Verticals />
        <WhyChooseUs />
        <BrandsSection />
        <OurProcess />
      </main>

      <Footer />
    </div>
  );
}
