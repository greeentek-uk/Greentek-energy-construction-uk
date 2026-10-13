import { test, expect, presetConsent, waitForHydration } from "./fixtures";

/** The ad landing pages (/lp/*): noindex, no menu, and enquiries that say where they came from. */

const URL = "/lp/kitchen-renovation?gclid=e2e&utm_source=google&utm_campaign=Kitchens";

test.beforeEach(async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL);
  await page.goto(URL);
  await waitForHydration(page, "#full_name");
});

test("is hidden from search and has no site menu", async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("header nav")).toHaveCount(0);
  await expect(page.locator("header a[href^='tel:']")).toBeVisible();
});

test("the hero form is fixed to the service, and the closing form preselects it", async ({ page }) => {
  await expect(page.locator("#start")).toContainText("Kitchen renovation");
  await expect(page.locator("#hero_service")).toHaveCount(0);
  await expect(page.locator("#service")).toHaveValue("construction_kitchen");
});

test("an enquiry carries the landing page as its source and the ad's tags in its page URL", async ({ page, captured }) => {
  await page.locator("#full_name").fill("E2E Tester");
  await page.locator("#email").fill("e2e@example.com");
  await page.locator("#phone").fill("07700900123");
  await page.locator("#postcode").fill("B1 1AA");
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Send My Request" }).click();

  await page.waitForURL(/\/thank-you\?eid=/);
  expect(captured.quotes[0]).toMatchObject({
    service: "construction_kitchen",
    source: "Ad landing page — Kitchen renovation",
  });
  expect(String(captured.quotes[0].page_url)).toContain("gclid=e2e");
});
