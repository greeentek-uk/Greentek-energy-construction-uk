"use client";

import Image from "next/image";
import { useState } from "react";
import type { AccreditationsContent } from "@/data/pageContent";

export type AccreditationLogo = AccreditationsContent["logos"][number];

/**
 * Accreditation logos scrolling beside a short heading.
 *
 * Shared by the homepage's featured-services block and the standalone
 * accreditations section on the service, location and location + service
 * pages, so all of them scroll at the same speed and pause the same way.
 *
 * Pausing is React state driving `animationPlayState` inline, so it can't lose
 * a specificity fight with the keyframes below. Hover and keyboard focus both
 * pause it — a logo is a link, and you can't click something that keeps moving.
 */
export default function AccreditationStrip({
  heading,
  body,
  logos,
  headingAs: HeadingTag = "p",
  headingId,
}: {
  heading: string;
  /** Optional supporting line under the heading. */
  body?: string;
  logos: AccreditationLogo[];
  /** "h2" when the strip is a section in its own right; "p" when it sits inside one that already has a heading. */
  headingAs?: "p" | "h2";
  headingId?: string;
}) {
  const [paused, setPaused] = useState(false);
  if (!logos.length) return null;

  // Rendered twice so the loop joins up seamlessly.
  const loop = [...logos, ...logos];
  const pause = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  return (
    <div className="grid items-center gap-6 rounded-xl border border-white/10 bg-[#101314] p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-10">
      <div className="text-center lg:text-left">
        <HeadingTag
          id={headingId}
          className="text-xl font-semibold text-white md:text-2xl text-balance"
        >
          {heading}
        </HeadingTag>
        {body && <p className="mt-2 text-sm text-white/70 md:text-base">{body}</p>}
      </div>

      <div
        className="accr-viewport relative overflow-hidden motion-reduce:overflow-x-auto"
        role="region"
        aria-label="Accreditations"
      >
        <ul
          className="accr-marquee flex w-max items-center"
          style={{
            animationPlayState: paused ? "paused" : "running",
            // Scales with the logo count so speed stays constant as logos are added.
            animationDuration: `${logos.length * 3.5}s`,
          }}
        >
          {loop.map((logo, i) => {
            // The second copy exists only for the visual loop — hide it from
            // screen readers and the tab order so each body is announced once.
            const duplicate = i >= logos.length;
            const chip = (
              <span className="relative block h-full w-full">
                <Image
                  src={logo.image}
                  alt={duplicate ? "" : logo.imageAlt || logo.name}
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </span>
            );
            const chipClass =
              "mx-2 flex h-20 w-36 shrink-0 items-center justify-center rounded-xl bg-white p-3 transition-transform";

            return (
              <li key={`${logo.name}-${i}`} aria-hidden={duplicate || undefined}>
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={duplicate ? -1 : undefined}
                    aria-label={duplicate ? undefined : `${logo.name} (opens in a new tab)`}
                    className={`${chipClass} hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5eb02]`}
                    {...pause}
                  >
                    {chip}
                  </a>
                ) : (
                  <span className={chipClass} {...pause}>
                    {chip}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        @keyframes accr-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .accr-marquee {
          animation-name: accr-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .accr-viewport {
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .accr-marquee { animation: none; }
          .accr-viewport { mask-image: none; }
        }
      `}</style>
    </div>
  );
}
