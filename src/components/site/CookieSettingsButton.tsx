"use client";

import { useConsent } from "@/components/site/ConsentProvider";

/** Reopens the cookie banner, so a visitor can change their mind at any time. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      Cookie settings
    </button>
  );
}
