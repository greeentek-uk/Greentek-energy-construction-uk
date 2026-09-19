"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import type { FeaturedServicesContent } from "@/data/pageContent";
import AccreditationStrip, { type AccreditationLogo } from "./AccreditationStrip";

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
}: FeaturedServicesContent & { logos: AccreditationLogo[] }) {
  const stripAfter = Math.min(1, items.length - 1);

  return (
    <section className="py-10 md:py-20 lg:py-24">
      <div className="site-container">
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
