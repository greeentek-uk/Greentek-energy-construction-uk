"use client";

import { useSyncExternalStore } from "react";
import { Tag } from "lucide-react";
import { promoActive } from "@/lib/promo";

/**
 * A limited-time offer ("20% off until Christmas") that switches itself off.
 *
 * The landing pages are static HTML built at deploy time, so the server can't
 * be relied on to notice the date passing — a page built on 1 December would
 * still say "20% off" in January. The page leaves it out when it's rendered
 * after the end date, and this hides it in the browser once the end date is
 * past, so an expired offer is never promised to someone reading it.
 */
const noSubscribe = () => () => {};

export default function PromoBadge({ text, ends, dark = false }: { text: string; ends: string; dark?: boolean }) {
  // Shown in the static HTML; the browser's own clock decides after hydration.
  const active = useSyncExternalStore(
    noSubscribe,
    () => promoActive(ends),
    () => true,
  );
  if (!text || !active) return null;
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold uppercase tracking-wide ${
        dark ? "bg-[#c5eb02] text-black" : "bg-[#0b0d0e] text-[#c5eb02]"
      }`}
    >
      <Tag className="h-4 w-4" aria-hidden />
      {text}
    </p>
  );
}
