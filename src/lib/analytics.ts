import Clarity from "@microsoft/clarity";
import { readConsent } from "@/lib/consent";
import { isStandardEvent, type MetaEventName } from "@/lib/metaEvents";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: unknown;
  }
}

let pixelId = "";
let pixelNeedsConsent = false;
let initialisedFor = "";

/**
 * The admin panel is not the public site, and nothing may track it.
 *
 * It shares an origin and the root layout with the public pages, so without
 * this the panel was counted like any other page: a PageView per screen, a
 * Contact event for any phone or email link inside it, and — worst — Clarity
 * session recordings of someone working in the CMS. Checked here as well as in
 * the providers because this is the one function every event passes through.
 */
export function isAdminPath(pathname?: string | null): boolean {
  const path =
    pathname ?? (typeof window === "undefined" ? "" : window.location.pathname);
  return path === "/admin" || path.startsWith("/admin/");
}

/** Set by AnalyticsProvider during render, before any child tracks an event. */
export function configureAnalytics(options: { pixelId: string; pixelNeedsConsent: boolean }): void {
  pixelId = options.pixelId;
  pixelNeedsConsent = options.pixelNeedsConsent;
}

/**
 * Whether the Meta Pixel may run right now. Read from the cookie on every call
 * rather than from React state: a page's own tracking (a service view, say)
 * fires before the consent provider has read the cookie into state.
 */
export function metaAllowed(): boolean {
  if (!pixelId) return false;
  return !pixelNeedsConsent || Boolean(readConsent()?.marketing);
}

/** GA4 names for our events — Google's recommended name where one exists. */
const GA_EVENT_NAMES: Partial<Record<MetaEventName, string>> = {
  ViewContent: "view_service",
  StartQuote: "start_quote",
  Lead: "generate_lead",
  Contact: "contact",
  Schedule: "schedule",
};

/**
 * Meta's base pixel code, run once. The stub queues calls until fbevents.js
 * arrives, so events tracked before the script has loaded aren't lost.
 */
function ensurePixel(): boolean {
  if (!pixelId || typeof window === "undefined") return false;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  if (initialisedFor !== pixelId) {
    window.fbq("init", pixelId);
    initialisedFor = pixelId;
  }
  return true;
}

export function newEventId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Tracks one event in the browser pixel and, by default, relays it to the
 * Conversions API with the same event id — Meta counts the pair once, and the
 * server copy still lands when an ad blocker stops the pixel.
 *
 * Pass `server: false` where the server sends its own copy with richer data
 * (Lead, from the enquiry endpoint). Returns the event id used.
 */
export function track(
  name: MetaEventName,
  params: Record<string, unknown> = {},
  options: { eventId?: string; server?: boolean } = {},
): string {
  const eventId = options.eventId ?? newEventId();
  if (typeof window === "undefined") return eventId;
  // Never from the admin panel — no pixel, no GA, no Clarity, no server relay.
  if (isAdminPath()) return eventId;

  // Google Analytics and Clarity only exist on the page once the visitor has
  // accepted analytics cookies, so their presence is the consent check.
  // GA4 counts page views itself, including client-side navigation.
  const gaName = GA_EVENT_NAMES[name];
  if (gaName && window.gtag && readConsent()?.analytics) {
    const { content_name, content_category, method } = params as Record<string, unknown>;
    window.gtag("event", gaName, {
      ...(name === "Contact" ? { method: content_name } : {}),
      ...(name !== "Contact" && content_name ? { item_name: content_name } : {}),
      ...(content_category ? { item_category: content_category } : {}),
      ...(method ? { method } : {}),
    });
  }

  // Mark Clarity recordings too, so sessions with an enquiry or a call can be
  // filtered to directly. Page and content views are left out — Clarity already
  // records those, and tagging them would bury the ones that matter.
  if (name === "StartQuote" || name === "Lead" || name === "Contact" || name === "Schedule") {
    try {
      if (window.clarity && readConsent()?.analytics) Clarity.event(name);
    } catch {
      // Clarity not loaded (off, or blocked) — nothing to tag.
    }
  }

  if (!metaAllowed()) return eventId;

  if (ensurePixel() && window.fbq) {
    window.fbq(isStandardEvent(name) ? "track" : "trackCustom", name, params, { eventID: eventId });
  }

  if (options.server !== false) {
    const body = JSON.stringify({
      event_name: name,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: params,
    });
    // sendBeacon survives the page unloading — a phone-number tap can navigate
    // away before a normal fetch completes.
    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    if (!sent) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }

  return eventId;
}
