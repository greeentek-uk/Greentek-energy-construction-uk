import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

/**
 * Third-party services: blocked in every test, but recorded so consent tests
 * can see what tried to load. The OpenWidget chat is included because its
 * pop-ups appear at unpredictable moments and can cover whatever a test is
 * about to tap.
 */
const VENDOR_HOST = /(^|\.)(facebook\.net|facebook\.com|google-analytics\.com|googletagmanager\.com|analytics\.google\.com|clarity\.ms|bing\.com|openwidget\.com|livechatinc\.com|livechat-static\.com)$/;

export const FAKE_CLOUD = "e2e-test-cloud";
export const FAKE_ENQUIRY = { number: 7, token: "11111111-1111-4111-8111-111111111111" };

export interface Captured {
  /** Every blocked tracker request URL. */
  vendor: string[];
  /** Bodies posted to /api/quote-request (faked — no email is sent). */
  quotes: Record<string, unknown>[];
  /** Bodies posted to /api/track (faked — nothing reaches Meta). */
  tracks: Record<string, unknown>[];
  /** Calls to /api/quote-upload (faked — no enquiry is opened). */
  uploadSignatures: number;
  /** Files "uploaded" to Cloudinary (faked). */
  cloudinaryUploads: number;
  /** Console errors and uncaught exceptions. */
  errors: string[];
}

const isLocal = (url: string) => /^http:\/\/(localhost|127\.0\.0\.1)/.test(url);

export const test = base.extend<{ captured: Captured }>({
  captured: [
    async ({ context, page, baseURL }, use) => {
      const captured: Captured = {
        vendor: [],
        quotes: [],
        tracks: [],
        uploadSignatures: 0,
        cloudinaryUploads: 0,
        errors: [],
      };

      await context.route(
        (url) => VENDOR_HOST.test(url.hostname),
        (route) => {
          captured.vendor.push(route.request().url());
          return route.abort();
        },
      );
      await context.route("**/api/quote-request", async (route) => {
        captured.quotes.push(route.request().postDataJSON());
        await route.fulfill({ json: { ok: true } });
      });
      await context.route("**/api/track", async (route) => {
        try {
          captured.tracks.push(JSON.parse(route.request().postData() || "{}"));
        } catch {
          captured.tracks.push({});
        }
        await route.fulfill({ json: { ok: true } });
      });
      // The 404 logger writes to the database; keep test visits out of it.
      await context.route("**/api/not-found", (route) => route.fulfill({ json: { ok: true } }));
      await context.route("**/api/quote-upload", async (route) => {
        captured.uploadSignatures++;
        await route.fulfill({
          json: {
            params: {
              timestamp: 1,
              folder: `enquiry-photos/0000${FAKE_ENQUIRY.number}`,
              allowed_formats: "jpg,jpeg,png,heic,heif",
              transformation: "c_limit,w_2000,h_2000,q_auto:good,f_jpg",
              tags: "enquiry",
            },
            signature: "e2e",
            apiKey: "e2e",
            cloudName: FAKE_CLOUD,
            enquiry: FAKE_ENQUIRY,
          },
        });
      });
      await context.route("https://api.cloudinary.com/**", async (route) => {
        const n = ++captured.cloudinaryUploads;
        await new Promise((r) => setTimeout(r, 150));
        await route.fulfill({
          json: {
            secure_url: `https://res.cloudinary.com/${FAKE_CLOUD}/image/upload/v1/enquiry-photos/0000${FAKE_ENQUIRY.number}/photo${n}.jpg`,
          },
        });
      });

      page.on("pageerror", (err) => captured.errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        const url = msg.location().url || "";
        // Requests we aborted on purpose.
        if (/net::ERR_FAILED|ERR_BLOCKED_BY_CLIENT/.test(text)) return;
        if (VENDOR_HOST.test(safeHost(url))) return;
        // Next's image optimiser isn't available in a local `next start` with a
        // custom loader; on Vercel the same URL returns 200.
        if (isLocal(baseURL || "") && /status of 404/.test(text) && /\/_next\/image/.test(url)) return;
        // Same for a static file whose name contains a comma: 404 under local
        // `next start`, 200 on Vercel (checked by links.spec with the comma encoded).
        if (isLocal(baseURL || "") && /status of 404/.test(text) && /\/images\/.*,/.test(url)) return;
        captured.errors.push(`console: ${text}${url ? ` (${url})` : ""}`);
      });

      await use(captured);
    },
    { auto: true },
  ],
});

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export { expect };

/**
 * Every page listed in the sitemap, as a path. Read while the test files load
 * (Playwright builds the test list synchronously), so each page gets its own test.
 */
export function sitemapPaths(): string[] {
  const baseURL = process.env.E2E_BASE_URL || `http://localhost:${process.env.E2E_PORT || 3002}`;
  try {
    const xml = execFileSync("curl", ["-sf", "--max-time", "30", `${baseURL}/sitemap.xml`], {
      encoding: "utf8",
    });
    return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
  } catch {
    return [];
  }
}

/**
 * Waits until React has hydrated an element, so clicks and typing reach its
 * handlers. Server-rendered HTML is visible (and clickable) before that, and
 * on a slow or busy machine a click can land on a button that does nothing yet.
 */
export async function waitForHydration(page: Page, selector = "body") {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
    },
    selector,
    { timeout: 30_000 },
  );
}

/** Waits until the page has hydrated and trackers have had a chance to run. */
export async function settle(page: Page) {
  await page.waitForLoadState("load");
  await waitForHydration(page);
  await page.waitForTimeout(400);
}

/** Choose a cookie option so the banner doesn't cover elements under test. */
export async function dismissCookies(page: Page, choice: "Necessary only" | "Accept all" = "Necessary only") {
  const banner = page.getByRole("dialog", { name: /cookies|cookie settings/i });
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole("button", { name: choice, exact: true }).click();
    await expect(banner).toBeHidden();
  }
}

/**
 * Stores a cookie choice before the first page load, so the banner never
 * appears in tests that aren't about it.
 */
export async function presetConsent(
  context: BrowserContext,
  baseURL: string | undefined,
  consent: { analytics: boolean; marketing: boolean } = { analytics: false, marketing: false },
) {
  await context.addCookies([
    {
      name: "gt_consent",
      value: `1.a${consent.analytics ? 1 : 0}.m${consent.marketing ? 1 : 0}`,
      url: baseURL!,
    },
  ]);
}
