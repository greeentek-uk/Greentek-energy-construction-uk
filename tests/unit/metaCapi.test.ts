import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const settings = { pixelId: "1234567890123", testEventCode: "", consent: "necessary" };
vi.mock("@/lib/db/metaPixel", () => ({ getMetaPixelSettingsCached: vi.fn(async () => settings) }));

import { buildUserData, contextFromRequest, fbcFromUrl, normalizePhone, sendCapiEvent } from "@/lib/metaCapi";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const context = { ip: "1.2.3.4", userAgent: "UA", fbp: "fb.1.1.1", fbc: null };

describe("normalizePhone", () => {
  it.each([
    ["0333 533 4567", "443335334567"],
    ["+44 333 533 4567", "443335334567"],
    ["0044 333 533 4567", "443335334567"],
    ["07700-900123", "447700900123"],
  ])("%s → %s", (input, expected) => expect(normalizePhone(input)).toBe(expected));
});

describe("contextFromRequest", () => {
  it("reads IP, user agent and Meta cookies", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1", "user-agent": "Browser", cookie: "_fbp=fb.1.2.3; _fbc=fb.1.2.abc%3D" },
    });
    expect(contextFromRequest(req)).toEqual({ ip: "9.9.9.9", userAgent: "Browser", fbp: "fb.1.2.3", fbc: "fb.1.2.abc=" });
  });
});

describe("buildUserData", () => {
  it("hashes personal data, never sends it in the clear", () => {
    const data = buildUserData(context, undefined, { email: "  Jo@Example.COM ", phone: "0333 533 4567", fullName: "Jo  Bloggs" });
    expect(data.em).toEqual([sha("jo@example.com")]);
    expect(data.ph).toEqual([sha("443335334567")]);
    expect(data.fn).toEqual([sha("jo")]);
    expect(data.ln).toEqual([sha("bloggs")]);
    expect(data.country).toEqual([sha("gb")]);
    expect(JSON.stringify(data)).not.toMatch(/example\.com|3335334567|bloggs/i);
  });

  it("takes fbc from the ad click id when there's no cookie", () => {
    const data = buildUserData(context, "https://site.test/?fbclid=ABC");
    expect(data.fbc).toMatch(/^fb\.1\.\d+\.ABC$/);
    expect(fbcFromUrl("not a url")).toBeNull();
  });
});

describe("sendCapiEvent", () => {
  beforeEach(() => {
    settings.pixelId = "1234567890123";
    settings.testEventCode = "";
  });

  it("does nothing without an access token", async () => {
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendCapiEvent({ eventName: "PageView", eventId: "abcdefgh", context })).toEqual({ sent: false, reason: "META_CAPI_ACCESS_TOKEN not set" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends one event with the shared id and the test code", async () => {
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "token");
    settings.testEventCode = "TEST1";
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendCapiEvent({
      eventName: "Lead",
      eventId: "event-123456",
      sourceUrl: "https://site.test/",
      context,
      user: { email: "a@b.test" },
      customData: { content_name: "construction_kitchen" },
    });

    expect(result).toEqual({ sent: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://graph.facebook.com/v25.0/1234567890123/events");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ access_token: "token", test_event_code: "TEST1" });
    expect(body.data[0]).toMatchObject({
      event_name: "Lead",
      event_id: "event-123456",
      action_source: "website",
      event_source_url: "https://site.test/",
      custom_data: { content_name: "construction_kitchen" },
    });
  });

  it("never throws when Meta errors or the network fails", async () => {
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 400 })));
    expect(await sendCapiEvent({ eventName: "PageView", eventId: "abcdefgh", context })).toEqual({ sent: false, reason: "HTTP 400" });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await sendCapiEvent({ eventName: "PageView", eventId: "abcdefgh", context })).toEqual({ sent: false, reason: "network error" });
  });
});
