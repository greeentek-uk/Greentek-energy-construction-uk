"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { AccreditationsContent, FeaturedServicesContent } from "@/data/pageContent";

type Logo = AccreditationsContent["logos"][number];

/**
 * Accreditation logos scrolling beside a short heading.
 *
 * Pausing is React state driving `animationPlayState` inline, so it can't lose
 * a specificity fight with the keyframes below. Hover and keyboard focus both
 * pause it — a logo is a link, and you can't click something that keeps moving.
 */
function AccreditationStrip({
  heading,
  body,
  logos,
}: {
  heading: string;
  body: string;
  logos: Logo[];
}) {
  const [paused, setPaused] = useState(false);
  if (!logos.length) return null;

  // Rendered twice so the loop joins up seamlessly.
  const loop = [...logos, ...logos];
  const pause = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false),
                  onFocus: () => setPaused(true), onBlur: () => setPaused(false) };

  return (
    <div className="grid items-center gap-6 rounded-xl border border-white/10 bg-[#101314] p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-10">
      <div className="text-center lg:text-left">
        <p className="text-xl font-semibold text-white md:text-2xl text-balance">{heading}</p>
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

/**
 * Featured services as alternating image/text rows, with the accreditation
 * strip set between the second and third.
 *
 * On mobile every row stacks with the image first, so the zig-zag never forces
 * text and image into a cramped side-by-side.
 */
export default function FeaturedServicesClient({
  eyebrow,
  heading,
  subheading,
  items,
  accreditationHeading,
  accreditationBody,
  logos,
}: FeaturedServicesContent & { logos: Logo[] }) {
  const stripAfter = Math.min(1, items.length - 1);

  return (
    <section className="py-10 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <p className="mx-auto mb-6 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[16px]">
            {eyebrow}
          </p>
          <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem] text-balance">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-md font-normal leading-relaxed text-white/80 md:text-xl">
              {subheading}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-16 md:gap-20">
          {items.map((item, i) => {
            const textRight = i % 2 === 1;
            return (
              <Fragment key={`${item.title}-${i}`}>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <div className={`order-2 ${textRight ? "lg:order-2" : "lg:order-1"}`}>
                    <h3 className="text-[1.5rem] font-bold leading-[1.2] text-white md:text-[2rem] text-balance">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="mt-4 text-md leading-relaxed text-white/80 md:text-lg">
                        {item.body}
                      </p>
                    )}
                    {item.href && (
                      <Link
                        href={item.href}
                        className="group mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-[#c5eb02] hover:text-[#c5eb02]"
                      >
                        {item.linkLabel || "Find out more"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>

                  {item.image && (
                    <div
                      className={`relative order-1 aspect-[4/3] overflow-hidden rounded-xl border border-white/10 ${
                        textRight ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.imageAlt || item.title}
                        fill
                        sizes="(min-width: 1024px) 600px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {i === stripAfter && accreditationHeading && (
                  <AccreditationStrip
                    heading={accreditationHeading}
                    body={accreditationBody}
                    logos={logos}
                  />
                )}
              </Fragment>
            );
          })}
        </div>

      </div>
    </section>
  );
}
