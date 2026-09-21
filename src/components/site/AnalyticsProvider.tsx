"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { configureAnalytics, isAdminPath, metaAllowed, track } from "@/lib/analytics";
import { useConsent } from "@/components/site/ConsentProvider";

let lastPageView = "";

/**
 * Site-wide tracking: page views on every route, plus phone and email clicks.
 *
 * The pasted pixel snippet only ran on a full page load. Next navigates
 * between pages without reloading, so every page after the first went
 * uncounted. Tracking from the router fixes that, and gives each page view an
 * id the server copy can share.
 */
export default function AnalyticsProvider({
  pixelId,
  pixelNeedsConsent,
  children,
}: {
  pixelId: string;
  pixelNeedsConsent: boolean;
  children: React.ReactNode;
}) {
  configureAnalytics({ pixelId, pixelNeedsConsent });
  const pathname = usePathname();
  // Re-runs the page view below when the visitor accepts on this page, so the
  // page they accepted on is counted rather than only the next one.
  const { consent } = useConsent();
  const marketing = Boolean(consent?.marketing);

  const admin = isAdminPath(pathname);

  useEffect(() => {
    // Guards against the same page being counted twice — React runs effects
    // twice in development, and a re-render on one path isn't a new visit.
    // The admin panel is never counted at all.
    if (admin || !metaAllowed() || lastPageView === pathname) return;
    lastPageView = pathname;
    track("PageView");
  }, [pathname, pixelId, marketing, admin]);

  useEffect(() => {
    if (admin) return;

    // One listener for the whole document, so every phone number and email
    // link counts — including ones typed into the panel's rich text later.
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("Contact", { content_name: "phone" });
      else if (href.startsWith("mailto:")) track("Contact", { content_name: "email" });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [admin]);

  return <>{children}</>;
}
