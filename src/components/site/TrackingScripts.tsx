"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Clarity from "@microsoft/clarity";
import { useConsent } from "@/components/site/ConsentProvider";
import { activateConsentedScripts } from "@/lib/consentScripts";
import { isAdminPath } from "@/lib/analytics";

let gaLoadedFor = "";

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads the arguments object itself, not an array — this is Google's
  // own snippet, written as a function.
  window.gtag =
    window.gtag ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag(...args);
}

/**
 * Google Analytics 4. Its enhanced measurement counts page views on
 * client-side navigation by itself, so no manual page_view is sent — doing
 * both would count every page twice.
 */
function loadGoogleAnalytics(measurementId: string) {
  if (gaLoadedFor === measurementId) return;
  gaLoadedFor = measurementId;

  gtag("js", new Date());
  gtag("config", measurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/**
 * Starts the optional trackers once the visitor has agreed to them: Google
 * Analytics and Clarity (analytics), plus any panel snippets waiting on a
 * category. Nothing here runs for a visitor who hasn't chosen yet.
 */
export default function TrackingScripts({
  gaMeasurementId,
  clarityProjectId,
}: {
  gaMeasurementId: string;
  clarityProjectId: string;
}) {
  const { consent } = useConsent();
  const analytics = Boolean(consent?.analytics);
  const marketing = Boolean(consent?.marketing);
  // Nothing loads over the admin panel — not Google Analytics, not Clarity's
  // session recording, not the panel's own consent-gated snippets.
  const admin = isAdminPath(usePathname());

  useEffect(() => {
    if (admin || !consent) return;

    // Google Consent Mode: tells any Google tag what it may store. Defaults
    // were set from the cookie in <head>; this carries a choice made now.
    const ads = marketing ? "granted" : "denied";
    gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
    });

    if (analytics && gaMeasurementId) loadGoogleAnalytics(gaMeasurementId);

    if (analytics && clarityProjectId) {
      Clarity.init(clarityProjectId);
      Clarity.consentV2({ analytics_Storage: "granted", ad_Storage: ads });
    }

    void activateConsentedScripts({ analytics, marketing });
  }, [admin, consent, analytics, marketing, gaMeasurementId, clarityProjectId]);

  return null;
}
