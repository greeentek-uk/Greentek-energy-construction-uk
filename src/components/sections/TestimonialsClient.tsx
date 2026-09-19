"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { useEffect, useRef, useState } from "react";
import type { TestimonialsContent } from "@/data/pageContent";
import ReviewIdentity, {
  ReviewSourceBadge,
} from "@/components/site/ReviewIdentity";

type Review = TestimonialsContent["items"][number];

function ReviewCard({
  review,
  onStop,
  onClickCapture,
}: {
  review: Review;
  onStop: () => void;
  onClickCapture: (event: React.MouseEvent) => void;
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

  // Keyboard focus counts as interacting, so the slider stops for good and the
  // links can be reached instead of chased.
  const handlers = {
    onFocus: onStop,
    // A drag ends with a click on whatever card is under the pointer; that
    // click must not open the review.
    onClickCapture: onClickCapture,
    draggable: false,
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
  const [headerFadeRef, headerFadeVisible] = useFadeIn(0, 0.2);
  const {
    trackRef,
    stopped,
    stop,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onClickCapture,
  } = useDraggableMarquee();
  // duplicate the list so the loop is seamless
  const marqueeReviews = [...items, ...items];

  return (
    <section className="bg-[url('/images/home-page/Solar-field-bg.avif')] bg-cover bg-center overflow-hidden">
      <div className="py-10 md:py-20 lg:py-24 bg-linear-to-b from-white to-transparent">
        <div className="mx-auto">
          {/* Centered heading block */}
          <div
            ref={headerFadeRef}
            className={`text-center max-w-4xl mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
              headerFadeVisible
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

          {/* Marquee: scrolls on its own, and can be dragged with a mouse or
              swiped on a phone. Once someone drags it, it stays where they
              left it.

              Deliberately full-bleed — unlike every other section it is not
              held to site-container. */}
          <div
            className="relative w-full overflow-hidden cursor-grab select-none active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            data-testid="testimonials-marquee"
            data-stopped={stopped || undefined}
          >
            <div ref={trackRef} className="flex w-max will-change-transform">
              {marqueeReviews.map((review, idx) => (
                <ReviewCard
                  key={`${review.name}-${idx}`}
                  review={review}
                  onStop={stop}
                  onClickCapture={onClickCapture}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** How long one full loop takes when nobody is touching it, as before. */
const LOOP_SECONDS = 30;
/** Movement (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 6;

/**
 * Drives the testimonials marquee from JavaScript rather than a CSS animation,
 * so it can be dragged: the position is one number, moved by time while it
 * runs and by the pointer while it's held.
 *
 * - Hovering anywhere over it pauses it until the pointer leaves. (Hover is
 *   tracked on the whole strip, not per card: cards slide under a still
 *   pointer without firing enter/leave, so a pointer resting in a gap would
 *   never pause it.)
 * - Dragging, swiping or focusing a card stops it for good — someone reading
 *   shouldn't have the text move away from them again.
 * - Visitors who ask for reduced motion get no automatic movement at all.
 */
function useDraggableMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const hovering = useRef(false);
  const stoppedRef = useRef(false);
  const [stopped, setStopped] = useState(false);
  const drag = useRef<{ pointerId: number; startX: number; startOffset: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      // The list is rendered twice, so half the width is one full loop.
      const loop = track.scrollWidth / 2;
      if (loop > 0) {
        if (!reducedMotion && !stoppedRef.current && !hovering.current && !drag.current) {
          offset.current -= (loop / LOOP_SECONDS) * dt;
        }
        // Wrap in both directions, so dragging right past the start keeps going.
        offset.current = ((offset.current % loop) - loop) % loop;
        track.style.transform = `translate3d(${offset.current}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function stop() {
    stoppedRef.current = true;
    setStopped(true);
  }

  function onPointerEnter(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") hovering.current = true;
  }

  function onPointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") hovering.current = false;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offset.current,
      moved: false,
    };
    // Touching the slider on a phone is interacting with it, even before it moves.
    if (event.pointerType !== "mouse") stop();
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    if (!current.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      current.moved = true;
      stop();
      // Keep receiving moves even if the pointer leaves the slider.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    offset.current = current.startOffset + dx;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    suppressClick.current = current.moved;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onClickCapture(event: React.MouseEvent) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    trackRef,
    stopped,
    stop,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onClickCapture,
  };
}
