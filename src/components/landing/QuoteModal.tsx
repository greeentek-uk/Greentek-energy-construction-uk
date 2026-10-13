"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import HeroQuoteForm, { type FixedService } from "@/components/sections/HeroQuoteForm";

export default function QuoteModal({
  heading,
  subheading,
  source,
  fixedService,
}: {
  heading: string;
  subheading: string;
  source: string;
  fixedService: FixedService;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as Element | null)?.closest?.("[data-quote]");
      if (!trigger || !dialogRef.current) return;
      event.preventDefault();
      if (!dialogRef.current.open) dialogRef.current.showModal();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const lock = () => document.documentElement.classList.add("overflow-hidden");
    const unlock = () => document.documentElement.classList.remove("overflow-hidden");
    const observer = new MutationObserver(() => (dialog.open ? lock() : unlock()));
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={heading}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      className="m-auto w-[calc(100%-1.5rem)] max-w-md bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close"
          className="absolute -top-3 -right-1 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-lg"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div className="rounded-2xl bg-[#101314]">
          <HeroQuoteForm
            heading={heading}
            subheading={subheading}
            source={source}
            fixedService={fixedService}
            idPrefix="quote"
          />
        </div>
      </div>
    </dialog>
  );
}
