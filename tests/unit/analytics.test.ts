// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@microsoft/clarity", () => ({ default: { event: vi.fn() } }));
import Clarity from "@microsoft/clarity";
import { configureAnalytics, isAdminPath, metaAllowed, setAdsUserData, track } from "@/lib/analytics";
import { writeConsent } from "@/lib/consent";

type Queue = { queue: IArguments[] };

beforeEach(() => {
  document.cookie = "gt_consent=; Max-Age=0; Path=/";
  document.head.innerHTML = "";
  delete (window as { fbq?: unknown }).fbq;
  delete (window as { _fbq?: unknown })._fbq;
  delete (window as { gtag?: unknown }).gtag;
  delete (window as { clarity?: unknown }).clarity;
  vi.mocked(Clarity.event).mockClear();
  Object.defineProperty(navigator, "sendBeacon", { value: vi.fn(() => true), configurable: true });
});

describe("Meta consent gate", () => {
  it("runs for everyone when the owner set Meta as necessary", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: false });
    expect(metaAllowed()).toBe(true);
  });

  it("waits for marketing consent when set to marketing", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: true });
    expect(metaAllowed()).toBe(false);
    writeConsent({ analytics: true, marketing: false });
    expect(metaAllowed()).toBe(false);
    writeConsent({ analytics: false, marketing: true });
    expect(metaAllowed()).toBe(true);
  });

  it("is off with no pixel id", () => {
    configureAnalytics({ pixelId: "", pixelNeedsConsent: false });
    expect(metaAllowed()).toBe(false);
  });
});

describe("track", () => {
  it("queues the pixel event with a shared id and relays it to the server", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: false });
    const id = track("StartQuote", { content_name: "Homepage hero" });
    const calls = (window.fbq as unknown as Queue).queue.map((a) => Array.from(a));
    expect(calls).toContainEqual(["init", "123"]);
    expect(calls).toContainEqual(["trackCustom", "StartQuote", { content_name: "Homepage hero" }, { eventID: id }]);
    expect(navigator.sendBeacon).toHaveBeenCalledOnce();
  });

  it("uses track for standard events and skips the relay when asked", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: false });
    track("Lead", {}, { eventId: "fixed-id-123", server: false });
    const calls = (window.fbq as unknown as Queue).queue.map((a) => Array.from(a));
    expect(calls).toContainEqual(["track", "Lead", {}, { eventID: "fixed-id-123" }]);
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });

  it("sends GA4 events whatever the choice (Consent Mode advanced), Clarity only with consent", () => {
    configureAnalytics({ pixelId: "", pixelNeedsConsent: false });
    const gtag = vi.fn();
    Object.assign(window, { gtag, clarity: () => {} });

    // No choice yet: the Google tag's denied defaults make this a cookieless ping.
    track("Contact", { content_name: "phone" });
    expect(gtag).toHaveBeenCalledWith("event", "contact", { method: "phone" });
    expect(Clarity.event).not.toHaveBeenCalled();
    gtag.mockClear();

    writeConsent({ analytics: true, marketing: false });
    track("Contact", { content_name: "phone" });
    track("ViewContent", { content_name: "Solar", content_category: "energy" });
    expect(gtag).toHaveBeenCalledWith("event", "contact", { method: "phone" });
    expect(gtag).toHaveBeenCalledWith("event", "view_service", { item_name: "Solar", item_category: "energy" });
    expect(Clarity.event).toHaveBeenCalledWith("Contact");
    expect(Clarity.event).toHaveBeenCalledTimes(1); // page and content views aren't tagged in Clarity
  });
});

describe("Google Ads in Consent Mode advanced mode", () => {
  it("sends conversions without consent, but the visitor's email and phone only with marketing consent", () => {
    configureAnalytics({
      pixelId: "",
      pixelNeedsConsent: false,
      googleAds: { conversionId: "AW-123456789", leadLabel: "leadLabel1", callLabel: "callLabel1", whatsappLabel: "" },
    });
    const gtag = vi.fn();
    Object.assign(window, { gtag });
    writeConsent({ analytics: false, marketing: false });

    track("Lead", { content_name: "energy_heat_pump" }, { eventId: "evt-12345678" });
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-123456789/leadLabel1", transaction_id: "evt-12345678" });

    setAdsUserData({ email: "jo@example.com", phone: "07700900123" });
    expect(gtag).not.toHaveBeenCalledWith("set", "user_data", expect.anything());

    writeConsent({ analytics: false, marketing: true });
    setAdsUserData({ email: "jo@example.com", phone: "07700900123" });
    expect(gtag).toHaveBeenCalledWith("set", "user_data", { email: "jo@example.com", phone_number: "+447700900123" });
  });
});

describe("the admin panel is never tracked", () => {
  function goTo(pathname: string) {
    window.history.replaceState({}, "", pathname);
  }

  it("recognises admin paths, and only those", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/blog/my-post")).toBe(true);
    // Not a public page that merely starts with the same letters.
    expect(isAdminPath("/administration-services")).toBe(false);
    expect(isAdminPath("/")).toBe(false);
    expect(isAdminPath("/services/loft-insulation")).toBe(false);
  });

  it("sends nothing at all from an admin page", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: false });
    writeConsent({ analytics: true, marketing: true });
    window.gtag = vi.fn();
    (window as { clarity?: unknown }).clarity = {};

    goTo("/admin/services");
    track("PageView");
    track("Contact", { content_name: "phone" });

    // No pixel, no GA event, no Clarity tag, no server relay.
    expect(window.fbq).toBeUndefined();
    expect(window.gtag).not.toHaveBeenCalled();
    expect(Clarity.event).not.toHaveBeenCalled();
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });

  it("still tracks the public site", () => {
    configureAnalytics({ pixelId: "123", pixelNeedsConsent: false });
    writeConsent({ analytics: true, marketing: true });

    goTo("/services/loft-insulation");
    track("PageView");

    expect(window.fbq).toBeDefined();
    expect(navigator.sendBeacon).toHaveBeenCalled();
  });
});
