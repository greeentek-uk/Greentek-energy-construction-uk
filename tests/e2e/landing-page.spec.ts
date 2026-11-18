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
  // The heading names the service (there's no "Your enquiry" box since 2026-10-29).
  await expect(dialog).toContainText(/kitchen quote/i);
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
  await page.locator("#hero_address").fill("1 Test Street, Birmingham");
  await page.locator("#quote").getByLabel(/happy for Greentek to contact me/).check();
  await page.locator("#quote").getByRole("button", { name: "Get my free quote" }).click();

  await page.waitForURL(/\/thank-you\?eid=/);
  expect(captured.quotes[0]).toMatchObject({
    service: "construction_kitchen",
    source: "Ad landing page — Kitchen renovation",
  });
  expect(String(captured.quotes[0].page_url)).toContain("gclid=e2e");
});

test.describe("heat pump page: the grant quiz is the only form", () => {
  const HEAT_PUMP = "/lp/air-source-heat-pumps?gclid=e2e";

  test("quote buttons scroll to the quiz, never a pop-up", async ({ page }) => {
    await page.goto(HEAT_PUMP);
    await waitForHydration(page, "#grant-quiz button");
    await expect(page.locator("dialog")).toHaveCount(0);
    // The redesigned page has a quote button in the hero, after the worries
    // section and after the steps; the last is furthest from the quiz.
    const buttons = page.locator("main [data-quote]");
    expect(await buttons.count()).toBeGreaterThanOrEqual(3);
    await buttons.last().click();
    await expect(page.locator("#grant-quiz")).toBeInViewport();
  });

  test("four taps, a postcode and contact details send a grant enquiry", async ({ page, captured }) => {
    await page.goto(HEAT_PUMP);
    await waitForHydration(page, "#grant-quiz button");
    const quiz = page.locator("#grant-quiz");
    // Each tap moves on by itself; no Continue until the postcode.
    await quiz.getByRole("radio", { name: "Oil boiler", exact: true }).click();
    await quiz.getByRole("radio", { name: "Detached", exact: true }).click();
    await quiz.getByRole("radio", { name: "Yes", exact: true }).click();
    await quiz.getByRole("radio", { name: "As soon as possible", exact: true }).click();
    await page.locator("#quiz_postcode").fill("B1 1AA");
    await quiz.getByRole("button", { name: "Continue" }).click();
    await page.locator("#quiz_name").fill("E2E Tester");
    await page.locator("#quiz_email").fill("e2e@example.com");
    await page.locator("#quiz_phone").fill("07700900123");
    await page.locator("#quiz_address").fill("1 Test Street, Birmingham");
    await quiz.getByLabel(/happy for Greentek to contact me/).check();
    await quiz.getByRole("button", { name: "Check my grant" }).click();

    await page.waitForURL(/\/thank-you\?eid=/);
    expect(captured.quotes[0]).toMatchObject({
      service: "energy_heat_pump",
      source: "Ad landing page — Air source heat pumps (grant quiz)",
      current_heating: "oil",
      home_type: "detached",
      is_homeowner: "yes",
      timeline: "asap",
      postcode: "B1 1AA",
    });
  });
});

test("heat pump page: name, phone and postcode request a call back", async ({ page, captured }) => {
  await page.goto("/lp/air-source-heat-pumps?gclid=e2e");
  await waitForHydration(page, "#cb_name");
  await page.locator("#cb_name").fill("E2E Tester");
  await page.locator("#cb_phone").fill("07700900123");
  await page.locator("#cb_postcode").fill("B1 1AA");
  await page.getByLabel(/happy for Greentek to call me/).check();
  await page.getByRole("button", { name: "Call me back" }).click();
  await page.waitForURL(/\/thank-you\?eid=/);
  expect(captured.quotes[0]).toMatchObject({
    callback: true,
    email: "",
    phone: "07700900123",
    source: "Ad landing page — Air source heat pumps (call me back)",
  });
});

test("heat pump page: the footer has no links off to the rest of the site", async ({ page }) => {
  await page.goto("/lp/air-source-heat-pumps");
  await expect(page.locator('footer nav[aria-label="Services"]')).toHaveCount(0);
  await expect(page.locator('footer nav[aria-label="Company"]')).toHaveCount(0);
  await expect(page.locator("footer").getByText(/Ideal4Finance/).first()).toBeVisible();
});
