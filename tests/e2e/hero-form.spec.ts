import sharp from "sharp";
import { test, expect, presetConsent, FAKE_CLOUD, FAKE_ENQUIRY } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * The homepage hero enquiry form, every step and rule. Submission, photo
 * signing and the Cloudinary upload are all faked by the fixtures.
 */

async function jpeg(color: string) {
  return sharp({ create: { width: 800, height: 600, channels: 3, background: color } })
    .jpeg()
    .toBuffer();
}

const alert = (page: Page) => page.locator("form [role=alert]").first();
const continueButton = (page: Page) => page.getByRole("button", { name: /^(Continue|Skip)$/ });

test.beforeEach(async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL, { analytics: false, marketing: false });
  await page.goto("/");
  await expect(page.locator("#hero_service")).toBeVisible();
});

test("step 1 — construction is selected by default and the service list follows the switch", async ({ page }) => {
  const construction = page.getByRole("radio", { name: "Construction" });
  const energy = page.getByRole("radio", { name: "Energy upgrades" });
  await expect(construction).toHaveAttribute("aria-checked", "true");
  await expect(energy).toHaveAttribute("aria-checked", "false");
  await expect(page.getByText("Step 1 of 4")).toBeVisible();

  const options = () => page.locator("#hero_service option:not([disabled])").allTextContents();
  expect(await options()).toEqual([
    "Full property", "Kitchen", "Bathroom", "Extension", "Loft conversion", "Living space", "Multiple areas", "Not sure yet",
  ]);

  await page.locator("#hero_service").selectOption("construction_kitchen");
  await energy.click();
  await expect(energy).toHaveAttribute("aria-checked", "true");
  expect(await options()).toContain("Air source heat pump");
  expect(await options()).not.toContain("Kitchen");
  await expect(page.locator("#hero_service"), "a construction service is cleared when switching to energy").toHaveValue("");

  await construction.click();
  await expect(construction).toHaveAttribute("aria-checked", "true");
});

test("step 1 — validation", async ({ page }) => {
  await continueButton(page).click();
  await expect(alert(page)).toHaveText("Pick what you need help with.");
  await page.locator("#hero_service").selectOption("construction_bathroom");
  await continueButton(page).click();
  await expect(alert(page)).toHaveText("Enter your postcode.");
  await page.locator("#hero_postcode").fill("hello");
  await continueButton(page).click();
  await expect(alert(page)).toHaveText("That postcode doesn't look right.");
  await page.locator("#hero_postcode").fill("wv1 1aa");
  await expect(page.locator("#hero_postcode")).toHaveValue("WV1 1AA");
  await continueButton(page).click();
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
});

async function completeStepOne(page: Page) {
  await page.locator("#hero_service").selectOption("construction_kitchen");
  await page.locator("#hero_postcode").fill("WV1 1AA");
  await continueButton(page).click();
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
}

test("step 2 — required dropdowns, choices and going back keeps answers", async ({ page }) => {
  await completeStepOne(page);

  expect(await page.locator("#hero_timeline option:not([disabled])").allTextContents()).toEqual([
    "As soon as possible", "Within 1–3 months", "Within 3–6 months",
  ]);
  expect(await page.locator("#hero_budget option:not([disabled])").allTextContents()).toEqual([
    "Under £25,000", "£25,000–£50,000", "£50,000–£100,000", "More than £100,000", "I need guidance",
  ]);
  await expect(page.getByText("Are you the property owner?")).toBeVisible();

  await continueButton(page).click();
  await expect(alert(page)).toHaveText("Choose when you'd like to begin.");
  await page.locator("#hero_timeline").selectOption("1_3_months");
  await continueButton(page).click();
  await expect(alert(page)).toContainText("Choose an approximate budget");
  await page.locator("#hero_budget").selectOption("guidance");

  const commercial = page.getByRole("button", { name: "Commercial", exact: true });
  await commercial.click();
  await expect(commercial).toHaveAttribute("aria-pressed", "true");
  // The owner question stays for commercial properties.
  const buying = page.getByRole("button", { name: "Buying the property" });
  await buying.click();
  await expect(buying).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  await expect(page.locator("#hero_service")).toHaveValue("construction_kitchen");
  await continueButton(page).click();
  await expect(page.locator("#hero_timeline")).toHaveValue("1_3_months");
  await expect(page.locator("#hero_budget")).toHaveValue("guidance");
  await expect(buying).toHaveAttribute("aria-pressed", "true");
});

async function completeStepTwo(page: Page) {
  await completeStepOne(page);
  await page.locator("#hero_timeline").selectOption("asap");
  await page.locator("#hero_budget").selectOption("25k_50k");
  await page.getByRole("button", { name: "Residential", exact: true }).click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await continueButton(page).click();
  await expect(page.getByText("Step 3 of 4")).toBeVisible();
}

