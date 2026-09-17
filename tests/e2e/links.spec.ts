import { test, expect } from "@playwright/test";

/**
 * No broken internal links or images anywhere in the sitemap's pages.
 * Uses plain HTTP requests, so it's fast and loads no trackers.
 */

test("internal links and images all resolve", async ({ request }) => {
  test.setTimeout(10 * 60_000);
  const xml = await (await request.get("/sitemap.xml")).text();
  const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
  expect(pages.length).toBeGreaterThan(10);

  const linkSources = new Map<string, string>();
  const imageSources = new Map<string, string>();
  const decode = (s: string) => s.replace(/&amp;/g, "&");

  for (const path of pages) {
    const html = await (await request.get(path)).text();
    for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = decode(m[1]).split("#")[0];
      if (href.startsWith("/") && !href.startsWith("//") && !linkSources.has(href)) linkSources.set(href, path);
    }
    for (const m of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
      const src = decode(m[1]);
      if (!imageSources.has(src)) imageSources.set(src, path);
    }
  }

  const broken: string[] = [];
  const check = async (url: string, from: string) => {
    // Next's optimiser isn't available under a local `next start` with a
    // custom loader (it is on Vercel), so check the original file instead.
    let target = url;
    if (url.startsWith("/_next/image")) target = new URL(url, "http://x").searchParams.get("url") || url;
    // A raw comma in a static file path 404s under local `next start` but not on
    // Vercel; encoding it checks whether the file itself exists.
    if (target.startsWith("/")) target = encodeURI(decodeURI(target)).replace(/,/g, "%2C");
    const res = await request.get(target, { maxRedirects: 5, timeout: 30_000 }).catch((e) => ({ status: () => `failed: ${e}` }));
    const status = res.status();
    if (typeof status !== "number" || status >= 400) broken.push(`${url} → ${status} (on ${from})`);
  };

  const all = [...linkSources.entries(), ...imageSources.entries()];
  for (let i = 0; i < all.length; i += 8) {
    await Promise.all(all.slice(i, i + 8).map(([url, from]) => check(url, from)));
  }

  test.info().annotations.push({
    type: "checked",
    description: `${pages.length} pages, ${linkSources.size} internal links, ${imageSources.size} images`,
  });
  expect(broken).toEqual([]);
});
