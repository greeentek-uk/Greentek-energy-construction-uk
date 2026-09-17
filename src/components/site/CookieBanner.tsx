"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ConsentState } from "@/lib/consent";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#c5eb02]" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/**
 * The cookie banner: necessary cookies are always on, everything optional is
 * off until the visitor turns it on. "Accept all" and "Necessary only" are
 * given equal weight, as the ICO expects.
 */
export default function CookieBanner({
  initial,
  startInSettings,
  showMarketing,
  metaNecessary,
  onSave,
  onClose,
}: {
  initial: ConsentState | null;
  startInSettings: boolean;
  showMarketing: boolean;
  metaNecessary: boolean;
  onSave: (state: ConsentState) => void;
  /** Present when reopened from "Cookie settings", where closing keeps the current choice. */
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [managing, setManaging] = useState(startInSettings);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);

  // The admin panel isn't the public site — no banner over the dashboard.
  if (pathname?.startsWith("/admin")) return null;

  const acceptAll = () => onSave({ analytics: true, marketing: true });
  const necessaryOnly = () => onSave({ analytics: false, marketing: false });

  const buttonBase =
    "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[.98]";

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-4 z-[2147483647] sm:right-auto sm:left-4 sm:max-w-md rounded-2xl border border-white/15 bg-[#101314]/95 p-5 text-white shadow-2xl backdrop-blur-md"
    >
      {/* On a phone the chat widget's greeting would cover the banner, so the
          widget waits until the visitor has chosen. */}
      <style>{`@media (max-width: 639px) { #chat-widget-container { display: none !important; } }`}</style>
      <div className="flex items-start justify-between gap-3">
        <h2 id="cookie-banner-title" className="text-base font-bold">
          {managing ? "Cookie settings" : "We use cookies"}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cookie settings"
            className="-mt-1 text-xl leading-none text-white/50 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {!managing ? (
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          We use optional cookies to understand how visitors use our site so we can improve
          it. Necessary cookies keep the site working
          {metaNecessary ? " and help us measure our advertising" : ""}, so they&apos;re
          always on.{" "}
          <Link href="/privacy#cookies" className="text-[#c5eb02] underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          <li className="flex items-start justify-between gap-4 rounded-xl bg-white/5 p-3">
            <div>
              <p className="text-sm font-semibold">Necessary</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                Keep the site secure and working and remember your cookie choice
                {metaNecessary ? ", and measure how our adverts perform (Meta)" : ""}.
              </p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs font-semibold text-[#c5eb02]">
              Always on
            </span>
          </li>
          <li className="flex items-start justify-between gap-4 rounded-xl bg-white/5 p-3">
            <div>
              <p className="text-sm font-semibold">Analytics</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                Show us how visitors use the site so we can improve it (Google Analytics,
                Microsoft Clarity).
              </p>
            </div>
            <Toggle checked={analytics} onChange={setAnalytics} label="Analytics cookies" />
          </li>
          {showMarketing && (
            <li className="flex items-start justify-between gap-4 rounded-xl bg-white/5 p-3">
              <div>
                <p className="text-sm font-semibold">Marketing</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                  Measure how our adverts perform{metaNecessary ? "" : " (Meta)"}.
                </p>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} label="Marketing cookies" />
            </li>
          )}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        {managing ? (
          <button
            type="button"
            onClick={() => onSave({ analytics, marketing: showMarketing && marketing })}
            className={`${buttonBase} bg-white text-black hover:bg-white/90`}
          >
            Save choices
          </button>
        ) : (
          <button
            type="button"
            onClick={necessaryOnly}
            className={`${buttonBase} bg-white text-black hover:bg-white/90`}
          >
            Necessary only
          </button>
        )}
        <button
          type="button"
          onClick={acceptAll}
          className={`${buttonBase} bg-[#c5eb02] text-black hover:bg-[#c5eb02]/90`}
        >
          Accept all
        </button>
      </div>

      {!managing && (
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="mt-3 w-full text-center text-xs font-semibold text-white/60 underline underline-offset-2 hover:text-white"
        >
          Manage choices
        </button>
      )}
    </div>
  );
}
