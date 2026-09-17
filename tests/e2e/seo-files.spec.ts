import { test, expect } from "./fixtures";

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-agent:/i);
  expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i);
  expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
});

test("llms.txt is served as text", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/text\/plain/);
  expect((await res.text()).length).toBeGreaterThan(100);
});

test("sitemap.xml is valid and excludes private pages", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain("<urlset");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(10);
  for (const loc of locs) {
    expect.soft(loc, "absolute https URL").toMatch(/^https:\/\//);
    expect.soft(loc, "no admin/thank-you/api pages").not.toMatch(/\/(admin|thank-you|api)(\/|$)/);
  }
  expect(new Set(locs).size, "no duplicate URLs").toBe(locs.length);
});

test("every response carries a Content-Security-Policy", async ({ request }) => {
  const res = await request.get("/");
  const csp = res.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  for (const host of ["https://connect.facebook.net", "https://*.clarity.ms", "https://www.googletagmanager.com", "https://cdn.livechat-static.com"]) {
    expect.soft(csp, host).toContain(host);
  }
});