test("step 3 — photo rules: type, 10MB, maximum of five, remove", async ({ page, captured }) => {
  await completeStepTwo(page);
  await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  const gallery = page.locator('input[type=file][multiple]');
  const notice = page.locator("[role=alert]").filter({ hasText: /photo|10MB/ });

  await gallery.setInputFiles({ name: "anim.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a") });
  await expect(notice).toHaveText("Only JPEG, PNG or HEIC photos can be added.");
  expect(captured.uploadSignatures, "nothing uploaded for a rejected file").toBe(0);

  await gallery.setInputFiles({ name: "huge.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 1) });
  await expect(notice).toHaveText("Each photo must be under 10MB.");
  expect(captured.uploadSignatures, "nothing uploaded for an oversized file").toBe(0);

  const colours = ["#111111", "#222222", "#333333", "#444444", "#555555", "#666666"];
  const files = await Promise.all(colours.map(async (c, i) => ({ name: `p${i}.jpg`, mimeType: "image/jpeg", buffer: await jpeg(c) })));
  await gallery.setInputFiles(files);
  await expect(notice).toHaveText("You can add up to 5 photos.");
  const thumbs = page.getByRole("button", { name: "Remove photo" });
  await expect(thumbs).toHaveCount(5);
  await expect(page.getByLabel("Uploading")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText("5/5")).toBeVisible();
  await expect(page.getByRole("button", { name: "Upload" })).toBeDisabled();
  expect(captured.cloudinaryUploads).toBe(5);

  await thumbs.first().click();
  await expect(thumbs).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Upload" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("full journey — submits every answer, photos and enquiry number, then thanks", async ({ page, captured }) => {
  await completeStepTwo(page);
  await page.locator('input[type=file][multiple]').setInputFiles([
    { name: "front.jpg", mimeType: "image/jpeg", buffer: await jpeg("#335577") },
    { name: "kitchen.png", mimeType: "image/png", buffer: await sharp({ create: { width: 400, height: 300, channels: 3, background: "#775533" } }).png().toBuffer() },
  ]);
  await expect(page.getByLabel("Uploading")).toHaveCount(0, { timeout: 15_000 });
  await page.locator("#hero_message").fill("Knock through into the dining room.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 4 of 4")).toBeVisible();

  const submit = page.getByRole("button", { name: "Get my free quote" });
  await submit.click();
  await expect(alert(page)).toHaveText("Enter your name.");
  await page.locator("#hero_name").fill("E2E Tester");
  await submit.click();
  await expect(alert(page)).toHaveText("Enter your email.");
  await page.locator("#hero_email").fill("e2e@example.com");
  await submit.click();
  await expect(alert(page)).toHaveText("Enter your phone number.");
  await page.locator("#hero_phone").fill("07700 900123");
  await submit.click();
  await expect(alert(page)).toHaveText("Please tick the consent box so we can reply.");
  expect(captured.quotes).toHaveLength(0);

  await page.getByLabel(/happy for Greentek to contact me/).check();
  await submit.click();
  await page.waitForURL(/\/thank-you\?eid=/);

  expect(captured.quotes).toHaveLength(1);
  const sent = captured.quotes[0];
  expect(sent).toMatchObject({
    service: "construction_kitchen",
    postcode: "WV1 1AA",
    property_type: "residential",
    is_homeowner: "yes",
    timeline: "asap",
    budget: "25k_50k",
    message: "Knock through into the dining room.",
    full_name: "E2E Tester",
    email: "e2e@example.com",
    phone: "07700 900123",
    consent: true,
    source: "Homepage hero",
    enquiry: FAKE_ENQUIRY,
  });
  expect(sent).not.toHaveProperty("project_type");
  expect(sent.photos).toHaveLength(2);
  for (const url of sent.photos as string[]) {
    expect(url).toMatch(new RegExp(`^https://res\\.cloudinary\\.com/${FAKE_CLOUD}/image/upload/.+\\.jpg$`));
  }
  expect(captured.uploadSignatures, "one enquiry opened, reused for the second photo").toBe(2);
  const eid = new URL(page.url()).searchParams.get("eid");
  expect(sent.event_id).toBe(eid);

  await expect(page.getByText(/A member of the team will contact you within one business day/)).toBeVisible();
  expect(captured.errors).toEqual([]);
});

test("a failed upload can be retried and never blocks sending", async ({ page, context, captured }) => {
  let failNext = true;
  await context.route("https://api.cloudinary.com/**", async (route) => {
    if (failNext) {
      failNext = false;
      return route.fulfill({ status: 500, json: { error: { message: "boom" } } });
    }
    await route.fallback();
  });
  await completeStepTwo(page);
  await page.locator('input[type=file][multiple]').setInputFiles({ name: "a.jpg", mimeType: "image/jpeg", buffer: await jpeg("#abcdef") });
  const retry = page.getByRole("button", { name: /Upload failed — tap to retry/ });
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(retry).toBeHidden({ timeout: 15_000 });
  await expect(page.getByLabel("Uploading")).toHaveCount(0);
  expect(captured.cloudinaryUploads).toBe(1);
  captured.errors.length = 0; // the deliberate 500 is logged by the browser
});

test("the server's error message is shown if sending fails", async ({ page, context }) => {
  await context.route("**/api/quote-request", (route) =>
    route.fulfill({ status: 500, json: { error: "Failed to send email" } }),
  );
  await completeStepTwo(page);
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator("#hero_name").fill("E2E Tester");
  await page.locator("#hero_email").fill("e2e@example.com");
  await page.locator("#hero_phone").fill("07700900123");
  await page.getByLabel(/happy for Greentek to contact me/).check();
  await page.getByRole("button", { name: "Get my free quote" }).click();
  await expect(alert(page)).toHaveText("Failed to send email");
  await expect(page).toHaveURL(/\/$/);
});

test("mobile — inputs are 16px so phones don't zoom, and tap targets are at least 44px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "phone-only check");
  const fontSize = await page.locator("#hero_postcode").evaluate((el) => getComputedStyle(el).fontSize);
  expect(fontSize).toBe("16px");
  for (const name of ["Construction", "Energy upgrades"]) {
    const box = await page.getByRole("radio", { name }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
  await completeStepOne(page);
  for (const name of ["Residential", "Commercial", "Yes", "No", "Buying the property"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
});
