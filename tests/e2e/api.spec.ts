import { test, expect } from "@playwright/test";

/**
 * Public API endpoints, called directly (no browser fakes). Only requests that
 * are rejected before any side effect are sent: nothing here emails, uploads
 * or writes enquiries.
 */

test.describe("/api/track", () => {
  const post = (request: import("@playwright/test").APIRequestContext, data: unknown) =>
    request.post("/api/track", { data });

  test("accepts a page view", async ({ request }) => {
    const res = await post(request, { event_name: "PageView", event_id: "e2e-00000001", event_source_url: "http://localhost/" });
    expect(res.status()).toBe(200);
  });

  test("refuses Lead — only the enquiry endpoint may report leads", async ({ request }) => {
    expect((await post(request, { event_name: "Lead", event_id: "e2e-00000002" })).status()).toBe(400);
  });

  test("refuses unknown events and malformed ids", async ({ request }) => {
    expect((await post(request, { event_name: "Purchase", event_id: "e2e-00000003" })).status()).toBe(400);
    expect((await post(request, { event_name: "PageView", event_id: "<script>" })).status()).toBe(400);
    expect((await post(request, { event_name: "PageView", event_id: "short" })).status()).toBe(400);
  });

  test("refuses a body that isn't JSON", async ({ request }) => {
    const res = await request.post("/api/track", { data: "not json", headers: { "content-type": "application/json" } });
    expect(res.status()).toBe(400);
  });
});

test.describe("/api/quote-request", () => {
  test("rejects missing fields before doing anything", async ({ request }) => {
    const res = await request.post("/api/quote-request", { data: { full_name: "x" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/Missing required field/);
  });

  test("rejects an enquiry without consent", async ({ request }) => {
    const res = await request.post("/api/quote-request", {
      data: { full_name: "x", email: "x@example.com", phone: "0", postcode: "B1 1AA", service: "construction_kitchen", consent: false },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/Consent/);
  });

  test("rejects invalid JSON", async ({ request }) => {
    const res = await request.post("/api/quote-request", { data: "{", headers: { "content-type": "application/json" } });
    expect(res.status()).toBe(400);
  });
});

test("/api/revalidate requires the shared secret", async ({ request }) => {
  const res = await request.post("/api/revalidate", { data: { targets: [{ path: "/" }] } });
  expect([401, 503]).toContain(res.status());
});

test("/api/quote-upload only accepts POST", async ({ request }) => {
  expect((await request.get("/api/quote-upload")).status()).toBe(405);
});

test("admin pages redirect to the login when signed out", async ({ request }) => {
  for (const path of ["/admin", "/admin/scripts", "/admin/page-content"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(res.headers().location, path).toMatch(/\/admin\/login\?next=/);
  }
});
