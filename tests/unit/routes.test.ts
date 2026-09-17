import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The public API routes, with every side effect mocked: no email is sent, no
 * database is touched, nothing reaches Cloudinary or Meta.
 */

const mocks = vi.hoisted(() => ({
  sendQuoteRequestEmail: vi.fn(async (_payload: unknown) => {}),
  submitEnquiry: vi.fn(async (): Promise<number | null> => null),
  createSubmittedEnquiry: vi.fn(async () => 41),
  createEnquiry: vi.fn(async () => ({ number: 42, token: "22222222-2222-4222-8222-222222222222" })),
  takeEnquirySignature: vi.fn(async (ref: unknown) => ref as { number: number; token: string } | null),
  takeDailySignature: vi.fn(async () => true),
  claimStaleEnquiry: vi.fn(async () => null),
  metaAllowedForRequest: vi.fn(async () => true),
  sendCapiEvent: vi.fn(async () => ({ sent: true })),
  afterCallbacks: [] as (() => unknown)[],
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => mocks.afterCallbacks.push(fn),
}));
vi.mock("@/lib/mailer", () => ({ sendQuoteRequestEmail: mocks.sendQuoteRequestEmail }));
vi.mock("@/lib/metaConsent", () => ({ metaAllowedForRequest: mocks.metaAllowedForRequest }));
vi.mock("@/lib/metaCapi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/metaCapi")>()),
  sendCapiEvent: mocks.sendCapiEvent,
}));
vi.mock("@/lib/db/enquiries", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/db/enquiries")>();
  return {
    enquiryPhotoFolder: real.enquiryPhotoFolder,
    submitEnquiry: mocks.submitEnquiry,
    createSubmittedEnquiry: mocks.createSubmittedEnquiry,
    createEnquiry: mocks.createEnquiry,
    takeEnquirySignature: mocks.takeEnquirySignature,
    takeDailySignature: mocks.takeDailySignature,
    claimStaleEnquiry: mocks.claimStaleEnquiry,
  };
});
vi.mock("@/lib/cloudinary", () => ({
  signUploadParams: vi.fn(() => "signed"),
  deleteFolder: vi.fn(async () => {}),
}));
vi.mock("@/lib/db/metaPixel", () => ({ getMetaPixelSettingsCached: vi.fn(async () => ({ pixelId: "1", testEventCode: "", consent: "necessary" })) }));

const json = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://site.test${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  mocks.afterCallbacks.length = 0;
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "democloud");
  vi.stubEnv("CLOUDINARY_API_KEY", "key");
  vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
  for (const fn of Object.values(mocks)) if (typeof fn === "function" && "mockClear" in fn) fn.mockClear();
  mocks.submitEnquiry.mockImplementation(async () => null);
  mocks.takeDailySignature.mockImplementation(async () => true);
  mocks.takeEnquirySignature.mockImplementation(async (ref: unknown) => ref as never);
  mocks.metaAllowedForRequest.mockImplementation(async () => true);
});

