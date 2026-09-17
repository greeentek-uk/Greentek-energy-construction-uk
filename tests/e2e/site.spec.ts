import { test, expect, presetConsent, settle, waitForHydration } from "./fixtures";

/** Header, footer and the homepage's interactive sections. */

test.beforeEach(async ({ context, baseURL }) => {
  await presetConsent(context, baseURL);
});

test("header navigation works on this screen size", async ({ page }, testInfo) => {
  await page.goto("/");
  await settle(page);
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
  await settle(page);
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

/** Current horizontal position of the testimonials track, in px. */
const trackX = (page: import("@playwright/test").Page) =>
  page.getByTestId("testimonials-marquee").locator("> div").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

async function showTestimonials(page: import("@playwright/test").Page) {
  const marquee = page.getByTestId("testimonials-marquee");
  await waitForHydration(page, '[data-testid="testimonials-marquee"]');
  // The site scrolls smoothly, so jump instead and wait until it has stopped
  // moving — otherwise the pointer lands where the slider was mid-scroll.
  await marquee.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await expect.poll(async () => {
    const a = (await marquee.boundingBox())!.y;
    await page.waitForTimeout(150);
    return Math.abs((await marquee.boundingBox())!.y - a);
  }).toBeLessThan(1);
  await page.waitForTimeout(600); // let the section's fade-in finish
  const box = (await marquee.boundingBox())!;
  return { marquee, box };
}

test("testimonials scroll on their own and pause while hovered", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "hover is a desktop interaction");
  await page.goto("/");
  const { marquee, box } = await showTestimonials(page);

  const a = await trackX(page);
  await page.waitForTimeout(500);
  expect(await trackX(page), "moves by itself").toBeLessThan(a - 2);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(150);
  const held = await trackX(page);
  await page.waitForTimeout(500);
  expect(Math.abs((await trackX(page)) - held), "paused while hovered").toBeLessThan(1);

  await page.mouse.move(box.x + box.width / 2, box.y - 200);
  await page.waitForTimeout(500);
  expect(await trackX(page), "resumes when the pointer leaves").toBeLessThan(held - 2);
  await expect(marquee).not.toHaveAttribute("data-stopped", /.*/);
});

test("testimonials can be dragged with a mouse, then stay put", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "mouse drag");
  await page.goto("/");
  const { marquee, box } = await showTestimonials(page);
  const y = box.y + box.height / 2;
  const x = box.x + box.width / 2;

  const pages: string[] = [];
  context.on("page", (p) => pages.push(p.url()));

  await page.mouse.move(x, y);
  await page.mouse.down();
  const before = await trackX(page);
  for (let i = 1; i <= 10; i++) await page.mouse.move(x - i * 30, y);
  const dragged = await trackX(page);
  await page.mouse.up();

  // The strip loops, so compare the distance moved modulo one loop.
  const loop = await marquee.locator("> div").evaluate((el) => el.scrollWidth / 2);
  const moved = (((dragged - before) % loop) + loop) % loop;
  const expected = ((-300 % loop) + loop) % loop;
  expect(Math.abs(moved - expected), "follows the pointer").toBeLessThan(40);
  await expect(marquee).toHaveAttribute("data-stopped", "true");

  // Moving away doesn't restart it.
  await page.mouse.move(x, box.y - 200);
  await page.waitForTimeout(700);
  expect(Math.abs((await trackX(page)) - dragged), "stays where it was left").toBeLessThan(1);
  expect(pages, "releasing a drag over a review doesn't open it").toEqual([]);
});

test("testimonials can be swiped on a phone, then stay put", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "touch swipe");
  await page.goto("/");
  const { marquee, box } = await showTestimonials(page);
  const cdp = await page.context().newCDPSession(page);
  const y = box.y + box.height / 2;
  const x = box.x + box.width * 0.8;
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", px: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x: px, y }],
    });

  await touch("touchStart", x);
  for (let i = 1; i <= 8; i++) await touch("touchMove", x - i * 25);
  const swiped = await trackX(page);
  await touch("touchEnd", x - 200);

  await expect(marquee).toHaveAttribute("data-stopped", "true");
  await page.waitForTimeout(700);
  expect(Math.abs((await trackX(page)) - swiped)).toBeLessThan(1);
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
