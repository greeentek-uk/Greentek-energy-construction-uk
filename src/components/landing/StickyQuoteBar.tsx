"use client";

import { useEffect, useState } from "react";
import { FileText, Phone } from "lucide-react";

/**
 * Call / quote buttons pinned to the bottom of the screen on phones, once the
 * hero has scrolled away.
 *
 * Most ad traffic is mobile, and by the time someone has read the prices or
 * the reviews the form is a long way back up. The bar keeps both ways to
 * convert one tap away without covering the hero, where the form already is.
 * The phone tap is counted as a Contact by AnalyticsProvider's tel: listener.
 */
export default function StickyQuoteBar({
  phone,
  callLabel,
  quoteLabel,
}: {
  phone: string;
  callLabel: string;
  quoteLabel: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById("start");
    // No hero form to watch: stay hidden rather than guess.
    if (!target || typeof IntersectionObserver === "undefined") return;
    // Shown only while the hero form is off screen *above* — not while it's
    // visible, and not before the visitor has scrolled to it.
    const observer = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-[#101314]/95 backdrop-blur-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!shown}
    >
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          tabIndex={shown ? 0 : -1}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 text-sm font-bold text-white active:scale-[.98]"
        >
          <Phone className="h-4 w-4" aria-hidden />
          {callLabel}
        </a>
        <a
          href="#start"
          tabIndex={shown ? 0 : -1}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c5eb02] text-sm font-bold text-black active:scale-[.98]"
        >
          <FileText className="h-4 w-4" aria-hidden />
          {quoteLabel}
        </a>
      </div>
    </div>
  );
}
