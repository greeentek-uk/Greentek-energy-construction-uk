"use client";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
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

export default function HeroSection() {
  const heroFade = useFadeIn(100);

  return (
    <section className="bg-[url('/images/home-page/house-2.png')] bg-cover bg-center overflow-hidden relative">
      <div className="relative px-5 sm:px-15 py-16 sm:pt-32 lg:pt-40 bg-black/40 flex flex-col">
        <div
          ref={heroFade.ref}
          className={`max-w-3xl transition-all duration-1000 ease-out ${
            heroFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div
            className={`font-medium text-white text-md mb-8 bg-white w-fit py-1.5 px-1 rounded-2xl text-sm`}
          >
            <span
              className={`bg-[#c5eb02] text-zinc-900 rounded-2xl px-3 py-1
              `}
            >
              Trusted
            </span>
            <span className={`mx-2 text-black`}>by 500+ Homeowners</span>
          </div>
          <h1 className="text-white text-[2.5rem] md:text-[4rem] font-bold leading-[1.1] ">
            Bridging <span>Construction</span>{" "}
            <br className="hidden sm:block" />
            with Renewable Energy.
          </h1>

          <p className="mt-8 text-base md:text-md leading-relaxed text-white max-w-2xl font-normal">
            One team for solar, heat pumps, insulation, and full property
            renovation, residential and commercial, across the West Midlands and
            Wales.
          </p>

          <div className="my-12">
            <a
              href="/contact"
              className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
            >
              Consult an Expert{" "}
              <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
            </a>
          </div>
          {/* <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="flex items-center gap-2 text-white text-sm md:text-md">
              <Check className="h-5 w-5 border rounded-full px-0.5 py-0.5" />
              Fully Accredited
            </span>
            <span className="flex items-center gap-2 text-white text-sm md:text-md">
              <Check className="h-5 w-5 border rounded-full px-0.5 py-0.5" />
              Written Warranty
            </span>
            <span className="flex items-center gap-2 text-white text-sm md:text-md">
              <Check className="h-5 w-5 border rounded-full px-0.5 py-0.5" />
              Zero Hidden Fees
            </span>
          </div> */}
        </div>
        {/* <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-4 md:gap-8 mt-10">
          {" "}
          <div>
            <p className="font-medium text-4xl">500+</p>
            <p className="text-white/80 font-normal">Projects Completed</p>
          </div>
          <div>
            <p className="font-medium text-4xl">25+</p>
            <p className="text-white/80 font-normal">Years of Experience</p>
          </div>
          <div>
            <p className="font-medium text-4xl">98%</p>
            <p className="text-white/80 font-normal">Satisfaction Rate</p>
          </div>
        </div> */}
      </div>
    </section>
  );
}
