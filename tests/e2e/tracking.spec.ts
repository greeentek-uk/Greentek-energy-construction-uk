import { test, expect, presetConsent, settle } from "./fixtures";
import type { Page } from "@playwright/test";

/** Meta Pixel events (browser queue + the server relay at /api/track). */

type FbqCall = unknown[];
const fbqCalls = (page: Page) =>
  page.evaluate(() => ((window.fbq as unknown as { queue?: IArguments[] })?.queue ?? []).map((a) => Array.from(a)) as FbqCall[]);
const names = (tracks: Record<string, unknown>[]) => tracks.map((t) => t.event_name);

test.beforeEach(async ({ context, baseURL }) => {
  await presetConsent(context, baseURL);
});

test("PageView on load and on client-side navigation, each with a shared event id", async ({ page, captured }) => {
  await page.goto("/");
  await expect.poll(() => names(captured.tracks)).toContain("PageView");
  const calls = await fbqCalls(page);
  const pageView = calls.find((c) => c[0] === "track" && c[1] === "PageView");
  expect(pageView, "browser PageView").toBeTruthy();
  const browserId = (pageView![3] as { eventID: string }).eventID;
  expect(captured.tracks.find((t) => t.event_name === "PageView")?.event_id).toBe(browserId);

  const before = captured.tracks.filter((t) => t.event_name === "PageView").length;
  await page.evaluate(() => {
    const link = [...document.querySelectorAll<HTMLAnchorElement>('a[href="/about"]')].find((a) => a.offsetParent);
    link?.click();
  });
  await page.waitForURL(/\/about$/);
  await expect.poll(() => captured.tracks.filter((t) => t.event_name === "PageView").length).toBe(before + 1);
});

test("ViewContent on a service page", async ({ page, captured, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const service = xml.match(/<loc>https?:\/\/[^/]+(\/services\/[^<]+)<\/loc>/)?.[1];
  expect(service, "a service page in the sitemap").toBeTruthy();
  await page.goto(service!);
  await expect.poll(() => names(captured.tracks)).toContain("ViewContent");
  const view = captured.tracks.find((t) => t.event_name === "ViewContent")!;
  expect(view.custom_data).toMatchObject({ content_type: "service" });
  expect((view.custom_data as { content_ids: string[] }).content_ids.length).toBe(1);
});

test("Contact on phone and email clicks", async ({ page, captured }) => {
  await page.goto("/contact");
  await settle(page);
  await page.evaluate(() => {
    document.addEventListener("click", (e) => e.preventDefault());
    document.querySelector<HTMLAnchorElement>('a[href^="tel:"]')?.click();
    document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')?.click();
  });
  await expect.poll(() => captured.tracks.filter((t) => t.event_name === "Contact").map((t) => (t.custom_data as { content_name: string }).content_name)).toEqual(
    expect.arrayContaining(["phone", "email"]),
  );
});

test("StartQuote fires once when someone starts the hero form", async ({ page, captured }) => {
  await page.goto("/");
  await page.locator("#hero_postcode").click();
  await page.locator("#hero_postcode").fill("WV1");
  await page.locator("#hero_service").focus();
  await expect.poll(() => names(captured.tracks).filter((n) => n === "StartQuote").length).toBe(1);
  await page.waitForTimeout(300);
  expect(names(captured.tracks).filter((n) => n === "StartQuote")).toHaveLength(1);
});

test("Lead on the thank-you page only with a valid event id, never relayed from the browser", async ({ page, captured }) => {
  const eid = "e2e12345-aaaa-bbbb-cccc-1234567890ab";
  await page.goto(`/thank-you?eid=${eid}`);
  await expect.poll(async () => (await fbqCalls(page)).some((c) => c[1] === "Lead")).toBe(true);
  const lead = (await fbqCalls(page)).find((c) => c[1] === "Lead")!;
  expect((lead[3] as { eventID: string }).eventID).toBe(eid);
  expect(names(captured.tracks)).not.toContain("Lead");

  // A refresh doesn't count it twice.
  await page.reload();
  await settle(page);
  expect((await fbqCalls(page)).some((c) => c[1] === "Lead")).toBe(false);

  await page.goto("/thank-you");
  await settle(page);
  expect((await fbqCalls(page)).some((c) => c[1] === "Lead"), "no eid, no Lead").toBe(false);
});

test("GA4 and Clarity receive the key events after analytics consent", async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL, { analytics: true, marketing: false });
  await page.goto("/contact");
  await settle(page);
  await page.evaluate(() => {
    document.addEventListener("click", (e) => e.preventDefault());
    document.querySelector<HTMLAnchorElement>('a[href^="tel:"]')?.click();
  });
  await expect
    .poll(() => page.evaluate(() => (window.dataLayer as IArguments[]).map((a) => Array.from(a)).some((a) => a[0] === "event" && a[1] === "contact")))
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => ((window.clarity as unknown as { q?: IArguments[] })?.q ?? []).map((a) => Array.from(a)).some((a) => a[0] === "event" && a[1] === "Contact")))
    .toBe(true);
});
