"use client";

import { useEffect, useState } from "react";
import { FileText, Phone } from "lucide-react";

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
    const target = document.getElementById("hero-cta");
    if (!target || typeof IntersectionObserver === "undefined") return;
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
          href="#quote"
          data-quote
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
