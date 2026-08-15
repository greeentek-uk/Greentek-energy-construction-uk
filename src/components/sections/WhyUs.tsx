"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Award, Handshake, Users } from "lucide-react";
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

const stats = [
  { value: "2020", label: "Established" },
  { value: "500+", label: "Projects Delivered" },
  { value: "Expertise", label: "Domestic & Commercial" },
  { value: "Nationwide", label: "SERVICE ACROSS THE UK" },
];

function CountUp({
  target,
  suffix = "",
  visible,
}: {
  target: number;
  suffix?: string;
  visible: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function StatCard({ stat, delay }: { stat: (typeof stats)[0]; delay: number }) {
  const fade = useFadeIn(delay);

  const numericValue = stat.value.match(/\d+/);
  const target = numericValue ? parseInt(numericValue[0]) : null;
  const suffix = stat.value.replace(/\d+/g, "");

  return (
    <div
      ref={fade.ref}
      className={`group relative bg-zinc-50 rounded-3xl p-5 md:p-8 border border-zinc-100 transition-all duration-700 hover:bg-white hover:border-[#c5eb02]/20 hover:shadow-2xl hover:shadow-[#c5eb02]/5 hover:-translate-y-1 ${
        fade.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="relative z-10">
        <span className="text-3xl md:text-4xl font-black text-[#c5eb02] leading-none block mb-3 group-hover:scale-105 transition-transform duration-500 origin-left">
          {target !== null ? (
            <CountUp target={target} suffix={suffix} visible={fade.visible} />
          ) : (
            stat.value
          )}
        </span>
        <p className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-zinc-800 transition-colors">
          {stat.label}
        </p>
      </div>
    </div>
  );
}

export default function WhyUs() {
  const headerFade = useFadeIn(0);
  const journeyFade = useFadeIn(100);

  return (
    <section className="gap-4 md:gap-6 py-12 md:py-16 lg:py-24 overflow-hidden mx-auto px-4 md:px-10">
      {" "}
      <div>
        {/* Centered heading block */}
        <div
          ref={headerFade.ref}
          className={`mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit text-center mx-auto">
            Why Greentek
          </p>
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white text-center">
            Three Reasons
            <br /> Home Owners Trust Us.
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed w-[80%] text-center md:w-3/4 font-normal mx-auto">
            Accreditation, experience, and accountability built into every
            project we take on.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-7xl mx-auto">
        <div className="bg-[#101314] rounded-xl border border-[#C5EB02] py-4 px-4 md:py-6 md:px-6 ">
          <Award className="text-[#C5EB02] w-8 h-8 mb-4" />
          <h3 className="mb-2 font-bold text-xl md:text-2xl">BRAND AGNOSTIC</h3>
          <p className="text-white/80 text-md">
            We select the best in class technology or hardware, based on client
            requirements.
          </p>
        </div>
        <div className="bg-[#101314] rounded-xl border border-[#C5EB02] py-4 px-4 md:py-6 md:px-6">
          <Users className="text-[#C5EB02] w-8 h-8 mb-4" />
          <h3 className="mb-2 font-bold text-xl md:text-2xl">FULL LIFECYCLE SUPPORT</h3>
          <p className="text-white/80 text-md">
            From initial consultancy and design to installation and long-term
            maintenance, we stay by your side.
          </p>
        </div>
        <div className="bg-[#101314] rounded-xl border border-[#C5EB02] py-4 px-4 md:py-6 md:px-6 ">
          <Handshake className="text-[#C5EB02] w-8 h-8 mb-4" />
          <h3 className="mb-2 font-bold text-xl md:text-2xl">
            OUR STANDARD. YOUR GUARANTEE.
          </h3>
          <p className="text-white/80 text-md">
            Something not right? We come back and fix it. Free. No questions
            asked, that's a guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
