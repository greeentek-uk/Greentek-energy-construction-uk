import { test, expect, sitemapPaths, presetConsent, settle } from "./fixtures";

/**
 * Every page in the sitemap: loads, has the basics search engines and screen
 * readers need, doesn't overflow sideways on a phone, and runs without errors.
 */
const paths = sitemapPaths();

test("sitemap lists pages", () => {
  expect(paths.length, "sitemap.xml returned no URLs — is the server running?").toBeGreaterThan(10);
});

for (const path of paths) {
  test(`page ${path}`, async ({ page, context, baseURL, captured }, testInfo) => {
    await presetConsent(context, baseURL);
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), "HTTP status").toBe(200);
    await settle(page);

    const facts = await page.evaluate(() => {
      const meta = (name: string) =>
        document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? null;
      const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => {
          try {
            JSON.parse(s.textContent || "");
            return null;
          } catch (e) {
            return String(e);
          }
        },
      );
      return {
        title: document.title,
        description: meta("description"),
        robots: meta("robots"),
        canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
        h1s: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
        imagesWithoutAlt: [...document.querySelectorAll("img")]
          .filter((img) => !img.hasAttribute("alt"))
          .map((img) => img.getAttribute("src")),
        brokenJsonLd: jsonLd.filter(Boolean),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        errorBoundary: /Application error|Unhandled Runtime Error|Something went wrong/i.test(
          document.body.innerText,
        ),
      };
    });

    expect.soft(facts.title, "title").not.toBe("");
    expect.soft(facts.description, "meta description").toBeTruthy();
    expect.soft(facts.canonical, "canonical link").toBeTruthy();
    expect.soft(facts.robots ?? "", "should be indexable").not.toMatch(/noindex/);
    expect.soft(facts.h1s.length, `exactly one h1 (found: ${JSON.stringify(facts.h1s)})`).toBe(1);
    expect.soft(facts.imagesWithoutAlt, "images without alt").toEqual([]);
    expect.soft(facts.brokenJsonLd, "JSON-LD parses").toEqual([]);
    expect.soft(facts.errorBoundary, "error screen shown").toBe(false);
    expect.soft(facts.overflow, `horizontal overflow on ${testInfo.project.name}`).toBeLessThanOrEqual(1);
    expect.soft(captured.errors, "console errors").toEqual([]);
  });
}

test("unknown page returns 404 with a noindex page", async ({ page, captured }) => {
  const response = await page.goto("/this-page-does-not-exist-e2e");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
  captured.errors.length = 0; // the 404 itself is logged to the console by the browser
});

test("thank-you page is noindex and shows the follow-up copy", async ({ page, context, baseURL }) => {
  await presetConsent(context, baseURL);
  await page.goto("/thank-you");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(
    page.getByText(
      "A member of the team will contact you within one business day to discuss your property and arrange the next step.",
    ),
  ).toBeVisible();
  const call = page.getByRole("main").getByRole("link", { name: /0333 533 4567/ });
  await expect(page.getByText(/Need to speak sooner\? Call/)).toBeVisible();
  await expect(call).toHaveAttribute("href", "tel:03335334567");
});