describe("POST /api/quote-request", async () => {
  const { POST } = await import("@/app/api/quote-request/route");
  const valid = {
    full_name: "Jo Bloggs",
    email: "jo@example.com",
    phone: "07700900123",
    postcode: "WV1 1AA",
    service: "construction_kitchen",
    budget: "guidance",
    timeline: "asap",
    is_homeowner: "buying",
    consent: true,
  };
  const enquiry = { number: 7, token: "11111111-1111-4111-8111-111111111111" };
  const photo = (folder: string, name = "abc123", ext = "jpg") =>
    `https://res.cloudinary.com/democloud/image/upload/v1712345678/${folder}/${name}.${ext}`;

  it.each(["full_name", "email", "phone", "postcode", "service"])("requires %s", async (field) => {
    const res = await POST(json("/api/quote-request", { ...valid, [field]: " " }));
    expect(res.status).toBe(400);
    expect(mocks.sendQuoteRequestEmail).not.toHaveBeenCalled();
  });

  it("requires consent", async () => {
    const res = await POST(json("/api/quote-request", { ...valid, consent: false }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid JSON", async () => {
    expect((await POST(json("/api/quote-request", "{"))).status).toBe(400);
  });

  it("numbers an enquiry without photos and emails every field", async () => {
    const res = await POST(json("/api/quote-request", valid));
    expect(res.status).toBe(200);
    expect(mocks.createSubmittedEnquiry).toHaveBeenCalledOnce();
    expect(mocks.sendQuoteRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({ enquiry_number: 41, budget: "guidance", is_homeowner: "buying", photos: [] }),
    );
  });

  it("keeps only photos from this enquiry's own folder, de-duplicated, max five", async () => {
    mocks.submitEnquiry.mockImplementation(async () => 7);
    const own = "enquiry-photos/00007";
    const photos = [
      photo(own, "a"), photo(own, "a"), photo(own, "b"), photo(own, "c"), photo(own, "d"), photo(own, "e"), photo(own, "f"),
      photo("enquiry-photos/00008", "other"),
      photo("greentek", "logo"),
      photo(own, "g", "png"),
      "https://evil.test/enquiry-photos/00007/a.jpg",
      `https://res.cloudinary.com/othercloud/image/upload/${own}/x.jpg`,
      42,
    ];
    await POST(json("/api/quote-request", { ...valid, enquiry, photos }));
    const sent = mocks.sendQuoteRequestEmail.mock.calls[0][0] as { photos: string[]; enquiry_number: number };
    expect(sent.enquiry_number).toBe(7);
    expect(sent.photos).toEqual([photo(own, "a"), photo(own, "b"), photo(own, "c"), photo(own, "d"), photo(own, "e")]);
  });

  it("drops photos and gives a new number when the enquiry reference isn't valid", async () => {
    await POST(json("/api/quote-request", { ...valid, enquiry, photos: [photo("enquiry-photos/00007")] }));
    const sent = mocks.sendQuoteRequestEmail.mock.calls[0][0] as { photos: string[]; enquiry_number: number };
    expect(sent.enquiry_number).toBe(41);
    expect(sent.photos).toEqual([]);
  });

  it("returns 500 if the email can't be sent, and reports no Lead", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.sendQuoteRequestEmail.mockImplementationOnce(async () => { throw new Error("smtp"); });
    const res = await POST(json("/api/quote-request", { ...valid, event_id: "event-12345678" }));
    expect(res.status).toBe(500);
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("reports the Lead to Meta after responding, with hashed-to-be contact details", async () => {
    await POST(json("/api/quote-request", { ...valid, event_id: "event-12345678", page_url: "https://site.test/" }));
    expect(mocks.afterCallbacks).toHaveLength(1);
    await mocks.afterCallbacks[0]();
    expect(mocks.sendCapiEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "Lead", eventId: "event-12345678", user: { email: valid.email, phone: valid.phone, fullName: valid.full_name } }),
    );
  });

  it("sends no Lead without a valid event id or when Meta isn't allowed", async () => {
    await POST(json("/api/quote-request", { ...valid, event_id: "<bad>" }));
    mocks.metaAllowedForRequest.mockImplementation(async () => false);
    await POST(json("/api/quote-request", { ...valid, event_id: "event-12345678" }));
    expect(mocks.afterCallbacks).toHaveLength(0);
  });
});

describe("POST /api/quote-upload", async () => {
  const { POST } = await import("@/app/api/quote-upload/route");
  let ip = 0;
  const call = (body: unknown = {}) => POST(json("/api/quote-upload", body, { "x-forwarded-for": `10.0.0.${++ip}` }));

  it("opens a numbered enquiry and signs a locked-down upload", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.enquiry).toEqual({ number: 42, token: expect.any(String) });
    expect(body.params).toEqual({
      timestamp: expect.any(Number),
      folder: "enquiry-photos/00042",
      allowed_formats: "jpg,jpeg,png,heic,heif",
      transformation: "c_limit,w_2000,h_2000,q_auto:good,f_jpg",
      tags: "enquiry",
    });
    expect(body.params).not.toHaveProperty("format");
    expect(body.signature).toBe("signed");
  });

  it("reuses the enquiry for later photos", async () => {
    const ref = { number: 42, token: "22222222-2222-4222-8222-222222222222" };
    const body = await (await call({ enquiry: ref })).json();
    expect(mocks.createEnquiry).not.toHaveBeenCalled();
    expect(body.params.folder).toBe("enquiry-photos/00042");
  });

  it("refuses once an enquiry has used its uploads (or was already sent)", async () => {
    mocks.takeEnquirySignature.mockImplementation(async () => null);
    const res = await call({ enquiry: { number: 42, token: "22222222-2222-4222-8222-222222222222" } });
    expect(res.status).toBe(429);
  });

  it("refuses when the site's daily cap is reached", async () => {
    mocks.takeDailySignature.mockImplementation(async () => false);
    expect((await call()).status).toBe(429);
  });

  it("limits repeated requests from one visitor", async () => {
    const statuses = [];
    for (let i = 0; i < 25; i++) {
      statuses.push((await POST(json("/api/quote-upload", {}, { "x-forwarded-for": "203.0.113.9" }))).status);
    }
    expect(statuses.slice(0, 20).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(20)).toEqual([429, 429, 429, 429, 429]);
  });

  it("is unavailable, not broken, when Cloudinary isn't configured", async () => {
    vi.stubEnv("CLOUDINARY_API_SECRET", "");
    expect((await call()).status).toBe(503);
  });
});

describe("POST /api/track", async () => {
  const { POST } = await import("@/app/api/track/route");

  it("relays allowed events with only safe custom data", async () => {
    const res = await POST(json("/api/track", {
      event_name: "ViewContent",
      event_id: "event-12345678",
      event_source_url: "https://site.test/services/x",
      custom_data: { content_name: "Solar", email: "leak@example.com", content_ids: ["a", 1, "b"] },
    }));
    expect(res.status).toBe(200);
    await mocks.afterCallbacks[0]();
    expect(mocks.sendCapiEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "ViewContent", customData: { content_name: "Solar", content_ids: ["a", "b"] } }),
    );
  });

  it("refuses Lead, unknown events and bad ids", async () => {
    for (const body of [
      { event_name: "Lead", event_id: "event-12345678" },
      { event_name: "Purchase", event_id: "event-12345678" },
      { event_name: "PageView", event_id: "x" },
    ]) {
      expect((await POST(json("/api/track", body))).status).toBe(400);
    }
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("sends nothing when the visitor's consent doesn't allow Meta", async () => {
    mocks.metaAllowedForRequest.mockImplementation(async () => false);
    const res = await POST(json("/api/track", { event_name: "PageView", event_id: "event-12345678" }));
    expect(await res.json()).toMatchObject({ skipped: "consent" });
    expect(mocks.afterCallbacks).toHaveLength(0);
  });
});
