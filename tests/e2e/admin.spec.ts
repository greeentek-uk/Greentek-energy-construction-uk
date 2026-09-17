import { createHmac } from "node:crypto";
import { test, expect } from "./fixtures";

/**
 * The admin panel, read-only: logs in, then opens every panel page reachable
 * from the navigation and list pages. No form is submitted, so nothing in the
 * database or on the live site changes.
 */

function sessionToken(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const payload = `${process.env.ADMIN_USERNAME || "admin"}.${Date.now() + 60 * 60 * 1000}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

test("login rejects wrong credentials", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill("not-the-admin");
  await page.locator('input[name="password"]').fill("wrong-password");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/login\?error=1/);
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("login with the real credentials opens the dashboard", async ({ page }) => {
  test.skip(!process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD not set");
  await page.goto("/admin/login?next=/admin/scripts");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME || "admin");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/scripts$/);
  await expect(page.getByRole("heading", { name: /Scripts/ })).toBeVisible();
});

test("every admin page opens without errors", async ({ page, context, baseURL, captured }) => {
  test.setTimeout(10 * 60_000);
  const token = sessionToken();
  test.skip(!token, "ADMIN_SESSION_SECRET not set");
  await context.addCookies([{ name: "admin_session", value: token!, url: baseURL! }]);

  const queue = ["/admin"];
  const seen = new Set<string>();
  const failures: string[] = [];

  while (queue.length && seen.size < 150) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);

    captured.errors.length = 0;
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    const status = res?.status() ?? 0;
    const body = await page.locator("body").innerText();
    if (status >= 400) failures.push(`${path}: HTTP ${status}`);
    else if (!page.url().includes("/admin") || page.url().includes("/admin/login")) failures.push(`${path}: bounced to ${page.url()}`);
    else if (/Application error|Unhandled Runtime Error|This page couldn’t load/i.test(body)) failures.push(`${path}: error screen`);
    if (captured.errors.length) failures.push(`${path}: ${captured.errors.join(" | ")}`);

    const links = await page.$$eval("a[href^='/admin']", (as) => as.map((a) => a.getAttribute("href")!));
    for (const href of links) {
      const clean = href.split("#")[0];
      // Only pages: skip anything that looks like an action.
      if (/logout|delete|remove|restore|export/i.test(clean)) continue;
      if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
    }
  }

  test.info().annotations.push({ type: "admin pages visited", description: String(seen.size) });
  expect(seen.size, "reached the panel's pages").toBeGreaterThan(15);
  expect(failures).toEqual([]);
});
