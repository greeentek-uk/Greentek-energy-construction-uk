// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_MODE_DEFAULTS_SCRIPT,
  CONSENT_VERSION,
  clearTrackingCookies,
  consentFromCookieHeader,
  parseConsent,
  readConsent,
  serializeConsent,
  writeConsent,
} from "@/lib/consent";

function clearCookies() {
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

describe("consent cookie format", () => {
  it("round-trips every combination", () => {
    for (const analytics of [true, false]) {
      for (const marketing of [true, false]) {
        expect(parseConsent(serializeConsent({ analytics, marketing }))).toEqual({ analytics, marketing });
      }
    }
  });

  it("uses the documented shape", () => {
    expect(serializeConsent({ analytics: true, marketing: false })).toBe(`${CONSENT_VERSION}.a1.m0`);
  });

  it("rejects other versions and junk, so visitors are asked again", () => {
    expect(parseConsent(`${CONSENT_VERSION + 1}.a1.m1`)).toBeNull();
    expect(parseConsent("yes")).toBeNull();
    expect(parseConsent("1.a2.m0")).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });

  it("reads the choice from a request Cookie header", () => {
    expect(consentFromCookieHeader(`_ga=GA1; ${CONSENT_COOKIE}=1.a0.m1; other=x`)).toEqual({
      analytics: false,
      marketing: true,
    });
    expect(consentFromCookieHeader("_ga=GA1")).toBeNull();
    expect(consentFromCookieHeader(null)).toBeNull();
  });
});

describe("in the browser", () => {
  beforeEach(clearCookies);

  it("writes and reads the cookie", () => {
    expect(readConsent()).toBeNull();
    writeConsent({ analytics: true, marketing: false });
    expect(readConsent()).toEqual({ analytics: true, marketing: false });
  });

  it("clears tracker cookies but leaves others", () => {
    document.cookie = "_ga=GA1.1.1; Path=/";
    document.cookie = "_ga_ABC123=GS1; Path=/";
    document.cookie = "_clck=x; Path=/";
    document.cookie = "_fbp=fb.1; Path=/";
    document.cookie = "keep_me=1; Path=/";
    clearTrackingCookies();
    expect(document.cookie).toContain("keep_me=1");
    expect(document.cookie).not.toMatch(/_ga|_clck|_fbp/);
  });

  it("Consent Mode defaults follow the stored choice", () => {
    const run = () => {
      const w = window as unknown as { dataLayer?: IArguments[] };
      w.dataLayer = [];
      new Function(CONSENT_MODE_DEFAULTS_SCRIPT)();
      const call = Array.from(w.dataLayer![0]);
      expect(call.slice(0, 2)).toEqual(["consent", "default"]);
      return call[2] as Record<string, string>;
    };

    expect(run()).toMatchObject({ analytics_storage: "denied", ad_storage: "denied" });
    writeConsent({ analytics: true, marketing: false });
    expect(run()).toMatchObject({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied" });
    writeConsent({ analytics: false, marketing: true });
    expect(run()).toMatchObject({ analytics_storage: "denied", ad_storage: "granted", ad_personalization: "granted" });
  });
});
