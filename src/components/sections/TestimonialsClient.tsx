"use client";

import { useEffect, useRef, useState } from "react";
import type { TestimonialsContent } from "@/data/pageContent";
import ReviewIdentity, {
  ReviewSourceBadge,
} from "@/components/site/ReviewIdentity";

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

function ReviewCard({
  review,
  onPause,
  onResume,
}: {
  review: Review;
  onPause: () => void;
  onResume: () => void;
}) {
  const inner = (
    <>
      <div>
        <ReviewIdentity
          name={review.name}
          role={review.role}
          image={review.image}
          imageAlt={review.imageAlt}
        />
        <div className="my-3">
          <p className="text-white">{review.quote}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <ReviewSourceBadge source={review.source} />
        <p className="ml-auto text-yellow-500 text-2xl leading-none">
          {"★".repeat(review.rating)}
        </p>
      </div>
    </>
  );

  const shell =
    "flex flex-col justify-between w-[320px] md:w-[380px] bg-black/40 backdrop-blur-[2px] border border-[#c5eb02]/60 rounded-xl px-4 md:px-6 py-2 md:py-4 mx-3";

  // Focus pauses as well as hover, so someone tabbing through the links can
  // actually reach them instead of chasing a moving target.
  const handlers = {
    onMouseEnter: onPause,
    onMouseLeave: onResume,
    onFocus: onPause,
    onBlur: onResume,
  };

  if (review.url) {
    return (
      <a
        href={review.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read ${review.name}'s full review`}
        className={`${shell} transition-colors hover:border-[#c5eb02] focus-visible:border-[#c5eb02] focus-visible:outline-none`}
        {...handlers}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={shell} {...handlers}>
      {inner}
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
  const [paused, setPaused] = useState(false);
  // duplicate the list so the loop is seamless
  const marqueeReviews = [...items, ...items];

  return (
    <section className="bg-[url('/images/home-page/Solar-field-bg.avif')] bg-cover bg-center overflow-hidden">
      <div className="py-10 md:py-20 lg:py-24 bg-linear-to-b from-white to-transparent">
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
          <div className="relative w-full overflow-hidden">
            <div
              className="flex w-max animate-marquee"
              style={{ animationPlayState: paused ? "paused" : "running" }}
            >
              {marqueeReviews.map((review, idx) => (
                <ReviewCard
                  key={`${review.name}-${idx}`}
                  review={review}
                  onPause={() => setPaused(true)}
                  onResume={() => setPaused(false)}
                />
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
