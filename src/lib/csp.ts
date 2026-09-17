/**
 * The site's Content-Security-Policy.
 *
 * This used to be a static string in next.config.ts. It moved here because
 * admin-added tracking scripts are stored in Mongo, and a policy baked in at
 * build time would silently block every one of them — the tag would sit in the
 * HTML and simply never run. The policy is now assembled per request in
 * proxy.ts from the admin's allowlist, so adding a tag stays a panel action
 * rather than a code change and redeploy.
 */

/** Origins the site itself depends on, regardless of what the admin adds. */
const BASE = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://cdn.openwidget.com",
    "https://api.openwidget.com",
    // Meta Pixel is loaded by the site itself (AnalyticsProvider), so it can't
    // depend on the panel allowlist still containing these.
    "https://connect.facebook.net",
    // Microsoft Clarity (ClarityInit): tag, main script and collectors all live
    // on different clarity.ms subdomains, so a single host isn't enough.
    "https://*.clarity.ms",
    // Google Analytics 4 (TrackingScripts) — built in, like the two above.
    "https://www.googletagmanager.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.google.com",
    "https://*.gstatic.com",
    "https://res.cloudinary.com",
    // OpenWidget chat agent avatars.
    "https://cdn.livechat-static.com",
    "https://www.facebook.com",
    "https://*.clarity.ms",
    "https://c.bing.com",
    "https://*.google-analytics.com",
    "https://www.googletagmanager.com",
  ],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://api.openwidget.com",
    "https://api.livechatinc.com",
    "https://api.cloudinary.com",
    "https://www.facebook.com",
    "https://connect.facebook.net",
    "https://*.clarity.ms",
    "https://c.bing.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://www.googletagmanager.com",
  ],
  "frame-src": ["'self'", "https://www.google.com", "https://cdn.openwidget.com", "https://secure.livechatinc.com"],
  "frame-ancestors": ["'none'"],
} satisfies Record<string, string[]>;

/**
 * Directives an admin-allowlisted origin is added to. A tag manager typically
 * needs all four: it loads its own script, beacons back, drops tracking pixels,
 * and sometimes opens an iframe.
 */
const WIDENED: (keyof typeof BASE)[] = ["script-src", "connect-src", "img-src", "frame-src"];

export function buildCsp(allowedDomains: string[] = []): string {
  const directives: Record<string, string[]> = Object.fromEntries(
    Object.entries(BASE).map(([key, values]) => [key, [...values]]),
  );

  for (const directive of WIDENED) {
    for (const domain of allowedDomains) {
      if (!directives[directive].includes(domain)) {
        directives[directive].push(domain);
      }
    }
  }

  return Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(" ")}`)
    .join("; ")
    .concat(";");
}
