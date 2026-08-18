"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TestimonialsContent } from "@/data/pageContent";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
}

type Review = TestimonialsContent["items"][number];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col justify-between w-[320px] md:w-[380px] bg-black/40 backdrop-blur-[2px] border border-[#c5eb02]/60 rounded-xl px-4 md:px-6 py-2 md:py-4 mx-3">
      <div>
        <div className="flex gap-4 py-2 md:py-4 items-center">
          <div>
            <Image
              src={review.image}
              alt={review.name}
              width={100}
              height={100}
              className="w-15 h-15 rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{review.name}</p>
            <p className="text-md text-white/70">{review.role}</p>
          </div>
        </div>
        <div className="my-3">
          <p className="text-white">{review.quote}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-yellow-500 text-2xl">{"★".repeat(review.rating)}</p>
      </div>
    </div>
  );
}

export default function TestimonialsClient({
  eyebrow,
  heading,
  subheading,
  items,
}: TestimonialsContent) {
  const headerFade = useFadeIn(0);
  // duplicate the list so the loop is seamless
  const marqueeReviews = [...items, ...items];

  return (
    <section className="bg-[url('/images/home-page/Solar-field-bg.avif')] bg-cover bg-center overflow-hidden">
      <div className="py-12 md:py-16 lg:py-24 bg-linear-to-b from-white to-transparent">
        <div className="mx-auto">
          {/* Centered heading block */}
          <div
            ref={headerFade.ref}
            className={`text-center max-w-4xl mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
              headerFade.visible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit mx-auto">
              {eyebrow}
            </p>
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-black w-[70%] mx-auto">
              {heading}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-black leading-relaxed text-center w-[90%] md:w-[80%] mx-auto font-medium">
              {subheading}
            </p>
          </div>

          {/* Marquee */}
          <div className="relative w-full overflow-hidden group">
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
              {marqueeReviews.map((review, idx) => (
                <ReviewCard key={`${review.name}-${idx}`} review={review} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
