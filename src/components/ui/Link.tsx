"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * next/link that prefetches on intent (hover, focus, touch) instead of as soon
 * as a link scrolls into view.
 *
 * Measured on the live homepage (2026-09-30): one visit scrolled to the bottom
 * made 196 requests to Vercel, 129 of them viewport prefetches of pages the
 * visitor never opened — ~4.9 MB, two-thirds of the site's edge requests. A
 * hovered or touched link still prefetches ~100–300 ms before the click, so
 * navigation stays near-instant; only the pages nobody points at are skipped.
 *
 * Drop-in for next/link on the public site. An explicit `prefetch` prop still
 * wins, for the rare link that should load eagerly.
 */
export default function Link({ prefetch, onMouseEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "";
  const internal = href.startsWith("/") && !href.startsWith("//");

  const warm = () => {
    if (internal && prefetch !== false) router.prefetch(href);
  };

  return (
    <NextLink
      {...props}
      prefetch={prefetch ?? false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
    />
  );
}
