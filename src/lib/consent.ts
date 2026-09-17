/**
 * Cookie consent, shared by the browser (banner, trackers) and the server
 * (routes that relay events to Meta).
 *
 * The choice lives in a first-party cookie rather than localStorage so API
 * routes can read it too — the server never forwards an event the visitor
 * hasn't agreed to, whatever the browser sends.
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export const CONSENT_COOKIE = "gt_consent";

/**
 * Bump when the categories or what they cover change: every stored choice
 * stops parsing, so visitors are asked again rather than held to a choice
 * they made about something else.
 */
export const CONSENT_VERSION = 1;

/** Six months, after which the visitor is asked again. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

/** Cookies set by the trackers we load, cleared when consent is withdrawn. */
const TRACKING_COOKIE_PATTERNS = [/^_ga/, /^_gid$/, /^_gat/, /^_clck$/, /^_clsk$/, /^_fbp$/, /^_fbc$/];

export function serializeConsent(state: ConsentState): string {
  return `${CONSENT_VERSION}.a${state.analytics ? 1 : 0}.m${state.marketing ? 1 : 0}`;
}

export function parseConsent(value: string | null | undefined): ConsentState | null {
  const match = value?.match(/^(\d+)\.a([01])\.m([01])$/);
  if (!match || Number(match[1]) !== CONSENT_VERSION) return null;
  return { analytics: match[2] === "1", marketing: match[3] === "1" };
}

function cookieValue(cookieString: string, name: string): string | null {
  for (const part of cookieString.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Server side: the visitor's choice from a request's Cookie header. */
export function consentFromCookieHeader(header: string | null): ConsentState | null {
  return header ? parseConsent(cookieValue(header, CONSENT_COOKIE)) : null;
}

/** Browser side: the visitor's current choice, or null if they haven't made one. */
export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  return parseConsent(cookieValue(document.cookie, CONSENT_COOKIE));
}

export function writeConsent(state: ConsentState): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

/**
 * Expires tracker cookies after consent is withdrawn. Google and Clarity set
 * theirs on the parent domain, so each level of the hostname is tried.
 */
export function clearTrackingCookies(): void {
  const names = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((name) => TRACKING_COOKIE_PATTERNS.some((re) => re.test(name)));

  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) {
    domains.push(`; Domain=.${labels.slice(i).join(".")}`);
  }

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
    }
  }
}

/**
 * Inline script for the top of <head>: sets Google Consent Mode defaults from
 * the stored choice before any Google tag runs, so a tag that loads — now or
 * after the visitor accepts — starts with the right permissions.
 */
export const CONSENT_MODE_DEFAULTS_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
(function(){var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=${CONSENT_VERSION}\\.a([01])\\.m([01])/);
var a=m&&m[1]==="1"?"granted":"denied",k=m&&m[2]==="1"?"granted":"denied";
gtag("consent","default",{analytics_storage:a,ad_storage:k,ad_user_data:k,ad_personalization:k,functionality_storage:"granted",security_storage:"granted"});})();`;
