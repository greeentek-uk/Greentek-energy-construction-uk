import { test, expect, presetConsent, waitForHydration } from "./fixtures";

/**
 * The ad landing pages (/lp/*): noindex, no menu, every quote button opens the
 * same pop-up form, and enquiries say where they came from.
 */

const URL = "/lp/kitchen-renovation?gclid=e2e&utm_source=google&utm_campaign=Kitchens";

test.beforeEach(async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL);
  await page.goto(URL);
  await waitForHydration(page, "#hero_postcode");
});

test("is hidden from search and has no site menu", async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("header nav")).toHaveCount(0);
  await expect(page.locator("header a[href^='tel:']")).toBeVisible();
});

test("every quote button opens the pop-up form, already set to the service", async ({ page }) => {
  const dialog = page.locator("dialog");
  await expect(dialog).not.toBeVisible();
  const buttons = page.locator("main [data-quote]");
  expect(await buttons.count(), "a quote button after each section").toBeGreaterThan(4);

  await buttons.first().click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Kitchen renovation");
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).not.toBeVisible();

  await buttons.nth(3).click();
  await expect(dialog).toBeVisible();
});

test("an enquiry carries the landing page as its source and the ad's tags in its page URL", async ({ page, captured }) => {
  // The closing section's inline copy of the form (the pop-up's fields use "quote_" ids).
  await page.locator("#hero_postcode").fill("B1 1AA");
  await page.locator("#quote").getByRole("button", { name: "Continue" }).click();
  await page.locator("#hero_timeline").selectOption("asap");
  await page.locator("#hero_budget").selectOption("guidance");
  await page.locator("#quote").getByRole("button", { name: "Continue" }).click();
  await page.locator("#quote").getByRole("button", { name: /Skip|Continue/ }).first().click();
  await page.locator("#hero_name").fill("E2E Tester");
  await page.locator("#hero_email").fill("e2e@example.com");
  await page.locator("#hero_phone").fill("07700900123");
  await page.locator("#quote").getByLabel(/happy for Greentek to contact me/).check();
  await page.locator("#quote").getByRole("button", { name: "Get my free quote" }).click();

  await page.waitForURL(/\/thank-you\?eid=/);
  expect(captured.quotes[0]).toMatchObject({
    service: "construction_kitchen",
    source: "Ad landing page — Kitchen renovation",
  });
  expect(String(captured.quotes[0].page_url)).toContain("gclid=e2e");
});
