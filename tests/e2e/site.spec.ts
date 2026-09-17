import { test, expect, presetConsent, settle } from "./fixtures";

/** Header, footer and the homepage's interactive sections. */

test.beforeEach(async ({ context, baseURL }) => {
  await presetConsent(context, baseURL);
});

test("header navigation works on this screen size", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    const open = page.getByRole("button", { name: "Open menu" });
    await open.click();
    await expect(page.getByRole("button", { name: "Close menu" }).first()).toBeVisible();
    const nav = page.getByRole("navigation").filter({ has: page.locator('a[href="/contact"]') }).last();
    await nav.locator('a[href="/about"]').first().click();
    await page.waitForURL(/\/about$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  } else {
    const desktopNav = page.locator("nav").first();
    await expect(desktopNav).toBeVisible();
    const services = desktopNav.getByText("Services", { exact: true }).first();
    await services.hover();
    const serviceLink = page.locator('a[href^="/services/"]:visible').first();
    await expect(serviceLink).toBeVisible();
    const href = await serviceLink.getAttribute("href");
    await serviceLink.click();
    await page.waitForURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("footer: WhatsApp, free quote, call and cookie settings", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.locator('a[href^="https://wa.me/"]').first()).toHaveAttribute("href", "https://wa.me/443335334567");
  await expect(footer.locator('a[href^="https://wa.me/"]').first()).toHaveAttribute("target", "_blank");
  await footer.locator('a[href="/contact"]').first().click();
  await page.waitForURL(/\/contact$/);
  await expect(page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" })).toBeVisible();
});

test("homepage: trust badge, finance banner, projects, featured services, FAQs", async ({ page, request }) => {
  await page.goto("/");
  await settle(page);

  const trust = page.locator('a[aria-label*="read the reviews"], [aria-label*="Trustpilot"], a[href*="trustpilot.com"]').first();
  await expect(trust, "Trustpilot badge").toBeVisible();

  const finance = page.locator('a[href="/finance"]').first();
  await expect(finance, "finance banner link").toBeAttached();

  const projectCards = page.locator('a[aria-label^="View "][href^="/projects/"]');
  const count = await projectCards.count();
  // The panel offers 3, 6 or 9; fewer show when fewer projects exist.
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const existing = new Set(sitemap.match(/\/projects\/[a-z0-9-]+/g) ?? []).size;
  expect([3, 6, 9].map((n) => Math.min(n, existing)), `homepage shows ${count} of ${existing} projects`).toContain(count);

  const strip = page.getByRole("region", { name: "Accreditations" }).or(page.locator('[aria-label="Accreditations"]')).first();
  await expect(strip, "accreditation strip").toBeAttached();
  const logoLinks = strip.locator("a[href]:not([aria-hidden])");
  expect(await logoLinks.count()).toBeGreaterThan(0);
  for (const href of await logoLinks.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
    expect(href, "accreditation links are real URLs").toMatch(/^https:\/\//);
  }

  const faqButtons = page.locator("section[aria-labelledby='faq-heading'] button[aria-expanded]");
  if (await faqButtons.count()) {
    const second = faqButtons.nth(1);
    await second.scrollIntoViewIfNeeded();
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
  }
});

test("testimonials slider pauses on hover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "hover is a desktop interaction");
  await page.goto("/");
  const track = page.locator('[style*="animation-play-state"]').first();
  test.skip((await track.count()) === 0, "no testimonials slider on the page");
  // The track is always moving, so Playwright's "wait until stable" never settles.
  await track.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(600); // let the section's fade-in finish
  await expect(track).toHaveCSS("animation-play-state", "running");
  // Move the real mouse onto a card that's currently on screen.
  const point = await track.evaluate((el) => {
    const card = [...el.children].map((c) => c.getBoundingClientRect()).find((r) => r.left > 50 && r.right < window.innerWidth - 50);
    return card ? { x: card.left + card.width / 2, y: card.top + card.height / 2 } : null;
  });
  expect(point, "a review card on screen").toBeTruthy();
  await page.mouse.move(point!.x, point!.y);
  await expect(track).toHaveCSS("animation-play-state", "paused");
});

test("hero heading fits on two lines", async ({ page }) => {
  await page.goto("/");
  const lines = await page.locator("h1").first().evaluate((h1) => {
    const range = document.createRange();
    range.selectNodeContents(h1);
    const tops = new Set([...range.getClientRects()].filter((r) => r.width > 1).map((r) => Math.round(r.top)));
    return tops.size;
  });
  expect(lines).toBe(2);
});
