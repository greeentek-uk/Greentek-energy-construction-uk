import { test, expect, presetConsent, settle } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * Cookie banner and what each choice allows to load. Tracker requests are
 * blocked by the fixtures but recorded, so "tried to load" is observable.
 */

const banner = (page: Page) => page.getByRole("dialog", { name: /We use cookies|Cookie settings/ });
const loaded = (urls: string[], re: RegExp) => urls.some((u) => re.test(u));
const GA = /googletagmanager\.com\/gtag\/js/;
const CLARITY = /clarity\.ms\/tag\//;
const META = /connect\.facebook\.net\/.+fbevents\.js/;

test("first visit: banner shows, only necessary trackers load", async ({ page, captured }) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy#cookies");
  await settle(page);
  expect(loaded(captured.vendor, GA), "Google Analytics before consent").toBe(false);
  expect(loaded(captured.vendor, CLARITY), "Clarity before consent").toBe(false);
  expect(loaded(captured.vendor, META), "Meta runs as necessary").toBe(true);
});

test("'Necessary only' is remembered across pages and reloads", async ({ page, context, captured }) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Necessary only" }).click();
  await expect(banner(page)).toBeHidden();
  const cookie = (await context.cookies()).find((c) => c.name === "gt_consent");
  expect(cookie?.value).toBe("1.a0.m0");
  expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(170 * 24 * 3600);

  await page.goto("/about");
  await settle(page);
  await expect(banner(page)).toBeHidden();
  expect(loaded(captured.vendor, GA)).toBe(false);
  expect(loaded(captured.vendor, CLARITY)).toBe(false);
});

test("'Accept all' loads Google Analytics and Clarity immediately", async ({ page, context, captured }) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Accept all" }).click();
  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).find((c) => c.name === "gt_consent")?.value).toBe("1.a1.m1");
  await expect.poll(() => loaded(captured.vendor, GA), { message: "GA loads" }).toBe(true);
  await expect.poll(() => loaded(captured.vendor, CLARITY), { message: "Clarity loads" }).toBe(true);
  const update = await page.evaluate(() =>
    (window.dataLayer as IArguments[]).map((a) => Array.from(a)).filter((a) => a[0] === "consent" && a[1] === "update").pop(),
  );
  expect(update?.[2]).toMatchObject({ analytics_storage: "granted" });
});

test("manage choices: analytics toggle, then withdraw from the footer", async ({ page, captured }) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Manage choices" }).click();
  await expect(banner(page).getByText("Always on")).toBeVisible();
  const toggle = page.getByRole("switch", { name: "Analytics cookies" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save choices" }).click();
  await expect(banner(page)).toBeHidden();
  await expect.poll(() => loaded(captured.vendor, GA)).toBe(true);

  // Withdraw: the page reloads without the analytics trackers.
  await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).click();
  await expect(banner(page)).toBeVisible();
  await expect(page.getByRole("switch", { name: "Analytics cookies" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("switch", { name: "Analytics cookies" }).click();
  captured.vendor.length = 0;
  await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Save choices" }).click()]);
  await settle(page);
  expect(loaded(captured.vendor, GA)).toBe(false);
  expect(loaded(captured.vendor, CLARITY)).toBe(false);
});

test("closing the reopened settings keeps the existing choice", async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL, { analytics: true, marketing: false });
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).click();
  await page.getByRole("button", { name: "Close cookie settings" }).click();
  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).find((c) => c.name === "gt_consent")?.value).toBe("1.a1.m0");
});

test("the privacy policy explains the cookies", async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL);
  await page.goto("/privacy#cookies");
  const section = page.locator("#cookies");
  await expect(section).toBeVisible();
  await expect(section).toContainText("Necessary");
  await expect(section).toContainText("Analytics");
  await expect(section).toContainText("Meta");
});

test("no banner inside the admin panel", async ({ page }) => {
  await page.goto("/admin/login");
  await page.waitForTimeout(800);
  await expect(banner(page)).toBeHidden();
});

test("mobile: the chat widget is hidden while the banner is open", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "phone-only behaviour");
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  const style = await page.evaluate(() => [...document.querySelectorAll("style")].some((s) => s.textContent?.includes("#chat-widget-container")));
  expect(style).toBe(true);
});
