import { test, expect, presetConsent, waitForHydration } from "./fixtures";

/** The full enquiry form on /contact (also used on service and location pages). */

test.beforeEach(async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL);
  await page.goto("/contact");
  await expect(page.locator("#full_name")).toBeVisible();
  await waitForHydration(page, "#full_name");
});

test("the browser blocks sending until required fields and consent are given", async ({ page, captured }) => {
  const submit = page.getByRole("button", { name: "Send My Request" });
  await submit.click();
  expect(await page.locator("#full_name").evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

  await page.locator("#full_name").fill("E2E Tester");
  await page.locator("#email").fill("e2e@example.com");
  await page.locator("#phone").fill("07700900123");
  await page.locator("#postcode").fill("B1 1AA");
  await page.locator("#service").selectOption({ index: 1 });
  await submit.click();
  expect(await page.locator("#consent").evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
  expect(captured.quotes).toHaveLength(0);
});

test("a complete enquiry is sent and lands on the thank-you page", async ({ page, captured }) => {
  await page.locator("#full_name").fill("E2E Tester");
  await page.locator("#email").fill("e2e@example.com");
  await page.locator("#phone").fill("07700900123");
  await page.locator("#postcode").fill("B1 1AA");
  const service = await page.locator("#service option").nth(1).getAttribute("value");
  await page.locator("#service").selectOption(service!);
  await page.getByRole("button", { name: "Residential" }).click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  expect(await page.locator("#timeline option").allTextContents()).toEqual([
    "Select a timeframe", "As soon as possible", "Within 1–3 months", "Within 3–6 months",
  ]);
  await page.locator("#timeline").selectOption("3_6_months");
  await page.locator("#message").fill("Full rewire and new kitchen.");
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Send My Request" }).click();

  await page.waitForURL(/\/thank-you\?eid=/);
  expect(captured.quotes).toHaveLength(1);
  expect(captured.quotes[0]).toMatchObject({
    full_name: "E2E Tester",
    email: "e2e@example.com",
    postcode: "B1 1AA",
    service,
    property_type: "residential",
    is_homeowner: "yes",
    timeline: "3_6_months",
    consent: true,
  });
  expect(captured.quotes[0].event_id).toBe(new URL(page.url()).searchParams.get("eid"));
});

test("an error from the server is shown and the visitor stays on the page", async ({ page, context }) => {
  await context.route("**/api/quote-request", (route) => route.fulfill({ status: 500, json: { error: "x" } }));
  await page.locator("#full_name").fill("E2E Tester");
  await page.locator("#email").fill("e2e@example.com");
  await page.locator("#phone").fill("07700900123");
  await page.locator("#postcode").fill("B1 1AA");
  await page.locator("#service").selectOption({ index: 1 });
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Send My Request" }).click();
  await expect(page.getByText("Something went wrong. Please try again or call us directly.")).toBeVisible();
  await expect(page).toHaveURL(/\/contact$/);
});
